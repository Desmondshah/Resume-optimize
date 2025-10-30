import { useState } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { ResumeUpload } from "./components/ResumeUpload";
import { JobDescription } from "./components/JobDescription";
import { ResumeOptimizer } from "./components/ResumeOptimizer";
import { CoverLetterGenerator } from "./components/CoverLetterGenerator";
import { ResumeComparison } from "./components/ResumeComparison";
import { BulletPointImprover } from "./components/BulletPointImprover";
import { InterviewPrep } from "./components/InterviewPrep";
import { ResumeTemplates } from "./components/ResumeTemplates";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { Toaster, toast } from "sonner";
import type { Id } from "../convex/_generated/dataModel";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold tracking-tight text-black">RESUME OPTIMIZER</h1>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 pt-16">
        <Content />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [activeTab, setActiveTab] = useState<"getting-started" | "optimize" | "tools" | "analytics">("getting-started");
  const [currentResumeId, setCurrentResumeId] = useState<Id<"resumes"> | undefined>();
  const [toolsSubTab, setToolsSubTab] = useState<"compare" | "bullet-improver" | "interview-prep" | "templates">("compare");
  const resumes = useQuery(api.resumes.getUserResumes);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <div className="animate-fade-in">
          {/* Hero Section */}
          <section className="bg-black text-white py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl">
                <h2 className="text-5xl font-bold mb-6 tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Transform your career with AI-powered resume optimization. 
                  Designed for professionals who demand excellence.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-16 px-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <h3 className="text-3xl font-semibold text-center mb-4 tracking-tight">Simple 3-Step Process</h3>
              <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                Getting started is easy. Follow these steps to transform your resume.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-black text-white flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                    1
                  </div>
                  <h4 className="font-semibold text-lg mb-3 tracking-tight">Upload & Setup</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Upload your resume (PDF or text) and add the job description you're targeting
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-black text-white flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                    2
                  </div>
                  <h4 className="font-semibold text-lg mb-3 tracking-tight">AI Optimization</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Get instant ATS optimization, keyword analysis, and job-tailored improvements
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-black text-white flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                    3
                  </div>
                  <h4 className="font-semibold text-lg mb-3 tracking-tight">Export & Apply</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Download your optimized resume, cover letter, and interview prep materials
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Navigation */}
          <section className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto">
              <div className="flex overflow-x-auto border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("getting-started")}
                  className={`px-8 py-4 font-medium tracking-wide whitespace-nowrap transition-all ${
                    activeTab === "getting-started"
                      ? "border-b-4 border-black text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  GETTING STARTED
                </button>
                <button
                  onClick={() => setActiveTab("optimize")}
                  className={`px-8 py-4 font-medium tracking-wide whitespace-nowrap transition-all ${
                    activeTab === "optimize"
                      ? "border-b-4 border-black text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  OPTIMIZE & GENERATE
                </button>
                <button
                  onClick={() => setActiveTab("tools")}
                  className={`px-8 py-4 font-medium tracking-wide whitespace-nowrap transition-all ${
                    activeTab === "tools"
                      ? "border-b-4 border-black text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  CAREER TOOLS
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-8 py-4 font-medium tracking-wide whitespace-nowrap transition-all ${
                    activeTab === "analytics"
                      ? "border-b-4 border-black text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  ANALYTICS
                </button>
              </div>
            </div>
          </section>

          {/* Content Area */}
          <section className="py-12 px-6 bg-white min-h-screen">
            <div className="max-w-7xl mx-auto">
              <div className="animate-slide-up">
                {activeTab === "getting-started" && (
                  <div>
                    <div className="mb-12 p-8 bg-gray-50 border-l-4 border-black">
                      <h3 className="text-2xl font-semibold mb-4 tracking-tight">Quick Start Guide</h3>
                      <p className="text-gray-700 mb-6 leading-relaxed">
                        Follow these two simple steps to get started. First upload your resume, then add the job description you're targeting.
                      </p>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</div>
                          <div>
                            <strong>Upload your resume below</strong> - Supports PDF files or paste your resume text directly
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</div>
                          <div>
                            <strong>Add the job description</strong> - Copy the full job posting to get targeted optimization
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                      {/* Upload Section */}
                      <div className="border-2 border-gray-200 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">1</div>
                          <h3 className="text-2xl font-semibold tracking-tight">Upload Resume</h3>
                        </div>
                        <ResumeUpload
                          onUploadComplete={(resumeId) => {
                            setCurrentResumeId(resumeId);
                            toast.success("Great! Now add a job description to continue.");
                          }}
                        />
                      </div>

                      {/* Job Description Section */}
                      <div className="border-2 border-gray-200 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">2</div>
                          <h3 className="text-2xl font-semibold tracking-tight">Add Job Description</h3>
                        </div>
                        <JobDescription
                          onSave={() => {
                            toast.success("Perfect! Head to 'Optimize & Generate' to continue.");
                          }}
                        />
                      </div>
                    </div>

                    {/* Previously Uploaded Resumes */}
                    {resumes && resumes.length > 0 && (
                      <div className="mt-12 pt-12 border-t-2 border-gray-200">
                        <h4 className="text-2xl font-semibold mb-6 tracking-tight">
                          Your Saved Resumes
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {resumes.map((resume) => (
                            <button
                              key={resume._id}
                              onClick={() => {
                                setCurrentResumeId(resume._id);
                                setActiveTab("optimize");
                                toast.success("Resume loaded! Ready to optimize.");
                              }}
                              className="text-left p-6 border-2 border-gray-200 hover:border-black transition-all duration-200"
                            >
                              <div className="font-semibold text-lg mb-2">{resume.fileName}</div>
                              <div className="text-sm text-gray-500 uppercase tracking-wide">
                                {new Date(resume.uploadedAt).toLocaleDateString()}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "optimize" && (
                  <div>
                    <div className="mb-12 p-8 bg-black text-white">
                      <h3 className="text-2xl font-semibold mb-4 tracking-tight">🎯 Complete Application Package</h3>
                      <p className="mb-4 leading-relaxed opacity-90">
                        Create a winning job application in three steps. Optimize your resume first, then generate a matching cover letter.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-white text-black flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                          <div>
                            <strong>Choose Job-Tailored optimization</strong> to match a specific position
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-white text-black flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                          <div>
                            <strong>Optimize your resume</strong> with AI-powered improvements
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-white text-black flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                          <div>
                            <strong>Generate matching cover letter</strong> that complements your resume
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-12">
                      {/* Resume Optimization */}
                      <div className="border-2 border-black p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-xl">1</div>
                          <h4 className="text-2xl font-semibold tracking-tight">Resume Optimization</h4>
                        </div>
                        <p className="text-gray-600 mb-6">Get ATS-friendly formatting and job-tailored improvements</p>
                        <ResumeOptimizer resumeId={currentResumeId} />
                      </div>

                      {/* Cover Letter Generation */}
                      <div className="border-2 border-black p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-xl">2</div>
                          <h4 className="text-2xl font-semibold tracking-tight">Cover Letter Generator</h4>
                        </div>
                        <p className="text-gray-600 mb-6">Create a personalized cover letter that matches your optimized resume</p>
                        <CoverLetterGenerator resumeId={currentResumeId} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "tools" && (
                  <div>
                    <div className="mb-12 p-8 bg-gray-50 border-l-4 border-black">
                      <h3 className="text-2xl font-semibold mb-4 tracking-tight">Career Tools</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Additional tools to help you stand out. Compare resumes, improve bullet points, prep for interviews, and access templates.
                      </p>
                    </div>
                    
                    {/* Sub-tabs for tools */}
                    <div className="flex flex-wrap gap-1 mb-10 border-b border-gray-200">
                      <button
                        onClick={() => setToolsSubTab("compare")}
                        className={`px-6 py-3 font-medium tracking-wide transition-all ${
                          toolsSubTab === "compare"
                            ? "border-b-4 border-black text-black"
                            : "text-gray-500 hover:text-black"
                        }`}
                      >
                        COMPARE
                      </button>
                      <button
                        onClick={() => setToolsSubTab("bullet-improver")}
                        className={`px-6 py-3 font-medium tracking-wide transition-all ${
                          toolsSubTab === "bullet-improver"
                            ? "border-b-4 border-black text-black"
                            : "text-gray-500 hover:text-black"
                        }`}
                      >
                        BULLET IMPROVER
                      </button>
                      <button
                        onClick={() => setToolsSubTab("interview-prep")}
                        className={`px-6 py-3 font-medium tracking-wide transition-all ${
                          toolsSubTab === "interview-prep"
                            ? "border-b-4 border-black text-black"
                            : "text-gray-500 hover:text-black"
                        }`}
                      >
                        INTERVIEW PREP
                      </button>
                      <button
                        onClick={() => setToolsSubTab("templates")}
                        className={`px-6 py-3 font-medium tracking-wide transition-all ${
                          toolsSubTab === "templates"
                            ? "border-b-4 border-black text-black"
                            : "text-gray-500 hover:text-black"
                        }`}
                      >
                        TEMPLATES
                      </button>
                    </div>

                    <div className="animate-slide-up">
                      {toolsSubTab === "compare" && (
                        <div>
                          <p className="text-gray-600 mb-6">Compare multiple resume versions to see what works best</p>
                          <ResumeComparison resumeId={currentResumeId} />
                        </div>
                      )}
                      {toolsSubTab === "bullet-improver" && (
                        <div>
                          <p className="text-gray-600 mb-6">Transform weak bullet points into powerful achievement statements</p>
                          <BulletPointImprover />
                        </div>
                      )}
                      {toolsSubTab === "interview-prep" && (
                        <div>
                          <p className="text-gray-600 mb-6">Generate practice interview questions based on your resume and target role</p>
                          <InterviewPrep resumeId={currentResumeId} />
                        </div>
                      )}
                      {toolsSubTab === "templates" && (
                        <div>
                          <p className="text-gray-600 mb-6">Professional resume templates optimized for ATS systems</p>
                          <ResumeTemplates resumeId={currentResumeId} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div>
                    <div className="mb-8 p-8 bg-gray-50 border-l-4 border-black">
                      <h3 className="text-2xl font-semibold mb-4 tracking-tight">Application Analytics</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Track your job applications, response rates, and interview performance in one dashboard.
                      </p>
                    </div>
                    <AnalyticsDashboard />
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </Authenticated>
      
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-white px-6">
          <div className="max-w-md w-full">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold text-black mb-4 tracking-tight">RESUME OPTIMIZER</h2>
              <p className="text-xl text-gray-600">
                Create ATS-friendly resumes tailored to your dream job
              </p>
            </div>
            <div className="border-t border-gray-200 pt-12">
              <SignInForm />
            </div>
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}
