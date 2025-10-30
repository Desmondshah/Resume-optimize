import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

interface ResumeOptimizerProps {
  resumeId?: Id<"resumes">;
}

export function ResumeOptimizer({ resumeId }: ResumeOptimizerProps) {
  const [optimizedText, setOptimizedText] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationType, setOptimizationType] = useState<"ats" | "job-tailored">("ats");
  const [selectedJobId, setSelectedJobId] = useState<Id<"jobDescriptions"> | "">("");
  const [keywordAnalysis, setKeywordAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const resume = useQuery(api.resumes.getResume, resumeId ? { resumeId } : "skip");
  const jobDescriptions = useQuery(api.resumes.getUserJobDescriptions);
  const optimizedResumes = useQuery(api.resumes.getOptimizedResumes, resumeId ? { resumeId } : "skip");
  const saveOptimizedResume = useMutation(api.resumes.saveOptimizedResume);
  const optimizeWithAI = useAction(api.openai.optimizeResumeWithAI);
  const analyzeKeywords = useAction(api.openai.analyzeKeywordMatch);

  // Auto-load the most recent optimization when available
  useEffect(() => {
    if (optimizedResumes && optimizedResumes.length > 0 && !optimizedText) {
      setOptimizedText(optimizedResumes[0].optimizedText);
    }
  }, [optimizedResumes, optimizedText]);

  const handleOptimize = async () => {
    if (!resume?.originalText) {
      toast.error("No resume loaded");
      return;
    }

    if (optimizationType === "job-tailored" && !selectedJobId) {
      toast.error("Please select a job description");
      return;
    }

    setIsOptimizing(true);
    
    let toastId: string | number;
    
    try {
      let optimized: string;
      let jobDescId: Id<"jobDescriptions"> | undefined;

      // Use AI to optimize the resume with persistent toast
      if (optimizationType === "ats") {
        toastId = toast.loading("AI is optimizing your resume for ATS...", { duration: Infinity });
        optimized = await optimizeWithAI({
          resumeText: resume.originalText,
          optimizationType: "ats",
        });
      } else {
        const job = jobDescriptions?.find(j => j._id === selectedJobId);
        if (!job) {
          toast.error("Job description not found");
          return;
        }
        toastId = toast.loading("AI is tailoring your resume to the job...", { duration: Infinity });
        optimized = await optimizeWithAI({
          resumeText: resume.originalText,
          jobDescription: job.description,
          qualifications: job.qualifications,
          optimizationType: "job-tailored",
        });
        jobDescId = job._id;
      }

      setOptimizedText(optimized);

      // Save to database
      await saveOptimizedResume({
        resumeId: resume._id,
        jobDescriptionId: jobDescId,
        optimizedText: optimized,
        optimizationType: optimizationType === "ats" ? "ats-formatting" : "job-tailored",
      });

      toast.dismiss(toastId);
      if (optimizationType === "job-tailored") {
        toast.success("Resume optimized! Scroll down to generate a matching cover letter.", { duration: 5000 });
      } else {
        toast.success("Resume optimized successfully!");
      }
    } catch (error: any) {
      if (toastId!) toast.dismiss(toastId);
      toast.error(error.message || "Failed to optimize resume");
      console.error(error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAnalyzeKeywords = async () => {
    if (!resume?.originalText) {
      toast.error("No resume loaded");
      return;
    }

    if (!selectedJobId) {
      toast.error("Please select a job description");
      return;
    }

    setIsAnalyzing(true);
    
    const toastId = toast.loading("Analyzing keyword match...", { duration: Infinity });
    
    try {
      const job = jobDescriptions?.find(j => j._id === selectedJobId);
      if (!job) {
        toast.dismiss(toastId);
        toast.error("Job description not found");
        return;
      }

      const analysis = await analyzeKeywords({
        resumeText: optimizedText || resume.originalText,
        jobDescription: job.description + "\n" + job.qualifications,
      });

      toast.dismiss(toastId);
      setKeywordAnalysis(analysis);
      toast.success(`Match score: ${analysis.matchScore}%`);
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to analyze keywords");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(optimizedText);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([optimizedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized-resume-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded!");
  };

  if (!resume) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 uppercase tracking-wide text-sm">Please upload a resume first</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Simple Instructions Banner */}
      <div className="bg-black text-white p-6">
        <h3 className="text-sm font-bold mb-2 uppercase tracking-wide">🚀 How to Optimize</h3>
        <div className="text-sm space-y-2 opacity-90">
          <p><strong>Step 1:</strong> Choose "ATS-Friendly" for general formatting or "Job-Tailored" to match a specific job</p>
          <p><strong>Step 2:</strong> Click "Optimize Resume" and wait for AI to process</p>
          <p><strong>Step 3:</strong> Review results and copy or download your optimized resume</p>
        </div>
      </div>

      {/* Resume Info Banner */}
      <div className="bg-gray-50 border-2 border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
            ✓
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-black uppercase tracking-wide text-sm mb-1">Current Resume</h3>
            <p className="text-sm text-gray-700">
              {resume.fileName} · {new Date(resume.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Optimization Type Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-black uppercase tracking-wide">
          Choose Optimization Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setOptimizationType("ats")}
            className={`p-6 border-2 text-left transition-all duration-200 ${
              optimizationType === "ats"
                ? "border-black bg-black text-white"
                : "border-gray-200 hover:border-black bg-white"
            }`}
          >
            <div className={`font-semibold mb-2 text-base ${optimizationType === "ats" ? "text-white" : "text-black"}`}>
              ⚡ ATS-Friendly Format
            </div>
            <div className={`text-sm ${optimizationType === "ats" ? "text-gray-200" : "text-gray-600"}`}>
              Quick optimization for better ATS compatibility
            </div>
          </button>
          <button
            onClick={() => setOptimizationType("job-tailored")}
            className={`p-6 border-2 text-left transition-all duration-200 ${
              optimizationType === "job-tailored"
                ? "border-black bg-black text-white"
                : "border-gray-200 hover:border-black bg-white"
            }`}
          >
            <div className={`font-semibold mb-2 text-base ${optimizationType === "job-tailored" ? "text-white" : "text-black"}`}>
              🎯 Job-Tailored
            </div>
            <div className={`text-sm ${optimizationType === "job-tailored" ? "text-gray-200" : "text-gray-600"}`}>
              Match keywords and skills from a specific job posting
            </div>
          </button>
        </div>
      </div>

      {/* Job Selection for Job-Tailored */}
      {optimizationType === "job-tailored" && (
        <div>
          <label htmlFor="job-select" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
            Select Target Job
          </label>
          <select
            id="job-select"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value as Id<"jobDescriptions"> | "")}
            className="w-full px-4 py-4 border-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
          >
            <option value="">-- Choose a job description --</option>
            {jobDescriptions?.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>
          {jobDescriptions?.length === 0 && (
            <p className="text-sm text-gray-600 mt-2">
              💡 No job descriptions saved yet. Add one in the "Getting Started" tab.
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || (optimizationType === "job-tailored" && !selectedJobId)}
          className="w-full py-4 bg-black text-white font-semibold uppercase tracking-wide hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isOptimizing ? "AI IS OPTIMIZING..." : "OPTIMIZE RESUME"}
        </button>

        {optimizationType === "job-tailored" && selectedJobId && (
          <button
            onClick={handleAnalyzeKeywords}
            disabled={isAnalyzing || !resume}
            className="w-full py-4 bg-gray-100 text-black font-semibold uppercase tracking-wide hover:bg-gray-200 border-2 border-gray-300 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? "ANALYZING..." : "ANALYZE KEYWORD MATCH"}
          </button>
        )}
      </div>

      {/* Keyword Analysis Results */}
      {keywordAnalysis && (
        <div className="bg-gray-50 border-2 border-gray-300 p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-300">
            <h3 className="text-lg font-semibold text-black uppercase tracking-wide">Keyword Match Analysis</h3>
            <div className="text-4xl font-bold text-black">{keywordAnalysis.matchScore}%</div>
          </div>

          {keywordAnalysis.strengthAreas && keywordAnalysis.strengthAreas.length > 0 && (
            <div>
              <h4 className="font-semibold text-black mb-3 uppercase tracking-wide text-sm">Strength Areas</h4>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis.strengthAreas.map((area: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-white border border-gray-300 text-black text-sm font-medium">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {keywordAnalysis.matchedKeywords && keywordAnalysis.matchedKeywords.length > 0 && (
            <div>
              <h4 className="font-semibold text-black mb-3 uppercase tracking-wide text-sm">Matched Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis.matchedKeywords.slice(0, 15).map((keyword: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-black text-white text-sm font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {keywordAnalysis.missingKeywords && keywordAnalysis.missingKeywords.length > 0 && (
            <div>
              <h4 className="font-semibold text-black mb-3 uppercase tracking-wide text-sm">Missing Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis.missingKeywords.map((keyword: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {keywordAnalysis.weaknessAreas && keywordAnalysis.weaknessAreas.length > 0 && (
            <div>
              <h4 className="font-semibold text-black mb-3 uppercase tracking-wide text-sm">Weakness Areas</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                {keywordAnalysis.weaknessAreas.map((area: string, idx: number) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </div>
          )}

          {keywordAnalysis.suggestions && keywordAnalysis.suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-black mb-3 uppercase tracking-wide text-sm">Suggestions</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                {keywordAnalysis.suggestions.map((suggestion: string, idx: number) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Optimization History */}
      {optimizedResumes && optimizedResumes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black uppercase tracking-wide">Optimization History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizedResumes.map((opt) => {
              const job = jobDescriptions?.find(j => j._id === opt.jobDescriptionId);
              return (
                <div key={opt._id} className="border-2 border-gray-200 p-6 hover:border-black transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-black mb-1 uppercase tracking-wide text-sm">
                        {opt.optimizationType === "ats-formatting" ? "ATS Optimization" : "Job-Tailored"}
                      </div>
                      {job && (
                        <div className="text-sm text-gray-600 mb-2">{job.title}</div>
                      )}
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {new Date(opt.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => setOptimizedText(opt.optimizedText)}
                      className="px-4 py-2 text-xs bg-black text-white hover:bg-gray-900 transition-all duration-200 uppercase tracking-wider"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Optimized Resume Display */}
      {optimizedText && (
        <div className="space-y-4 border-2 border-black p-8">
          <div className="flex justify-between items-center pb-4 border-b-2 border-gray-200">
            <h3 className="text-lg font-semibold text-black uppercase tracking-wide">✨ Your Optimized Resume</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopyToClipboard}
                className="px-6 py-2 bg-gray-100 text-black font-semibold uppercase tracking-wide text-xs hover:bg-gray-200 border-2 border-gray-300 transition-all duration-200"
              >
                COPY
              </button>
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-black text-white font-semibold uppercase tracking-wide text-xs hover:bg-gray-800 transition-all duration-200"
              >
                DOWNLOAD
              </button>
            </div>
          </div>
          <div className="bg-gray-50 p-6 border-2 border-gray-200">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900 leading-relaxed">
              {optimizedText}
            </pre>
          </div>
          
          {/* Next Step Indicator for Job-Tailored */}
          {optimizationType === "job-tailored" && selectedJobId && (
            <div className="bg-black text-white p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold text-xl flex-shrink-0">✓</div>
                <div>
                  <h4 className="text-sm font-bold mb-2 uppercase tracking-wide">Step 1 Complete!</h4>
                  <p className="text-sm opacity-90 mb-3">
                    Your resume has been optimized for this specific job. Now complete your application package:
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="opacity-75">Next:</span>
                    <span className="font-semibold">⬇️ Scroll down to generate a matching cover letter</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
