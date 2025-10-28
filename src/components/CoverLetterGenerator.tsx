import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

interface CoverLetterGeneratorProps {
  resumeId?: Id<"resumes">;
}

export function CoverLetterGenerator({ resumeId }: CoverLetterGeneratorProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<Id<"jobDescriptions"> | "">("");
  const [companyName, setCompanyName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const resume = useQuery(api.resumes.getResume, resumeId ? { resumeId } : "skip");
  const jobDescriptions = useQuery(api.resumes.getUserJobDescriptions);
  const generateCoverLetter = useAction(api.openai.generateCoverLetter);

  const handleGenerate = async () => {
    if (!resume?.originalText) {
      toast.error("No resume loaded");
      return;
    }

    if (!selectedJobId) {
      toast.error("Please select a job description");
      return;
    }

    setIsGenerating(true);
    
    // Use persistent loading toast
    const toastId = toast.loading("AI is writing your cover letter...", {
      duration: Infinity,
    });
    
    try {
      const job = jobDescriptions?.find(j => j._id === selectedJobId);
      if (!job) {
        toast.dismiss(toastId);
        toast.error("Job description not found");
        return;
      }
      
      const letter = await generateCoverLetter({
        resumeText: resume.originalText,
        jobDescription: job.description,
        jobTitle: job.title,
        companyName: companyName || undefined,
      });

      toast.dismiss(toastId);
      setCoverLetter(letter);
      setIsEditing(false);
      toast.success("Cover letter generated!");
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to generate cover letter");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const jobTitle = jobDescriptions?.find(j => j._id === selectedJobId)?.title || "position";
    a.download = `cover-letter-${jobTitle.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded!");
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

      {/* Form Section */}
      <div className="space-y-8">
        <div>
          <label htmlFor="job-select-cover" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
            Select Job Description
          </label>
          <select
            id="job-select-cover"
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

        <div>
          <label htmlFor="company-name" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
            Company Name <span className="text-gray-500 normal-case">(Optional)</span>
          </label>
          <input
            id="company-name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Microsoft, Google, Amazon"
            className="w-full px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
          />
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">
            Makes the cover letter more personalized
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedJobId}
          className="btn-primary w-full disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating..." : "Generate Cover Letter"}
        </button>
      </div>

      {/* Cover Letter Display */}
      {coverLetter && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-black uppercase tracking-wide">Your Cover Letter</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                {isEditing ? "Preview" : "Edit"}
              </button>
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

          {isEditing ? (
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full h-96 px-6 py-6 border-2 border-gray-200 focus:border-black outline-none transition-all duration-200 resize-none text-sm leading-relaxed bg-white"
            />
          ) : (
            <div className="bg-white border-2 border-gray-200 p-10 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-loose">
                {coverLetter}
              </pre>
            </div>
          )}

          {/* Pro Tips */}
          <div className="bg-gray-50 border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                i
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">Pro Tips</h4>
                <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                  <li>Review and personalize the letter - add specific examples</li>
                  <li>Research the company and add why you're interested</li>
                  <li>Keep it to one page (3-4 paragraphs)</li>
                  <li>Proofread for any errors before sending</li>
                  <li>Use the same header/contact info as your resume</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
