# Setting Up OpenAI for Resume Optimization

## Quick Setup for Convex

**Important:** Convex uses its own environment variable system, not a `.env` file!

### Step 1: Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy your API key (starts with `sk-proj-...`)

### Step 2: Set Environment Variable in Convex

Run this command in your terminal:

```powershell
npx convex env set OPENAI_API_KEY sk-proj-your-actual-key-here
```

**Replace `sk-proj-your-actual-key-here` with your actual OpenAI API key!**

The command will ask you to confirm. Type `y` and press Enter.

### Step 3: Verify It's Set

You can check your environment variables with:

```powershell
npx convex env list
```

You should see `OPENAI_API_KEY` listed (the value will be hidden for security).

### Step 4: The Backend Will Reload Automatically

Convex automatically reloads when environment variables change. Just try optimizing a resume again!

## How It Works

The app now uses GPT-4o-mini to:

### ATS Optimization
- Removes special characters and formatting that confuse ATS systems
- Standardizes section headers
- Cleans up spacing and formatting
- Returns a fully ATS-compliant resume

### Job-Tailored Optimization
- Analyzes the job description and requirements
- Rewrites your resume to match the job posting
- Incorporates relevant keywords naturally
- Emphasizes matching experience
- Creates a customized professional summary

## Cost

- GPT-4o-mini costs approximately $0.15 per 1M input tokens and $0.60 per 1M output tokens
- Each resume optimization costs roughly $0.01-0.02
- Very affordable for personal use!

## Troubleshooting

If you see an error about OpenAI API key:
1. Check that your `.env` file has the correct key
2. Make sure there are no extra spaces or quotes around the key
3. Restart the Convex backend (`npm run dev`)
4. Check your OpenAI account has available credits

## Security Note

- Never commit your `.env` file to git (it's already in `.gitignore`)
- Keep your API key secret
- If you accidentally expose it, delete it from OpenAI dashboard and create a new one
