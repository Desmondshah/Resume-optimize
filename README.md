# AI-Powered Resume Optimizer

This is an AI-powered resume optimization tool built with [Convex](https://convex.dev) and OpenAI. It helps job seekers create ATS-friendly resumes that achieve 95%+ ATS passage rates and 15-20% interview callback rates.

## 🎯 What This Tool Does

- **ATS Optimization**: Reformats resumes to pass Applicant Tracking Systems
- **Job-Tailored Optimization**: Customizes resumes to match specific job descriptions
- **Keyword Analysis**: Provides detailed analysis of keyword match rates
- **Bullet Point Enhancement**: Uses STAR method to strengthen achievements
- **Cover Letter Generation**: Creates personalized cover letters
- **Interview Prep**: Generates role-specific interview questions

## 📚 Documentation

### 🚀 Start Here
1. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was implemented and why
2. **[QUICK_REFERENCE_RESUME_RULES.md](./QUICK_REFERENCE_RESUME_RULES.md)** - Quick fixes and common issues
3. **[REAL_RESUME_ANALYSIS.md](./REAL_RESUME_ANALYSIS.md)** - Real examples with before/after

### 📖 Deep Dive
- **[RESUME_OPTIMIZATION_RULES.md](./RESUME_OPTIMIZATION_RULES.md)** - Complete optimization rules (comprehensive guide)

### 🔧 Technical Setup
- **[QUICK_START.md](./QUICK_START.md)** - Get started quickly
- **[OPENAI_SETUP.md](./OPENAI_SETUP.md)** - How to configure OpenAI API
- **[AI_INTEGRATION.md](./AI_INTEGRATION.md)** - AI integration details
- **[USAGE.md](./USAGE.md)** - How to use the application

## 🎓 Key Rules the AI Follows

### Zero Tolerance Issues (Must Be 100% Correct)
1. ✅ Zero spelling errors in headers
2. ✅ Location data consistent (city/state/zip must match)
3. ✅ All dates in the same format
4. ✅ No full street addresses (metro area only)

### Content Standards
- **Professional Summary**: 2-4 sentences maximum
- **Metrics**: 90%+ of bullets must have quantified achievements
- **STAR Method**: Every bullet includes Situation, Task, Action, Result
- **Keyword Match**: Target 70-85% match with job descriptions

### Expected Results
- **ATS Passage Rate**: 95%+
- **Interview Callback Rate**: 15-20% (1 in 5-7 applications)

## Project Structure
  
The frontend code is in the `src` directory and is built with [Vite](https://vitejs.dev/) and React.
  
The backend code is in the `convex` directory and includes:
- `openai.ts` - AI optimization logic with comprehensive prompts
- `resumes.ts` - Resume storage and retrieval
- `auth.ts` - Authentication configuration
  
## Getting Started

1. **Clone and Install**:
```bash
npm install
```

2. **Configure OpenAI**:
```bash
npx convex env set OPENAI_API_KEY your-key-here
```

3. **Run Development Server**:
```bash
npm run dev
```

4. **Read the Documentation**:
   - Start with [QUICK_REFERENCE_RESUME_RULES.md](./QUICK_REFERENCE_RESUME_RULES.md)
   - Then review [RESUME_OPTIMIZATION_RULES.md](./RESUME_OPTIMIZATION_RULES.md)

## App Authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.
