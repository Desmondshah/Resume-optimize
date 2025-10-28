import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Upload a resume
export const uploadResume = mutation({
  args: {
    originalText: v.string(),
    fileName: v.string(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const resumeId = await ctx.db.insert("resumes", {
      userId,
      originalText: args.originalText,
      fileName: args.fileName,
      fileType: args.fileType,
      uploadedAt: Date.now(),
    });

    return resumeId;
  },
});

// Get all resumes for the current user
export const getUserResumes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return resumes;
  },
});

// Get a specific resume
export const getResume = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const resume = await ctx.db.get(args.resumeId);
    if (resume?.userId !== userId) {
      return null;
    }

    return resume;
  },
});

// Save a job description
export const saveJobDescription = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    qualifications: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const jobDescriptionId = await ctx.db.insert("jobDescriptions", {
      userId,
      title: args.title,
      description: args.description,
      qualifications: args.qualifications,
      createdAt: Date.now(),
    });

    return jobDescriptionId;
  },
});

// Get all job descriptions for the current user
export const getUserJobDescriptions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const jobDescriptions = await ctx.db
      .query("jobDescriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return jobDescriptions;
  },
});

// Save an optimized resume
export const saveOptimizedResume = mutation({
  args: {
    resumeId: v.id("resumes"),
    jobDescriptionId: v.optional(v.id("jobDescriptions")),
    optimizedText: v.string(),
    optimizationType: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const optimizedResumeId = await ctx.db.insert("optimizedResumes", {
      userId,
      resumeId: args.resumeId,
      jobDescriptionId: args.jobDescriptionId,
      optimizedText: args.optimizedText,
      optimizationType: args.optimizationType,
      createdAt: Date.now(),
    });

    return optimizedResumeId;
  },
});

// Get optimized resumes for a specific resume
export const getOptimizedResumes = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const optimizedResumes = await ctx.db
      .query("optimizedResumes")
      .withIndex("by_resume", (q) => q.eq("resumeId", args.resumeId))
      .order("desc")
      .collect();

    return optimizedResumes.filter((r) => r.userId === userId);
  },
});

// Track a job application
export const trackApplication = mutation({
  args: {
    resumeId: v.id("resumes"),
    optimizedResumeId: v.optional(v.id("optimizedResumes")),
    jobDescriptionId: v.optional(v.id("jobDescriptions")),
    companyName: v.string(),
    jobTitle: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const applicationId = await ctx.db.insert("applications", {
      userId,
      resumeId: args.resumeId,
      optimizedResumeId: args.optimizedResumeId,
      jobDescriptionId: args.jobDescriptionId,
      companyName: args.companyName,
      jobTitle: args.jobTitle,
      status: args.status,
      appliedDate: Date.now(),
      notes: args.notes,
    });

    return applicationId;
  },
});

// Update application status
export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const application = await ctx.db.get(args.applicationId);
    if (application?.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      notes: args.notes,
    });
  },
});

// Get all applications for the user
export const getUserApplications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return applications;
  },
});

// Get application statistics
export const getApplicationStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const stats = {
      total: applications.length,
      applied: applications.filter(a => a.status === "applied").length,
      interviewing: applications.filter(a => a.status === "interviewing").length,
      offers: applications.filter(a => a.status === "offer").length,
      rejected: applications.filter(a => a.status === "rejected").length,
      accepted: applications.filter(a => a.status === "accepted").length,
      successRate: applications.length > 0 
        ? ((applications.filter(a => a.status === "offer" || a.status === "accepted").length / applications.length) * 100).toFixed(1)
        : "0",
      interviewRate: applications.length > 0
        ? ((applications.filter(a => a.status === "interviewing" || a.status === "offer" || a.status === "accepted").length / applications.length) * 100).toFixed(1)
        : "0",
    };

    return stats;
  },
});
