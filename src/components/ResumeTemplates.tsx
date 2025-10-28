import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

interface ResumeTemplatesProps {
  resumeId?: Id<"resumes">;
}

type TemplateStyle = "modern" | "classic" | "technical" | "creative";

export function ResumeTemplates({ resumeId }: ResumeTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>("modern");
  const [previewText, setPreviewText] = useState("");
  const [useOptimized, setUseOptimized] = useState(true);
  const [selectedOptimizedId, setSelectedOptimizedId] = useState<string>("");

  const resume = useQuery(api.resumes.getResume, resumeId ? { resumeId } : "skip");
  const optimizedResumes = useQuery(api.resumes.getOptimizedResumes, resumeId ? { resumeId } : "skip");

  const templates = {
    modern: {
      name: "Modern Professional",
      description: "Clean, minimalist design with blue accents. Perfect for tech and creative roles.",
      color: "blue",
      preview: "Clean lines, modern fonts, subtle color accents"
    },
    classic: {
      name: "Classic Traditional",
      description: "Traditional format perfect for conservative industries like finance, law, healthcare.",
      color: "gray",
      preview: "Traditional layout, serif fonts, black & white"
    },
    technical: {
      name: "Technical/Engineering",
      description: "Dense layout optimized for technical roles. Emphasizes skills and projects.",
      color: "purple",
      preview: "Skills-focused, project highlights, technical layout"
    },
    creative: {
      name: "Creative",
      description: "Bold design for creative professionals in design, marketing, media.",
      color: "pink",
      preview: "Visual elements, creative layout, personality"
    }
  };

  const formatResumeForTemplate = (text: string, template: TemplateStyle): string => {
    // Basic formatting based on template style
    let formatted = text;

    switch (template) {
      case "modern":
        formatted = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    MODERN PROFESSIONAL RESUME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${formatted}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Generated with Resume Super Optimizer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        break;

      case "classic":
        formatted = `═══════════════════════════════════════════════════════════════════
                    PROFESSIONAL RESUME
═══════════════════════════════════════════════════════════════════

${formatted}

═══════════════════════════════════════════════════════════════════`;
        break;

      case "technical":
        formatted = `╔═══════════════════════════════════════════════════════════════════╗
║                     TECHNICAL RESUME                              ║
╚═══════════════════════════════════════════════════════════════════╝

${formatted}

╔═══════════════════════════════════════════════════════════════════╗
║  Template: Technical | ATS-Optimized | Career Tools Suite        ║
╚═══════════════════════════════════════════════════════════════════╝`;
        break;

      case "creative":
        formatted = `★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★
              ✨ CREATIVE PROFESSIONAL RESUME ✨
★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★

${formatted}

★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★`;
        break;
    }

    return formatted;
  };

  const handlePreview = () => {
    if (!resume) {
      toast.error("No resume loaded");
      return;
    }

    let textToFormat = resume.originalText;

    if (useOptimized && selectedOptimizedId) {
      const optimized = optimizedResumes?.find(opt => opt._id === selectedOptimizedId);
      if (optimized) {
        textToFormat = optimized.optimizedText;
      }
    }

    const formatted = formatResumeForTemplate(textToFormat, selectedTemplate);
    setPreviewText(formatted);
    toast.success(`Preview generated with ${templates[selectedTemplate].name} template`);
  };

  const handleDownload = () => {
    if (!previewText) {
      toast.error("Generate a preview first");
      return;
    }

    const blob = new Blob([previewText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${selectedTemplate}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded!");
  };

  const handleCopy = () => {
    if (!previewText) {
      toast.error("Generate a preview first");
      return;
    }
    navigator.clipboard.writeText(previewText);
    toast.success("Copied to clipboard!");
  };

  if (!resume) {
    return (
      <div className="text-center py-20 bg-gray-50 border-2 border-gray-200">
        <p className="text-gray-600 uppercase tracking-wide text-sm font-semibold">Please upload a resume first</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
            T
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-black uppercase tracking-wide text-sm mb-1">Professional Resume Templates</h3>
            <p className="text-sm text-gray-700">
              Choose a template style and export your resume with professional formatting
            </p>
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="space-y-6">
        <label className="block text-sm font-semibold text-black uppercase tracking-wide">
          Choose Template Style
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(templates) as TemplateStyle[]).map((templateKey) => {
            const template = templates[templateKey];
            return (
              <button
                key={templateKey}
                onClick={() => setSelectedTemplate(templateKey)}
                className={`p-6 border-2 text-left transition-all duration-200 ${
                  selectedTemplate === templateKey
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white hover:border-black"
                }`}
              >
                <div className={`font-semibold mb-2 uppercase tracking-wide text-sm ${
                  selectedTemplate === templateKey ? "text-white" : "text-black"
                }`}>
                  {template.name}
                </div>
                <div className={`text-sm mb-3 ${
                  selectedTemplate === templateKey ? "text-gray-200" : "text-gray-700"
                }`}>
                  {template.description}
                </div>
                <div className={`text-xs font-mono ${
                  selectedTemplate === templateKey ? "text-gray-300" : "text-gray-500"
                }`}>
                  {template.preview}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Version Selection */}
      <div className="space-y-6">
        <label className="block text-sm font-semibold text-black uppercase tracking-wide">
          Resume Version
        </label>
        <div className="space-y-4">
          <label className="flex items-center gap-4 p-4 border-2 border-gray-200 cursor-pointer hover:border-black transition-all duration-200">
            <input
              type="radio"
              checked={!useOptimized}
              onChange={() => setUseOptimized(false)}
              className="w-5 h-5 accent-black"
            />
            <div>
              <div className="font-semibold text-black uppercase tracking-wide text-sm">Original Resume</div>
              <div className="text-sm text-gray-600 font-mono">{resume.fileName}</div>
            </div>
          </label>

          {optimizedResumes && optimizedResumes.length > 0 && (
            <label className="flex items-start gap-4 p-4 border-2 border-gray-200 cursor-pointer hover:border-black transition-all duration-200">
              <input
                type="radio"
                checked={useOptimized}
                onChange={() => setUseOptimized(true)}
                className="w-5 h-5 accent-black mt-1"
              />
              <div className="flex-1">
                <div className="font-semibold text-black mb-3 uppercase tracking-wide text-sm">Optimized Version</div>
                <select
                  value={selectedOptimizedId}
                  onChange={(e) => {
                    setSelectedOptimizedId(e.target.value);
                    setUseOptimized(true);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black outline-none bg-white"
                  disabled={!useOptimized}
                >
                  <option value="">-- Select optimized version --</option>
                  {optimizedResumes.map((opt) => (
                    <option key={opt._id} value={opt._id}>
                      {opt.optimizationType} - {new Date(opt.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div>
        <button
          onClick={handlePreview}
          className="btn-primary w-full"
        >
          Preview with Template
        </button>
      </div>

      {/* Preview */}
      {previewText && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-black uppercase tracking-wide">
              Preview: {templates[selectedTemplate].name}
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="btn-secondary"
              >
                Copy
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary"
              >
                Download TXT
              </button>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 p-6 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono">
              {previewText}
            </pre>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                i
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">Next Steps</h4>
                <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                  <li>Copy the formatted text and paste into Google Docs or Microsoft Word</li>
                  <li>Adjust fonts: Modern (Calibri), Classic (Times New Roman), Technical (Consolas)</li>
                  <li>Add your contact info header with proper formatting</li>
                  <li>Export as PDF for best compatibility</li>
                  <li>Keep it to 1-2 pages maximum</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
