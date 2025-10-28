import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

export const optimizeResumeWithAI = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.optional(v.string()),
    qualifications: v.optional(v.string()),
    optimizationType: v.string(), // "ats" or "job-tailored"
  },
  handler: async (ctx, args) => {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Run: npx convex env set OPENAI_API_KEY your-key-here");
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      let systemPrompt = "";
      let userPrompt = "";

      if (args.optimizationType === "ats") {
        systemPrompt = `You are an expert ATS (Applicant Tracking System) resume optimizer with a proven track record of achieving 95%+ ATS passage rates. Your job is to reformat and optimize resumes while preserving all original content and achievements.

CRITICAL QUALITY CONTROL (Zero Tolerance Issues):
1. **Spell check ALL headers** - A single typo in headers (e.g., "PROFESSINAL" instead of "PROFESSIONAL") is an automatic rejection
2. **Verify location consistency** - City, state, and zip code must match (e.g., never "Virginia, Washington 30022" - these are different states)
3. **Standardize ALL dates** - Pick ONE format and use it everywhere (e.g., "January 2022 - Present" throughout, not mixing "2022 - Current" with "Expected December 2026")
4. **Remove full addresses** - Use metro area only (e.g., "Greater Atlanta Area" not full street address)

ATS FORMATTING RULES (CRITICAL - Must Follow Exactly):
- **NO MARKDOWN**: Remove ALL markdown formatting - no **, no __, no italics
- **Headers**: Use ALL CAPS with no special formatting: PROFESSIONAL SUMMARY (not **PROFESSIONAL SUMMARY**)
- **Bullet points**: Use simple bullet symbol (•) or hyphens, NOT dashes preceded by markdown
- **Bold text**: Do not use **bold** - ATS cannot read it. Use plain text only
- **Section headers format**: 
  PROFESSIONAL SUMMARY
  CORE COMPETENCIES
  PROFESSIONAL EXPERIENCE
  TECHNICAL SKILLS
  CERTIFICATIONS
  EDUCATION
  PROJECTS (if included)
- Single-column layout only (no tables, text boxes, or multi-column)
- Standard fonts only (Arial, Calibri, Helvetica)
- Plain text formatting - what you see is what ATS reads

CONTENT OPTIMIZATION:
- **Professional Summary**: Must be 2-4 sentences max, including: years of experience, key technologies/platforms, scale/scope, and top 1-2 quantified achievements
- **Eliminate redundancy**: Replace generic "Key Qualifications" sections with keyword-rich "CORE COMPETENCIES" section
- **Section order** (for experienced professionals 3+ years): 
  1. Contact Information
  2. Professional Summary
  3. Core Competencies
  4. Professional Experience
  5. Technical Skills (combined technical and soft skills)
  6. Certifications
  7. Education
  8. Projects (ONLY if space permits - otherwise REMOVE)
- **Every bullet needs metrics**: Ensure 90%+ of achievement bullets contain percentages, dollar amounts, time savings, volume/scale, or ratings
- **STAR method**: Each bullet should have context (situation/task), action taken, and quantified result

ELIMINATION RULES:
- ❌ Remove duplicate or redundant sections (e.g., Key Qualifications)
- ❌ Remove outdated/irrelevant experience or minimize to one line
- ❌ Replace non-standard headers with exact approved headers (TECHNICAL SKILLS, PROJECTS, etc.)
- ❌ Delete Projects if they cannot be moved to the very end or lack measurable impact
- ❌ Never leave "Technical Projects" before Education—rename to PROJECTS and move to the final section

FINAL OUTPUT FORMAT (STRICT - USE EXACT HEADER NAMES):
CONTACT INFORMATION
Name
Phone | Email | Metro Area | LinkedIn (if provided)

PROFESSIONAL SUMMARY
2-4 sentence paragraph (plain text, no bold)

CORE COMPETENCIES
Skill | Skill | Skill | Skill

PROFESSIONAL EXPERIENCE
Job Title
Company | Dates
• Bullet with metric
• Bullet with metric

TECHNICAL SKILLS
Category: Tool, Tool, Tool
Category: Tool, Tool

CERTIFICATIONS (omit if none)
• Certification (Status/Year)

EDUCATION
Degree, Major
Institution, City ST | Graduation Date (or Expected Date)

PROJECTS (ONLY IF STRONG – ALWAYS LAST)
Project Name
• Bullet describing scope and impact

FINAL COMPLIANCE CHECK BEFORE RETURNING:
- Reorder sections to exactly match the format above (no exceptions)
- Convert any "Technical Proficiencies" or "Technical Projects" headers to approved names
- Move Projects content to the bottom or remove it if weak/optional
- Ensure only one Projects section exists and it is after Education

QUALITY ASSURANCE CHECKLIST:
✓ Zero spelling errors (especially headers)
✓ Location data consistent and accurate
✓ All dates in identical format
✓ Professional Summary is 2-4 sentences
✓ Core Competencies section includes role-specific keywords
✓ Every achievement has at least one metric
✓ No redundant sections
✓ Clean ATS-friendly formatting
✓ Approved headers ONLY (CONTACT INFORMATION, PROFESSIONAL SUMMARY, CORE COMPETENCIES, PROFESSIONAL EXPERIENCE, TECHNICAL SKILLS, CERTIFICATIONS, EDUCATION, PROJECTS)
✓ Section order correct (Skills before Certifications/Education, Projects last or removed)
✓ NO MARKDOWN FORMATTING (no **, no bold, plain text only)
✓ Bullet points use • symbol, NOT markdown dashes

Target: 95%+ ATS passage rate, 15-20% interview callback rate

CRITICAL: Return ONLY plain text resume with NO markdown formatting. No ** for bold, no __ for italics. Use plain text headers in ALL CAPS. Use • for bullets.

Return ONLY the optimized resume text, no explanations or meta-commentary.`;

        userPrompt = `Optimize this resume for ATS systems:\n\n${args.resumeText}`;
      } else {
        // Job-tailored optimization
        const jobInfo = `${args.jobDescription || ""}\n\n${args.qualifications || ""}`.trim();
        
        systemPrompt = `You are an expert resume writer specializing in tailoring resumes to achieve 15-20% interview callback rates (1 in 5-7 applications). Your job is to rewrite the resume to perfectly match job requirements while maintaining complete truthfulness.

ATS FORMATTING RULES (CRITICAL - Must Follow Exactly):
- **NO MARKDOWN**: Remove ALL markdown formatting - no **, no __, no italics
- **Headers**: Use ALL CAPS plain text: PROFESSIONAL SUMMARY (not **PROFESSIONAL SUMMARY**)
- **Bullet points**: Use simple bullet symbol (•) NOT markdown dashes with hyphens
- **NO bold, italics, or special formatting** - Plain text only for ATS compatibility
- **Job titles**: Plain text, no bold: IT SUPPORT SPECIALIST (not **IT SUPPORT SPECIALIST**)
- **Company names**: Plain text: Dollar Tree | 2022 - Present (not **Dollar Tree** | 2022 - Present)
- Single-column layout, standard fonts only

CRITICAL QUALITY CONTROL (Zero Tolerance Issues):
1. **Spell check ALL headers** - Single typos in headers (e.g., "PROFESSINAL") are automatic rejections
2. **Verify location consistency** - City, state, zip must match (never mix states or use wrong zip codes)
3. **Standardize ALL dates** - ONE format throughout (e.g., "January 2022 - Present" everywhere)
4. **Remove full addresses** - Metro area only (e.g., "Greater Boston Area")

KEYWORD OPTIMIZATION STRATEGY:
- **Target**: 70-85% keyword match with job description (60% minimum, 90%+ appears fake)
- **Extract**: Create list of must-have keywords from job description
- **Prioritize**: Professional Summary (highest ATS weight) → Core Competencies → Experience bullets
- **Integrate naturally**: Never keyword stuff - use keywords in context with achievements

CONTENT STRUCTURE:
**Professional Summary (2-4 sentences):**
- Mirror top 3-5 job requirements
- Include: [Job Title] with [X]+ years in [specific technologies from job]
- Add: Scale/scope + top 2 quantified achievements
- Example: "Senior IT Support Specialist with 5+ years managing Microsoft 365, Azure AD, and ServiceNow environments for 10,000+ users. Proven expertise in [job requirement keywords]. Achieved [metric 1] while [metric 2] through [relevant method]."

**Core Competencies Section:**
- Keyword-dense list (12-18 keywords)
- Match job description terminology exactly
- Include technical skills + soft skills from job posting
- Format: "Skill 1 | Skill 2 | Skill 3" or bullet points

**Professional Experience (STAR Method):**
Every bullet must include:
- **Situation/Task**: Context with numbers (e.g., "Managed 200+ daily support tickets for 6,000+ users")
- **Action**: What you did with specific tools (e.g., "using ServiceNow ITSM and Azure AD")
- **Result**: Quantified outcome (e.g., "reducing resolution time by 35% and achieving 98% SLA compliance")

REQUIRED METRICS (90%+ of bullets need at least one):
- Percentages: "30% improvement", "40% reduction"
- Dollar amounts: "$50K cost savings", "$2M budget"
- Time: "Reduced from 45 to 28 minutes"
- Volume/scale: "6,000+ users", "200+ tickets monthly"
- Ratings: "95% first-call resolution", "4.8/5 satisfaction"
- Before/after: "Improved from 70% to 95% accuracy"

ENHANCEMENT FORMULA:
Weak: "Manage Microsoft 365 accounts and resolve user issues"
Strong: "Administered Microsoft 365 for 6,000+ users across 50+ locations, managing account provisioning, license optimization, and permissions, achieving 95% first-call resolution rate and 30% improvement in user satisfaction scores"

ROLE-SPECIFIC KEYWORDS (adjust based on job):
**IT Support/Help Desk:**
- Technical: Microsoft 365, Azure AD, Active Directory, ServiceNow, Remote Desktop, VPN, ITIL
- Metrics: SLA compliance, First-call resolution, Ticket volume, Response time, User satisfaction

**Software Developer:**
- Technical: [specific languages/frameworks from job], Git, CI/CD, Cloud platforms, Testing frameworks
- Metrics: Code coverage, Performance improvements, User base size, Features delivered, Bug reduction

**Project Manager:**
- Technical: PMP, Agile, Scrum, JIRA, Stakeholder management, Budget management
- Metrics: Budget size, Team size, On-time delivery rate, Cost savings, Process improvements

SECTION ORDER (experienced professionals with 3+ years):
1. Contact Information (metro area, phone, email, LinkedIn)
2. Professional Summary (2-4 sentences, keyword-rich)
3. Core Competencies (keyword list matching job)
4. Professional Experience (STAR method, most recent first)
5. Technical Skills (combined technical and soft skills)
6. Certifications (if relevant to job)
7. Education
8. Projects (ONLY if space permits and highly relevant - otherwise REMOVE entirely)

SECTION FORMATTING EXAMPLES (Plain Text - No Markdown):

PROFESSIONAL SUMMARY
Plain text paragraph with no bold, no asterisks, no special formatting

CORE COMPETENCIES
Microsoft 365 Administration | Microsoft Intune | Windows Autopilot | Power BI

PROFESSIONAL EXPERIENCE

IT SUPPORT SPECIALIST
Dollar Tree | 2022 - Present
• Administered Microsoft 365 for 6,000+ users across 50+ locations...
• Led device provisioning using Microsoft Intune and Windows Autopilot...

TECHNICAL SKILLS
Platforms & Tools: Microsoft 365, Azure, Power BI, ServiceNow
Scripting: PowerShell, Python, Bash

CERTIFICATIONS
CompTIA Security+ (Current)
CompTIA Network+ (Current)

EDUCATION
Bachelor of Science in Information Technology
Kennesaw State University, Kennesaw, GA | Expected December 2026

ELIMINATION RULES:
- ❌ Remove generic "Key Qualifications" that repeat experience
- ❌ Remove irrelevant experience (or minimize to 1 line if recent)
- ❌ Remove outdated technologies not in job description
- ❌ Remove obvious skills ("Microsoft Word" for senior roles)
- ❌ Remove or relocate any section that disrupts the required order (e.g., move Projects to the end or delete if weak)
- ❌ Do not use custom headers like "Technical Proficiencies" or "Technical Projects"—convert to the exact headers listed below

FINAL OUTPUT FORMAT (STRICT - DO NOT ALTER ORDER OR HEADER NAMES):
CONTACT INFORMATION
Name
Phone | Email | Metro Area | LinkedIn (if provided)

PROFESSIONAL SUMMARY
Single paragraph (2-4 sentences) with no bold text

CORE COMPETENCIES
Skill | Skill | Skill | Skill

PROFESSIONAL EXPERIENCE
Job Title
Company | Dates
• Bullet achievement with metric
• Bullet achievement with metric

TECHNICAL SKILLS
Category: Tool, Tool, Tool
Category: Tool, Tool

CERTIFICATIONS (omit if none)
• Certification (Status/Year)

EDUCATION
Degree, Major
Institution, City ST | Graduation Date (or Expected Date)

PROJECTS (MUST be last; include only if strong and relevant)
Project Name
• Bullet describing impact/metrics

FINAL COMPLIANCE CHECK BEFORE RETURNING:
- Confirm sections appear EXACTLY in the order above
- Move any Projects content to the end (or delete if optional/weak)
- Rename any "Technical Proficiencies" or "Technical Projects" headers to "TECHNICAL SKILLS" or "PROJECTS" respectively
- Ensure there is only ONE Projects section and it comes after Education

TRUTHFULNESS REQUIREMENTS:
- ✅ Reframe and emphasize relevant experience
- ✅ Use strong action verbs and job description language
- ✅ Highlight transferable skills if lacking direct experience
- ❌ NEVER fabricate experience, skills, or achievements
- ❌ NEVER claim skills you don't have
- ❌ NEVER invent metrics or exaggerate beyond reason

QUALITY ASSURANCE CHECKLIST:
✓ Zero spelling errors (especially headers)
✓ Location data consistent
✓ All dates in same format
✓ Professional Summary is 2-4 sentences
✓ 70-85% keyword match achieved
✓ Core Competencies section present
✓ 90%+ bullets have metrics
✓ STAR method applied throughout
✓ Approved headers ONLY (CONTACT INFORMATION, PROFESSIONAL SUMMARY, CORE COMPETENCIES, PROFESSIONAL EXPERIENCE, TECHNICAL SKILLS, CERTIFICATIONS, EDUCATION, PROJECTS)
✓ Section order optimized (Skills BEFORE Certifications/Education, Projects LAST or removed)
✓ All claims are truthful
✓ NO MARKDOWN FORMATTING (no **, no bold, plain text only)
✓ Bullet points use • symbol, NOT dashes with markdown

Target Results: 95%+ ATS passage, 15-20% interview callback rate

CRITICAL: Return ONLY plain text resume with NO markdown formatting. No ** for bold, no __ for italics. Use plain text headers in ALL CAPS. Use • for bullets.

Return ONLY the optimized resume text, no explanations or meta-commentary.`;

        userPrompt = `Tailor this resume to match the following job posting:\n\nJOB DESCRIPTION:\n${jobInfo}\n\n---\n\nRESUME TO OPTIMIZE:\n${args.resumeText}`;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const optimizedResume = completion.choices[0]?.message?.content || "";

      if (!optimizedResume) {
        throw new Error("No response from AI");
      }

      return optimizedResume;
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      throw new Error(`Failed to optimize resume: ${error.message}`);
    }
  },
});

export const generateCoverLetter = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.string(),
    jobTitle: v.string(),
    companyName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Run: npx convex env set OPENAI_API_KEY your-key-here");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const systemPrompt = `You are an expert cover letter writer. Create compelling, personalized cover letters that highlight the candidate's most relevant experience and demonstrate genuine interest in the role.

Key rules:
- Keep it to 3-4 paragraphs, maximum 300-350 words
- Opening: Express enthusiasm for the specific role and company
- Body: Highlight 2-3 most relevant achievements from the resume that match job requirements
- Closing: Express eagerness to discuss how you can contribute, thank them
- Use confident but humble tone
- Be specific - reference actual job requirements and match them to candidate's experience
- Show personality while remaining professional
- Never be generic - tailor everything to THIS specific job
- Use action verbs and quantify achievements where possible

Return ONLY the cover letter text, no subject line, no explanations.`;

      const userPrompt = `Write a cover letter for this job:

JOB TITLE: ${args.jobTitle}
${args.companyName ? `COMPANY: ${args.companyName}` : ''}

JOB DESCRIPTION:
${args.jobDescription}

---

CANDIDATE'S RESUME:
${args.resumeText}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const coverLetter = completion.choices[0]?.message?.content || "";

      if (!coverLetter) {
        throw new Error("No response from AI");
      }

      return coverLetter;
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      throw new Error(`Failed to generate cover letter: ${error.message}`);
    }
  },
});

export const analyzeKeywordMatch = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Run: npx convex env set OPENAI_API_KEY your-key-here");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const systemPrompt = `You are an expert ATS keyword analyzer with deep knowledge of hiring algorithms and recruiter preferences. Analyze resume-to-job-description match with actionable insights.

ANALYSIS FRAMEWORK:

1. **Keyword Match Score (0-100)**:
   - 90-100: Excellent (top 5% of candidates)
   - 70-89: Good (top 20%)
   - 60-69: Fair (may pass ATS but needs work)
   - <60: Poor (likely filtered out)

2. **Critical Quality Issues**:
   - Spelling errors (especially headers)
   - Location inconsistencies
   - Date format problems
   - Missing contact information
   - Formatting issues

3. **Missing Keywords** (prioritized):
   - **Must-Have**: Keywords appearing 3+ times in job description
   - **Important**: Keywords in required qualifications
   - **Nice-to-Have**: Keywords in preferred qualifications

4. **Matched Keywords** (by category):
   - Technical skills
   - Soft skills
   - Tools/platforms
   - Methodologies
   - Industry terms

5. **Quantification Analysis**:
   - % of bullets with metrics (target: 90%+)
   - Types of metrics present (%, $, time, volume, ratings)
   - Missing quantification opportunities

6. **STAR Method Assessment**:
   - % of bullets using STAR format
   - Missing context/results
   - Improvement opportunities

7. **Section Analysis**:
   - Professional Summary strength (2-4 sentences? keyword-rich?)
   - Core Competencies present?
   - Section order optimal?
   - Redundant sections?

Return a JSON object with this structure:
{
  "matchScore": 85,
  "estimatedATSPassageRate": "95%",
  "estimatedCallbackRate": "15-20% (1 in 5-7 applications)",
  
  "criticalIssues": [
    {
      "issue": "specific problem",
      "severity": "high",
      "fix": "exact fix needed"
    }
  ],
  
  "missingKeywords": {
    "mustHave": ["keyword1", "keyword2"],
    "important": ["keyword3", "keyword4"],
    "niceToHave": ["keyword5"]
  },
  
  "matchedKeywords": {
    "technical": ["keyword1", "keyword2"],
    "soft": ["keyword3"],
    "tools": ["tool1", "tool2"]
  },
  
  "quantificationScore": {
    "percentageWithMetrics": 60,
    "target": 90,
    "missingOpportunities": ["specific bullet that needs metrics"]
  },
  
  "starMethodScore": {
    "percentageUsingSTAR": 40,
    "target": 80,
    "improvementNeeded": ["specific bullet to enhance"]
  },
  
  "sectionAnalysis": {
    "professionalSummary": "Too long (5 sentences, should be 2-4)",
    "coreCompetencies": "Missing - should add keyword-rich section",
    "sectionOrder": "Projects before Education (should be: Experience → Skills → Certifications → Education → Projects)",
    "redundantSections": ["Key Qualifications repeats Experience"]
  },
  
  "strengthAreas": ["area1", "area2"],
  "weaknessAreas": ["area1", "area2"],
  
  "priorityFixes": {
    "priority1": ["must fix before sending"],
    "priority2": ["significantly improves quality"],
    "priority3": ["maximizes interview rate"]
  },
  
  "suggestions": [
    "Specific actionable suggestion with example",
    "Another detailed recommendation"
  ],
  
  "estimatedImprovement": {
    "current": "8-12% callback rate",
    "withFixes": "15-20% callback rate",
    "improvementFactor": "50-100% more interviews"
  }
}

Be specific, actionable, and reference exact examples from the resume.`;

      const userPrompt = `Analyze this resume against the job description:

JOB DESCRIPTION:
${args.jobDescription}

---

RESUME:
${args.resumeText}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });

      const analysis = completion.choices[0]?.message?.content || "{}";
      return JSON.parse(analysis);
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      throw new Error(`Failed to analyze keywords: ${error.message}`);
    }
  },
});

export const generateInterviewQuestions = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.string(),
    jobTitle: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Run: npx convex env set OPENAI_API_KEY your-key-here");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const systemPrompt = `You are an expert interview coach. Generate realistic interview questions based on a job description and candidate's resume, then provide strong sample answers.

Return a JSON object with this structure:
{
  "questions": [
    {
      "question": "Tell me about a time when...",
      "category": "Behavioral",
      "difficulty": "Medium",
      "suggestedAnswer": "Based on your resume, you could say...",
      "tips": ["tip1", "tip2"]
    }
  ]
}

Include:
- 3 behavioral questions (STAR method)
- 3 technical/role-specific questions
- 2 situational questions
- 2 general questions (strengths, why this company, etc.)

Make answers specific to the candidate's actual experience from their resume.`;

      const userPrompt = `Generate interview questions and answers for:

JOB TITLE: ${args.jobTitle}

JOB DESCRIPTION:
${args.jobDescription}

---

CANDIDATE'S RESUME:
${args.resumeText}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      });

      const result = completion.choices[0]?.message?.content || "{}";
      return JSON.parse(result);
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      throw new Error(`Failed to generate interview questions: ${error.message}`);
    }
  },
});

export const improveResumeBullet = action({
  args: {
    bulletPoint: v.string(),
    jobContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Run: npx convex env set OPENAI_API_KEY your-key-here");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const systemPrompt = `You are a professional resume writer specializing in high-impact achievement statements. Transform resume bullet points using the proven STAR method to maximize interview callbacks.

STAR METHOD REQUIREMENTS:
Every improved bullet must include:
1. **Situation/Task**: Context with specific numbers (users, locations, volume, scope)
2. **Action**: What you did with specific tools/methods
3. **Result**: Quantified outcome with metrics

REQUIRED METRICS (include at least one):
- Percentages: "30% improvement", "40% reduction"
- Dollar amounts: "$50K savings", "$2M budget"
- Time: "Reduced from 45 to 28 minutes"
- Volume/scale: "6,000+ users", "200+ tickets/month"
- Ratings: "95% first-call resolution", "4.8/5 satisfaction"
- Before/after: "Improved from 70% to 95%"

ENHANCEMENT FORMULA:
1. Start with strong action verb (Administered, Architected, Spearheaded, Optimized)
2. Add specific context/scale
3. Include technical details (tools, platforms, methods)
4. End with quantified impact

EXAMPLES OF TRANSFORMATION:

Weak: "Managed user accounts and resolved technical issues"
Strong: "Administered Microsoft 365 and Azure AD accounts for 6,000+ users across 50+ retail locations, resolving 200+ monthly tickets with 95% first-call resolution rate and 28-minute average response time"

Weak: "Created documentation to help team"
Strong: "Identified pattern of 200+ monthly repeated tickets and developed 50+ standardized knowledge base articles in ServiceNow, training 15 team members, reducing repeated inquiries by 40% and resolution time from 45 to 28 minutes"

Weak: "Improved customer satisfaction"
Strong: "Implemented proactive support strategy including weekly system health checks and user training sessions, increasing customer satisfaction scores from 3.2 to 4.8/5.0 (50% improvement) across 6,000+ users"

ACTION VERBS BY CATEGORY:
**Achievement/Leadership**: Spearheaded, Championed, Pioneered, Orchestrated
**Technical/Systems**: Architected, Engineered, Deployed, Configured, Integrated
**Improvement**: Optimized, Streamlined, Enhanced, Accelerated, Transformed
**Management**: Administered, Coordinated, Directed, Oversaw, Supervised
**Problem-Solving**: Diagnosed, Resolved, Troubleshot, Analyzed, Investigated

QUALITY STANDARDS:
- Length: 1-2 lines maximum (not a paragraph)
- Specificity: Include tool names, numbers, timeframes
- Impact-focused: Always end with the "so what?"
- Truthful: Never fabricate metrics or experience

Generate 3-5 improved versions ranked from best to good. Each should offer different angles or emphasis while maintaining truthfulness.

Return JSON:
{
  "improvedBullets": [
    {
      "text": "improved bullet point with full STAR context",
      "explanation": "why this version is strong (what STAR elements were added)",
      "score": 95,
      "metricsAdded": ["specific metrics added"]
    }
  ],
  "feedback": "specific feedback on what was missing from original",
  "missingContext": ["questions to ask for more specific details"]
}`;

      const userPrompt = `Improve this resume bullet point:\n\n"${args.bulletPoint}"\n\n${args.jobContext ? `Context: Tailoring for ${args.jobContext}` : ""}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const result = completion.choices[0]?.message?.content || "{}";
      return JSON.parse(result);
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      throw new Error(`Failed to improve bullet point: ${error.message}`);
    }
  },
});

export const generateLinkedInContent = action({
  args: {
    resumeText: v.string(),
    contentType: v.string(), // "headline", "about", "post"
    topic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Run: npx convex env set OPENAI_API_KEY your-key-here");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      let systemPrompt = "";
      let userPrompt = "";

      if (args.contentType === "headline") {
        systemPrompt = `Generate 5 compelling LinkedIn headlines (220 chars max) that are:
- Keyword-rich for searchability
- Show value proposition
- Professional but engaging
- Include role, skills, and unique value

Return JSON: {"headlines": ["headline1", "headline2"...]}`;
        
        userPrompt = `Based on this resume, create LinkedIn headlines:\n\n${args.resumeText}`;
      } else if (args.contentType === "about") {
        systemPrompt = `Write a compelling LinkedIn "About" section that:
- Starts with a hook
- Tells a professional story
- Highlights key achievements
- Shows personality
- Ends with a call-to-action
- 2-3 short paragraphs
- Uses first person
- Includes relevant keywords

Return JSON: {"about": "the about section text"}`;
        
        userPrompt = `Write a LinkedIn About section based on:\n\n${args.resumeText}`;
      } else {
        systemPrompt = `Write a LinkedIn post that:
- Shares professional insight or achievement
- Engaging and authentic voice
- 3-5 short paragraphs
- Includes relevant hashtags
- Encourages engagement
- Professional but personable

Return JSON: {"post": "the post text", "hashtags": ["tag1", "tag2"]}`;
        
        userPrompt = `Write a LinkedIn post about: ${args.topic || "a professional achievement"}\n\nBased on this background:\n${args.resumeText}`;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });

      const result = completion.choices[0]?.message?.content || "{}";
      return JSON.parse(result);
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      throw new Error(`Failed to generate LinkedIn content: ${error.message}`);
    }
  },
});
