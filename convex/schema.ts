import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  resumes: defineTable({
    userId: v.string(),
    originalText: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    uploadedAt: v.number(),
  }).index("by_user", ["userId"]),

  jobDescriptions: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    qualifications: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  optimizedResumes: defineTable({
    userId: v.string(),
    resumeId: v.id("resumes"),
    jobDescriptionId: v.optional(v.id("jobDescriptions")),
    optimizedText: v.string(),
    optimizationType: v.string(), // "ats-formatting" or "job-tailored"
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_resume", ["resumeId"]),

  applications: defineTable({
    userId: v.string(),
    resumeId: v.id("resumes"),
    optimizedResumeId: v.optional(v.id("optimizedResumes")),
    jobDescriptionId: v.optional(v.id("jobDescriptions")),
    companyName: v.string(),
    jobTitle: v.string(),
    status: v.string(), // "applied", "interviewing", "offer", "rejected", "accepted", "withdrawn"
    appliedDate: v.number(),
    notes: v.optional(v.string()),
    followUpDate: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["userId", "status"])
    .index("by_date", ["userId", "appliedDate"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
