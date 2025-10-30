import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

interface ResumeUploadProps {
  onUploadComplete?: (resumeId: Id<"resumes">) => void;
}

export function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const uploadResume = useMutation(api.resumes.uploadResume);
  const parsePDF = useAction(api.pdfParser.parsePDF);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Convert file to base64 using browser-compatible method
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Convert to base64 using browser APIs
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      
      // Call the server-side PDF parser
      const result = await parsePDF({
        pdfData: base64,
        fileName: file.name,
      });
      
      return result.text;
    } catch (error: any) {
      throw new Error(error.message || "Failed to parse PDF. Please ensure the PDF contains selectable text.");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let text = "";

      // Check file type and extract text accordingly
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        // Try using the PDF parser
        toast.info("Parsing PDF... This may take a moment.", { duration: 3000 });
        try {
          text = await extractTextFromPDF(file);
          toast.success("PDF parsed successfully!");
        } catch (pdfError: any) {
          // If PDF parsing fails, guide user to copy/paste method
          toast.error(pdfError.message || "PDF parsing failed. Please try the copy/paste method below.", {
            duration: 7000,
          });
          throw pdfError;
        }
      } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        text = await file.text();
      } else {
        // For DOC/DOCX or other formats, try reading as text (basic fallback)
        toast.warning("This file type may not be fully supported. Consider using PDF or pasting text directly.");
        text = await file.text();
      }

      // Check if we got valid text
      if (!text || text.trim().length === 0) {
        throw new Error("No text could be extracted from the file.");
      }

      // Check for PDF binary content (in case something went wrong)
      if (text.includes("%PDF-") || text.includes("endobj") || text.includes("stream")) {
        throw new Error("PDF was not properly parsed. Please try the copy/paste method below.");
      }

      setResumeText(text);
      
      const resumeId = await uploadResume({
        originalText: text,
        fileName: file.name,
        fileType: file.type,
      });

      toast.success("Resume uploaded successfully!");
      if (onUploadComplete) {
        onUploadComplete(resumeId);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to upload resume";
      // Don't show duplicate error toast if we already showed one
      if (!errorMessage.includes("copy/paste method")) {
        toast.error(errorMessage);
      }
      console.error(error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handlePasteResume = async () => {
    if (!resumeText.trim()) {
      toast.error("Please paste your resume text");
      return;
    }

    // Check if user accidentally pasted PDF binary content
    if (resumeText.includes("%PDF-") || resumeText.includes("endobj") || resumeText.includes("stream")) {
      toast.error("It looks like you pasted raw PDF content. Please upload the PDF file instead or copy the actual text from your PDF viewer.");
      return;
    }

    setIsUploading(true);
    try {
      const resumeId = await uploadResume({
        originalText: resumeText,
        fileName: "pasted-resume.txt",
        fileType: "text/plain",
      });

      toast.success("Resume saved successfully!");
      if (onUploadComplete) {
        onUploadComplete(resumeId);
      }
    } catch (error) {
      toast.error("Failed to save resume");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Simplified Info Banner */}
      <div className="bg-black text-white p-6">
        <h4 className="text-sm font-bold mb-3 uppercase tracking-wide">📋 Two Ways to Upload</h4>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold mb-2">✅ Best: Copy & Paste (Recommended)</p>
            <ol className="space-y-1 ml-4 list-decimal opacity-90">
              <li>Open your resume in any program</li>
              <li>Select all (Ctrl+A or Cmd+A)</li>
              <li>Copy (Ctrl+C or Cmd+C)</li>
              <li>Paste below and click "Save Resume"</li>
            </ol>
          </div>
          <div className="pt-3 border-t border-gray-700">
            <p className="font-semibold mb-1">⚡ Quick: File Upload</p>
            <p className="opacity-90">Upload PDF or TXT files directly (best for simple resumes)</p>
          </div>
        </div>
      </div>

      <div className="border-2 border-gray-200 p-12 text-center hover:border-black transition-all duration-200">
        <input
          type="file"
          id="resume-upload"
          className="hidden"
          accept=".pdf,.txt,.doc,.docx"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <label
          htmlFor="resume-upload"
          className="cursor-pointer flex flex-col items-center space-y-4"
        >
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-lg font-semibold text-black uppercase tracking-wide">
            Click to Upload File
          </span>
          <span className="text-sm text-gray-600">
            PDF, TXT, DOC, DOCX
          </span>
          {isUploading && (
            <span className="text-xs text-black font-medium uppercase tracking-wide animate-pulse">
              Processing...
            </span>
          )}
        </label>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-black font-semibold uppercase tracking-wide">OR PASTE TEXT</span>
        </div>
      </div>

      <div className="space-y-4">
        <label htmlFor="resume-text" className="block text-sm font-semibold text-black uppercase tracking-wide">
          Paste Resume Text Here
        </label>
        <textarea
          id="resume-text"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here...&#10;&#10;💡 Tip: Works with any format (PDF, Word, Google Docs, etc.)"
          className="w-full h-64 px-4 py-4 border-2 border-gray-300 focus:border-black outline-none transition-all duration-200 resize-none font-mono text-sm bg-white"
          disabled={isUploading}
        />
        {resumeText.includes("%PDF") && (
          <div className="bg-gray-900 text-white border-2 border-gray-900 p-4 text-sm">
            ⚠️ This looks like raw PDF data. Please copy the actual text from your PDF viewer instead.
          </div>
        )}
        <button
          onClick={handlePasteResume}
          disabled={isUploading || !resumeText.trim()}
          className="w-full py-4 bg-black text-white font-semibold uppercase tracking-wide hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isUploading ? "SAVING..." : "SAVE RESUME"}
        </button>
      </div>
    </div>
  );
}
