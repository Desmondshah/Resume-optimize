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
  const optimizedResumes = useQuery(api.resumes.getOptimizedResumes, resumeId ? { resumeId } : "skip");
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
      
      // Use optimized resume for this job if it exists, otherwise use original
      const optimizedResumeForJob = optimizedResumes?.find(opt => opt.jobDescriptionId === selectedJobId);
      const resumeTextToUse = optimizedResumeForJob?.optimizedText || resume.originalText;
      
      if (optimizedResumeForJob) {
        toast.dismiss(toastId);
        const newToastId = toast.loading("Using your optimized resume to create a matching cover letter...", {
          duration: Infinity,
        });
        var finalToastId = newToastId;
      } else {
        var finalToastId = toastId;
      }
      
      const letter = await generateCoverLetter({
        resumeText: resumeTextToUse,
        jobDescription: job.description,
        jobTitle: job.title,
        companyName: companyName || undefined,
      });

      toast.dismiss(finalToastId);
      setCoverLetter(letter);
      setIsEditing(false);
      
      const hasOptimizedResume = optimizedResumes?.some(opt => opt.jobDescriptionId === selectedJobId);
      if (hasOptimizedResume) {
        toast.success("✓ Complete! Your resume and cover letter are ready to submit.", { duration: 5000 });
      } else {
        toast.success("Cover letter generated! Consider optimizing your resume for this job too.");
      }
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
      {/* Simple Instructions */}
      <div className="bg-black text-white p-6">
        <h3 className="text-sm font-bold mb-2 uppercase tracking-wide">✍️ Complete Your Application Package</h3>
        <div className="text-sm space-y-2 opacity-90">
          <p><strong>Important:</strong> The cover letter will be based on your optimized resume (if available)</p>
          <p><strong>Best Practice:</strong> Optimize your resume for the job first, then generate the cover letter</p>
          <p><strong>Result:</strong> Cover letter perfectly matches what's in your tailored resume</p>
        </div>
      </div>

      {/* Resume Info Banner */}
      <div className="bg-gray-50 border-2 border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
            ✓            ✓
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-black uppercase tracking-wide text-sm mb-1">Current Resume</h3>
            <p className="text-sm text-gray-700">
              {resume.fileName} · {new Date(resume.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="job-select" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
            Select Target Job *
          </label>
          <select
            id="job-select"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value as Id<"jobDescriptions"> | "")}
            className="w-full px-4 py-4 border-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
            disabled={isGenerating}
          >
            <option value="">-- Choose a job description --</option>
            {jobDescriptions?.map((job) => {
              const hasOptimizedResume = optimizedResumes?.some(opt => opt.jobDescriptionId === job._id);
              return (
                <option key={job._id} value={job._id}>
                  {job.title}{hasOptimizedResume ? " ✓ Resume Optimized" : ""}
                </option>
              );
            })}
          </select>
          {jobDescriptions?.length === 0 && (
            <p className="text-sm text-gray-600 mt-2">
              💡 No job descriptions saved yet. Add one in the "Getting Started" tab.
            </p>
          )}
          {selectedJobId && optimizedResumes?.some(opt => opt.jobDescriptionId === selectedJobId) && (
            <div className="mt-3 p-3 bg-green-50 border-2 border-green-200 text-green-800 text-sm">
              ✓ Perfect! Your cover letter will be based on your optimized resume for this job, ensuring everything matches.
            </div>
          )}
          {selectedJobId && !optimizedResumes?.some(opt => opt.jobDescriptionId === selectedJobId) && (
            <div className="mt-3 p-3 bg-yellow-50 border-2 border-yellow-200 text-yellow-800 text-sm">
              ⚠️ No optimized resume found for this job. Cover letter will use your original resume. For best results, scroll up and optimize your resume first.
            </div>
          )}
        </div>

        <div>
          <label htmlFor="company-name" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
            Company Name (Optional)
          </label>
          <input
            id="company-name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Google, Microsoft, Tesla..."
            className="w-full px-4 py-4 border-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
            disabled={isGenerating}
          />
          <p className="text-xs text-gray-600 mt-2">
            Adding the company name makes your letter more personalized
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedJobId}
          className="w-full py-4 bg-black text-white font-semibold uppercase tracking-wide hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isGenerating ? "AI IS WRITING..." : "GENERATE COVER LETTER"}
        </button>
      </div>

      {/* Cover Letter Display */}
      {coverLetter && (
        <div className="space-y-6 border-2 border-black p-8">
          <div className="flex justify-between items-center pb-4 border-b-2 border-gray-200">
            <h3 className="text-lg font-semibold text-black uppercase tracking-wide">✉️ Your Cover Letter</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-2 bg-gray-100 text-black font-semibold uppercase tracking-wide text-xs hover:bg-gray-200 border-2 border-gray-300 transition-all duration-200"
              >
                {isEditing ? "PREVIEW" : "EDIT"}
              </button>
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

          {isEditing ? (
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full h-96 px-6 py-6 border-2 border-gray-200 focus:border-black outline-none transition-all duration-200 resize-none text-sm leading-relaxed bg-white font-sans"
            />
          ) : (
            <div className="bg-gray-50 p-8 border-2 border-gray-200">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900 leading-loose">
                {coverLetter}
              </pre>
            </div>
          )}

          {/* Pro Tips */}
          <div className="bg-black text-white p-6">
            <h4 className="text-sm font-bold mb-3 uppercase tracking-wide">💡 Pro Tips</h4>
            <ul className="text-sm space-y-2 opacity-90 list-disc list-inside">
              <li>Review and add specific examples from your experience</li>
              <li>Research the company and mention why you're interested</li>
              <li>Keep it to one page (3-4 short paragraphs)</li>
              <li>Match the tone to the company culture</li>
              <li>Proofread carefully before sending</li>
            </ul>
          </div>

          {/* Completion Indicator */}
          {selectedJobId && optimizedResumes?.some(opt => opt.jobDescriptionId === selectedJobId) && (
            <div className="bg-green-50 border-2 border-green-500 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0 rounded-full">✓</div>
                <div>
                  <h4 className="text-lg font-bold mb-2 text-green-900 uppercase tracking-wide">Application Package Complete!</h4>
                  <p className="text-sm text-green-800 mb-3">
                    You now have both an optimized resume and matching cover letter for this position.
                  </p>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">✓ Resume:</span>
                      <span>Job-tailored and ATS-optimized</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">✓ Cover Letter:</span>
                      <span>Personalized and ready to send</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm font-semibold text-green-900">Ready to apply! Copy or download both documents above.</p>
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
