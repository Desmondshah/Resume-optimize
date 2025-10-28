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
import { Toaster } from "sonner";
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
  const [activeTab, setActiveTab] = useState<"upload" | "job" | "optimize" | "cover-letter" | "tools" | "analytics">("upload");
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
              <h3 className="text-3xl font-semibold text-center mb-16 tracking-tight">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-black text-white flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                    1
                  </div>
                  <h4 className="font-semibold text-lg mb-3 tracking-tight">Upload Resume</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Upload your existing resume or paste the text directly
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-black text-white flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                    2
                  </div>
                  <h4 className="font-semibold text-lg mb-3 tracking-tight">Add Job Details</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Paste job descriptions to tailor your resume to specific positions
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-black text-white flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                    3
                  </div>
                  <h4 className="font-semibold text-lg mb-3 tracking-tight">AI Optimize</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Get ATS-optimized resume with keyword analysis and suggestions
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-black text-white flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                    4
                  </div>
                  <h4 className="font-semibold text-lg mb-3 tracking-tight">Generate Letter</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Create a personalized cover letter matching your resume
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
                  onClick={() => setActiveTab("upload")}
                  className={`px-8 py-4 font-medium tracking-wide whitespace-nowrap transition-all ${
                    activeTab === "upload"
                      ? "border-b-4 border-black text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  UPLOAD
                </button>
                <button
                  onClick={() => setActiveTab("job")}
                  className={`px-8 py-4 font-medium tracking-wide whitespace-nowrap transition-all ${
                    activeTab === "job"
                      ? "border-b-4 border-black text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  JOB DESCRIPTION
                </button>
                <button
                  onClick={() => setActiveTab("optimize")}
                  className={`px-8 py-4 font-medium tracking-wide whitespace-nowrap transition-all ${
                    activeTab === "optimize"
                      ? "border-b-4 border-black text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  OPTIMIZE
                </button>
                <button
                  onClick={() => setActiveTab("cover-letter")}
                  className={`px-8 py-4 font-medium tracking-wide whitespace-nowrap transition-all ${
                    activeTab === "cover-letter"
                      ? "border-b-4 border-black text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  COVER LETTER
                </button>
                <button
                  onClick={() => setActiveTab("tools")}
                  className={`px-8 py-4 font-medium tracking-wide whitespace-nowrap transition-all ${
                    activeTab === "tools"
                      ? "border-b-4 border-black text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  TOOLS
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
                {activeTab === "upload" && (
                  <div>
                    <h3 className="text-3xl font-semibold mb-8 tracking-tight">Upload Your Resume</h3>
                    <ResumeUpload
                      onUploadComplete={(resumeId) => {
                        setCurrentResumeId(resumeId);
                        setActiveTab("optimize");
                      }}
                    />
                    
                    {resumes && resumes.length > 0 && (
                      <div className="mt-16">
                        <h4 className="text-2xl font-semibold mb-6 tracking-tight">
                          Your Resumes
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {resumes.map((resume) => (
                            <button
                              key={resume._id}
                              onClick={() => {
                                setCurrentResumeId(resume._id);
                                setActiveTab("optimize");
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

                {activeTab === "job" && (
                  <div>
                    <h3 className="text-3xl font-semibold mb-8 tracking-tight">
                      Add Job Description
                    </h3>
                    <JobDescription
                      onSave={() => {
                        setActiveTab("optimize");
                      }}
                    />
                  </div>
                )}

                {activeTab === "optimize" && (
                  <div>
                    <h3 className="text-3xl font-semibold mb-8 tracking-tight">
                      Optimize Your Resume
                    </h3>
                    <ResumeOptimizer resumeId={currentResumeId} />
                  </div>
                )}

                {activeTab === "cover-letter" && (
                  <div>
                    <h3 className="text-3xl font-semibold mb-8 tracking-tight">
                      Generate Cover Letter
                    </h3>
                    <CoverLetterGenerator resumeId={currentResumeId} />
                  </div>
                )}

                {activeTab === "tools" && (
                  <div>
                    <h3 className="text-3xl font-semibold mb-8 tracking-tight">
                      Career Tools
                    </h3>
                    
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
                      {toolsSubTab === "compare" && <ResumeComparison resumeId={currentResumeId} />}
                      {toolsSubTab === "bullet-improver" && <BulletPointImprover />}
                      {toolsSubTab === "interview-prep" && <InterviewPrep resumeId={currentResumeId} />}
                      {toolsSubTab === "templates" && <ResumeTemplates resumeId={currentResumeId} />}
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div>
                    <h3 className="text-3xl font-semibold mb-8 tracking-tight">
                      Application Analytics
                    </h3>
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
