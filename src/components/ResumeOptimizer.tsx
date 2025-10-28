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
      toast.success("Resume optimized successfully!");
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
      {/* Resume Info Banner */}
      <div className="bg-gray-50 border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
            R
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-black uppercase tracking-wide text-sm mb-1">Your Resume</h3>
            <p className="text-sm text-gray-700">
              {resume.fileName} · {new Date(resume.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Optimization Type Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-black uppercase tracking-wide">
          Select Optimization Type
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
              ATS-Friendly Format
            </div>
            <div className={`text-sm ${optimizationType === "ats" ? "text-gray-200" : "text-gray-600"}`}>
              Optimize formatting for Applicant Tracking Systems
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
              Job-Tailored
            </div>
            <div className={`text-sm ${optimizationType === "job-tailored" ? "text-gray-200" : "text-gray-600"}`}>
              Match your resume to a specific job description
            </div>
          </button>
        </div>
      </div>

      {/* Job Selection for Job-Tailored */}
      {optimizationType === "job-tailored" && (
        <div>
          <label htmlFor="job-select" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
            Select Job Description
          </label>
          <select
            id="job-select"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value as Id<"jobDescriptions"> | "")}
            className="w-full px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
          >
            <option value="">-- Select a job description --</option>
            {jobDescriptions?.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || (optimizationType === "job-tailored" && !selectedJobId)}
          className="btn-primary w-full disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isOptimizing ? "Optimizing..." : "Optimize Resume"}
        </button>

        {optimizationType === "job-tailored" && selectedJobId && (
          <button
            onClick={handleAnalyzeKeywords}
            disabled={isAnalyzing || !resume}
            className="btn-accent w-full disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Keyword Match"}
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-black uppercase tracking-wide">Optimized Resume</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopyToClipboard}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Copy
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary px-4 py-2 text-xs"
              >
                Download
              </button>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-200 p-6 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
              {optimizedText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
