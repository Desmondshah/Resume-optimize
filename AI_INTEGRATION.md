# Adding AI Capabilities to Resume Super Optimizer

This guide shows you how to enhance the Resume Super Optimizer with real AI capabilities using OpenAI, Claude, or other AI services.

## Option 1: OpenAI Integration (GPT-4)

### Step 1: Install OpenAI SDK

```bash
npm install openai
```

### Step 2: Add API Key to Convex

Create a `.env.local` file in your project root:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

Or add it through Convex dashboard: https://dashboard.convex.dev

### Step 3: Create AI Action in Convex

Create `convex/ai.ts`:

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

export const optimizeResumeWithAI = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.optional(v.string()),
    optimizationType: v.string(), // "ats" or "job-tailored"
  },
  handler: async (ctx, args) => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let systemPrompt = "";
    let userPrompt = "";

    if (args.optimizationType === "ats") {
      systemPrompt = `You are an expert ATS (Applicant Tracking System) optimization specialist. 
Your job is to reformat resumes to be ATS-friendly while preserving all important information.

Key rules:
- Remove all tables, columns, and complex formatting
- Use standard section headers: PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS
- Replace special bullets with standard dashes or asterisks
- Ensure consistent spacing
- Keep the content professional and concise
- Add keywords relevant to the candidate's field
- Quantify achievements where possible`;

      userPrompt = `Please optimize this resume for ATS compatibility:\n\n${args.resumeText}`;
    } else {
      systemPrompt = `You are an expert resume writer specializing in tailoring resumes to specific job postings.
Your job is to optimize resumes to match job descriptions while maintaining truthfulness.

Key tasks:
- Extract key skills and requirements from the job description
- Highlight relevant experience from the resume
- Suggest rewording to incorporate job keywords naturally
- Recommend which experiences to emphasize
- Suggest a tailored professional summary
- Maintain the candidate's authentic experience`;

      userPrompt = `Please optimize this resume for the following job posting:

JOB DESCRIPTION:
${args.jobDescription || "No job description provided"}

RESUME:
${args.resumeText}

Provide:
1. Key skills/keywords from the job description
2. Suggested resume modifications
3. A tailored professional summary
4. Specific bullet point improvements`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "No optimization generated";
  },
});

export const extractKeywords = action({
  args: {
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Extract the most important keywords, skills, and qualifications from job descriptions. Return as a JSON array.",
        },
        {
          role: "user",
          content: args.jobDescription,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "[]";
  },
});

export const generateCoverLetter = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.string(),
    companyName: v.string(),
  },
  handler: async (ctx, args) => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert cover letter writer. Write compelling, professional cover letters that highlight relevant experience.",
        },
        {
          role: "user",
          content: `Write a cover letter for ${args.companyName} based on:

RESUME:
${args.resumeText}

JOB DESCRIPTION:
${args.jobDescription}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "";
  },
});
```

### Step 4: Update ResumeOptimizer Component

Update `src/components/ResumeOptimizer.tsx` to use the AI action:

```typescript
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

// Inside the component
const optimizeWithAI = useAction(api.ai.optimizeResumeWithAI);

const handleOptimizeWithAI = async () => {
  setIsOptimizing(true);
  try {
    const result = await optimizeWithAI({
      resumeText: resume.originalText,
      jobDescription: selectedJob?.description,
      optimizationType: optimizationType === "ats" ? "ats" : "job-tailored",
    });
    
    setOptimizedText(result);
    toast.success("Resume optimized with AI!");
  } catch (error) {
    toast.error("AI optimization failed");
    console.error(error);
  } finally {
    setIsOptimizing(false);
  }
};
```

## Option 2: Claude (Anthropic) Integration

### Step 1: Install Anthropic SDK

```bash
npm install @anthropic-ai/sdk
```

### Step 2: Create Claude Action

Create `convex/claude.ts`:

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

export const optimizeWithClaude = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Optimize this resume for ATS and job matching:\n\nResume:\n${args.resumeText}\n\nJob Description:\n${args.jobDescription || "General optimization"}`,
        },
      ],
    });

    return message.content[0].text;
  },
});
```

## Option 3: Local AI with Ollama (Free!)

### Step 1: Install Ollama

Download from: https://ollama.ai

### Step 2: Pull a Model

```bash
ollama pull llama2
```

### Step 3: Create Ollama Action

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";

export const optimizeWithOllama = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama2",
        prompt: `Optimize this resume:\n\n${args.resumeText}`,
        stream: false,
      }),
    });

    const data = await response.json();
    return data.response;
  },
});
```

## Option 4: Hybrid Approach (Rule-Based + AI)

Combine the existing rule-based optimization with AI for best results:

```typescript
export const hybridOptimize = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Step 1: Apply rule-based formatting (existing code)
    let optimized = args.resumeText;
    optimized = optimized.replace(/[•◦▪]/g, "-");
    optimized = optimized.replace(/\|/g, " ");
    optimized = optimized.replace(/\n{3,}/g, "\n\n");

    // Step 2: Use AI to enhance content
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Enhance resume content while preserving formatting. Focus on action verbs, quantifiable achievements, and keyword optimization.",
        },
        {
          role: "user",
          content: `Enhance this pre-formatted resume:\n\n${optimized}\n\nJob context: ${args.jobDescription || "General"}`,
        },
      ],
    });

    return response.choices[0].message.content;
  },
});
```

## Advanced Features to Add

### 1. Resume Scoring

```typescript
export const scoreResume = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Score resumes from 0-100 based on match to job description. Provide detailed breakdown.",
        },
        {
          role: "user",
          content: `Score this resume against this job:\n\nResume:\n${args.resumeText}\n\nJob:\n${args.jobDescription}`,
        },
      ],
    });

    return response.choices[0].message.content;
  },
});
```

### 2. Skill Gap Analysis

```typescript
export const analyzeSkillGaps = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Identify skills present in job description but missing or weak in resume. Suggest learning paths.",
        },
        {
          role: "user",
          content: `Analyze skill gaps:\n\nResume:\n${args.resumeText}\n\nRequired:\n${args.jobDescription}`,
        },
      ],
    });

    return response.choices[0].message.content;
  },
});
```

### 3. Interview Question Generator

```typescript
export const generateInterviewQuestions = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Generate likely interview questions based on resume and job description. Provide suggested answers.",
        },
        {
          role: "user",
          content: `Generate interview prep:\n\nResume:\n${args.resumeText}\n\nJob:\n${args.jobDescription}`,
        },
      ],
    });

    return response.choices[0].message.content;
  },
});
```

## Cost Optimization Tips

### 1. Use Caching
```typescript
// Cache AI responses in Convex
const cachedResponse = await ctx.db
  .query("aiResponses")
  .withIndex("by_hash", (q) => q.eq("hash", contentHash))
  .first();

if (cachedResponse) {
  return cachedResponse.response;
}
```

### 2. Use Cheaper Models for Simple Tasks
- GPT-3.5-turbo for keyword extraction
- GPT-4 only for complex optimization

### 3. Batch Requests
```typescript
// Process multiple resumes together
const responses = await Promise.all(
  resumes.map(r => optimizeResume(r))
);
```

## Testing AI Features

Create `convex/testing.ts`:

```typescript
export const testAI = action({
  args: {},
  handler: async (ctx) => {
    const testResume = "Software Engineer with 5 years experience...";
    const testJob = "Looking for Senior Software Engineer...";
    
    const result = await ctx.runAction(api.ai.optimizeResumeWithAI, {
      resumeText: testResume,
      jobDescription: testJob,
      optimizationType: "job-tailored",
    });
    
    console.log("AI Response:", result);
    return result;
  },
});
```

Run in Convex dashboard to test.

## UI Updates for AI Features

Add toggle for AI vs Rule-based:

```tsx
<div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="use-ai"
    checked={useAI}
    onChange={(e) => setUseAI(e.target.checked)}
  />
  <label htmlFor="use-ai">
    Use AI Enhancement (requires API key)
  </label>
</div>
```

## Environment Variables Setup

1. Create `.env.local`:
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

2. Add to Convex Dashboard:
- Go to Settings → Environment Variables
- Add each API key

## Error Handling

```typescript
try {
  const result = await optimizeWithAI({...});
  setOptimizedText(result);
} catch (error) {
  if (error.message.includes("rate limit")) {
    toast.error("API rate limit reached. Please try again later.");
  } else if (error.message.includes("API key")) {
    toast.error("Invalid API key. Check your configuration.");
  } else {
    toast.error("Optimization failed. Using rule-based fallback.");
    // Fallback to rule-based optimization
    const fallback = optimizeForATS(resume.originalText);
    setOptimizedText(fallback);
  }
}
```

## Next Steps

1. Choose your AI provider (OpenAI recommended)
2. Get API key
3. Add action file to convex/
4. Update component to use action
5. Test with sample resume
6. Deploy and enjoy AI-powered optimization!

## Cost Estimates

**OpenAI GPT-4:**
- $0.03 per 1K input tokens
- $0.06 per 1K output tokens
- Average resume optimization: ~$0.10-0.30

**OpenAI GPT-3.5:**
- $0.0015 per 1K input tokens
- $0.002 per 1K output tokens
- Average: ~$0.01-0.05

**Claude:**
- Similar to GPT-4
- Often better at following instructions

**Ollama (Local):**
- Free!
- Requires local GPU
- Slower but private

---

Happy optimizing! 🚀