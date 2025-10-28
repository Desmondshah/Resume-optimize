import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

interface InterviewPrepProps {
  resumeId?: Id<"resumes">;
}

interface Question {
  question: string;
  category: string;
  difficulty: string;
  suggestedAnswer: string;
  tips: string[];
}

export function InterviewPrep({ resumeId }: InterviewPrepProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<Id<"jobDescriptions"> | "">("");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [showAnswers, setShowAnswers] = useState<Set<number>>(new Set());

  const resume = useQuery(api.resumes.getResume, resumeId ? { resumeId } : "skip");
  const jobDescriptions = useQuery(api.resumes.getUserJobDescriptions);
  const generateQuestions = useAction(api.openai.generateInterviewQuestions);

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
    
    // Create a toast that persists to show generation is happening
    const toastId = toast.loading("AI is generating interview questions...", {
      duration: Infinity, // Keep toast visible during generation
    });
    
    try {
      const job = jobDescriptions?.find(j => j._id === selectedJobId);
      if (!job) {
        toast.error("Job description not found");
        toast.dismiss(toastId);
        return;
      }
      
      // The action will continue running even if the tab loses focus
      // because it's a server-side operation
      const result = await generateQuestions({
        resumeText: resume.originalText,
        jobDescription: job.description + "\n" + job.qualifications,
        jobTitle: job.title,
      });

      toast.dismiss(toastId);
      setQuestions(result.questions || []);
      setExpandedQuestions(new Set());
      setShowAnswers(new Set());
      toast.success(`Generated ${result.questions?.length || 0} interview questions!`);
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to generate questions");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const toggleAnswer = (index: number) => {
    const newShow = new Set(showAnswers);
    if (newShow.has(index)) {
      newShow.delete(index);
    } else {
      newShow.add(index);
    }
    setShowAnswers(newShow);
  };

  const getCategoryColor = (category: string) => {
    // Tesla style: all badges are black/white
    return 'bg-black text-white';
  };

  const getDifficultyColor = (difficulty: string) => {
    // Tesla style: all badges are black/white
    return 'bg-black text-white';
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
      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
            I
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-black uppercase tracking-wide text-sm mb-1">Interview Preparation</h3>
            <p className="text-sm text-gray-700">
              Get role-specific interview questions with personalized answers based on your experience
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="space-y-8">
        <div>
          <label htmlFor="job-select-interview" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
            Select Job Position
          </label>
          <select
            id="job-select-interview"
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

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedJobId}
          className="btn-primary w-full disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating Questions..." : "Generate Interview Questions"}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-black uppercase tracking-wide">
              Practice Questions ({questions.length})
            </h3>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Click to expand
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, index) => (
              <div 
                key={index}
                className="border-2 border-gray-200 overflow-hidden hover:border-black transition-all duration-200 bg-white"
              >
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleQuestion(index)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-black font-semibold">Q{index + 1}.</span>
                        <span className="px-3 py-1 bg-black text-white text-xs font-semibold uppercase tracking-wider">
                          {q.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-200 text-black text-xs font-semibold uppercase tracking-wider">
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium text-base">{q.question}</p>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${expandedQuestions.has(index) ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedQuestions.has(index) && (
                  <div className="border-t-2 border-gray-200 p-6 bg-gray-50 space-y-6">
                    {/* Tips */}
                    {q.tips && q.tips.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-black mb-3 text-sm uppercase tracking-wide">Tips:</h5>
                        <ul className="space-y-2">
                          {q.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-black mt-0.5 font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Answer Section */}
                    <div>
                      <button
                        onClick={() => toggleAnswer(index)}
                        className="btn-secondary px-4 py-2 text-xs"
                      >
                        {showAnswers.has(index) ? "Hide Answer" : "Show Suggested Answer"}
                      </button>

                      {showAnswers.has(index) && (
                        <div className="mt-4 p-6 bg-white border-2 border-gray-200">
                          <h5 className="font-semibold text-black mb-3 text-sm uppercase tracking-wide">Suggested Answer:</h5>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {q.suggestedAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="bg-gray-50 border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                i
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">Interview Tips</h4>
                <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                  <li>Use the STAR method for behavioral questions (Situation, Task, Action, Result)</li>
                  <li>Practice your answers out loud to build confidence</li>
                  <li>Prepare 2-3 specific examples from your experience</li>
                  <li>Research the company and role before the interview</li>
                  <li>Prepare questions to ask the interviewer</li>
                  <li>Be honest - don't claim experience you don't have</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
