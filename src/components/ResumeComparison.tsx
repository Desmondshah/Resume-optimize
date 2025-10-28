import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface ResumeComparisonProps {
  resumeId?: Id<"resumes">;
}

export function ResumeComparison({ resumeId }: ResumeComparisonProps) {
  const [selectedOptimizationId, setSelectedOptimizationId] = useState<string>("");

  const resume = useQuery(api.resumes.getResume, resumeId ? { resumeId } : "skip");
  const optimizedResumes = useQuery(api.resumes.getOptimizedResumes, resumeId ? { resumeId } : "skip");
  const jobDescriptions = useQuery(api.resumes.getUserJobDescriptions);

  if (!resume) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 uppercase tracking-wide text-sm">Please upload a resume first</p>
      </div>
    );
  }

  const selectedOptimization = optimizedResumes?.find(opt => opt._id === selectedOptimizationId);

  return (
    <div className="space-y-10">
      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
            C
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-black uppercase tracking-wide text-sm mb-1">Compare Versions</h3>
            <p className="text-sm text-gray-700">
              Compare your original resume with optimized versions side-by-side
            </p>
          </div>
        </div>
      </div>

      {optimizedResumes && optimizedResumes.length > 0 ? (
        <>
          <div>
            <label htmlFor="version-select" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
              Select Optimized Version to Compare
            </label>
            <select
              id="version-select"
              value={selectedOptimizationId}
              onChange={(e) => setSelectedOptimizationId(e.target.value)}
              className="w-full px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
            >
              <option value="">-- Select a version --</option>
              {optimizedResumes.map((opt) => {
                const job = jobDescriptions?.find(j => j._id === opt.jobDescriptionId);
                const label = opt.optimizationType === "ats-formatting" 
                  ? `ATS Optimization - ${new Date(opt.createdAt).toLocaleDateString()}`
                  : `${job?.title || "Job-Tailored"} - ${new Date(opt.createdAt).toLocaleDateString()}`;
                return (
                  <option key={opt._id} value={opt._id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedOptimization && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Resume */}
              <div className="border-2 border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b-2 border-gray-200">
                  <h4 className="font-semibold text-black uppercase tracking-wide text-sm">Original Resume</h4>
                  <p className="text-xs text-gray-600 mt-1 uppercase tracking-wide">{resume.fileName}</p>
                </div>
                <div className="bg-white p-6 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono leading-relaxed">
                    {resume.originalText}
                  </pre>
                </div>
              </div>

              {/* Optimized Resume */}
              <div className="border-2 border-black overflow-hidden">
                <div className="bg-black px-6 py-4 border-b-2 border-black">
                  <h4 className="font-semibold text-white uppercase tracking-wide text-sm">Optimized Version</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                    <span className="px-2 py-1 bg-white text-black uppercase tracking-wider font-semibold">
                      {selectedOptimization.optimizationType === "ats-formatting" ? "ATS" : "Job-Tailored"}
                    </span>
                    {selectedOptimization.jobDescriptionId && (
                      <span className="uppercase tracking-wide">
                        {jobDescriptions?.find(j => j._id === selectedOptimization.jobDescriptionId)?.title}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-white p-6 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono leading-relaxed">
                    {selectedOptimization.optimizedText}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {selectedOptimization && (
            <div className="bg-gray-50 border border-gray-200 p-6">
              <h4 className="font-semibold text-black mb-4 uppercase tracking-wide text-sm">Key Differences</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="text-gray-500 mb-2 uppercase tracking-wide text-xs">Word Count</div>
                  <div className="font-semibold text-lg">
                    <span className="text-gray-700">{resume.originalText.split(/\s+/).length}</span>
                    <span className="mx-2">→</span>
                    <span className="text-black">{selectedOptimization.optimizedText.split(/\s+/).length}</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-2 uppercase tracking-wide text-xs">Character Count</div>
                  <div className="font-semibold text-lg">
                    <span className="text-gray-700">{resume.originalText.length}</span>
                    <span className="mx-2">→</span>
                    <span className="text-black">{selectedOptimization.optimizedText.length}</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-2 uppercase tracking-wide text-xs">Line Count</div>
                  <div className="font-semibold text-lg">
                    <span className="text-gray-700">{resume.originalText.split('\n').length}</span>
                    <span className="mx-2">→</span>
                    <span className="text-black">{selectedOptimization.optimizedText.split('\n').length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-gray-50 border-2 border-gray-200">
          <p className="text-gray-500 mb-2">No optimized versions yet</p>
          <p className="text-sm text-gray-400">Go to the Optimize tab to create an optimized version</p>
        </div>
      )}
    </div>
  );
}
