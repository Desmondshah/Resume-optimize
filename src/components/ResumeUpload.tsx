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
      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
            i
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-black mb-2 uppercase tracking-wide">Recommended: Copy & Paste Method</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-black mb-1">Works with ANY format - 100% accurate</p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside ml-4">
                  <li>Open your resume (PDF, Word, Google Docs, etc.)</li>
                  <li>Select all text: <kbd className="px-2 py-1 bg-gray-200 text-xs font-mono">Ctrl+A</kbd> (or <kbd className="px-2 py-1 bg-gray-200 text-xs font-mono">Cmd+A</kbd>)</li>
                  <li>Copy: <kbd className="px-2 py-1 bg-gray-200 text-xs font-mono">Ctrl+C</kbd> (or <kbd className="px-2 py-1 bg-gray-200 text-xs font-mono">Cmd+C</kbd>)</li>
                  <li>Paste in the text area below</li>
                  <li>Click "Save Resume"</li>
                </ol>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm font-medium text-black mb-1">Alternative: Direct Upload</p>
                <p className="text-sm text-gray-700">You can also try uploading PDF or TXT files directly, though copy/paste is more reliable for complex PDFs.</p>
              </div>
            </div>
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
            Try Direct Upload
          </span>
          <span className="text-sm text-gray-600">
            Works best with simple PDF or TXT files
          </span>
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            PDF or TXT (Max 10MB)
          </span>
          {isUploading && (
            <span className="text-xs text-black font-medium uppercase tracking-wide animate-pulse">
              Processing file...
            </span>
          )}
        </label>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 uppercase tracking-wide">Recommended Method</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="resume-text" className="text-sm font-semibold text-black uppercase tracking-wide">
            Paste Your Resume Text
          </label>
          <span className="text-xs text-gray-500 uppercase tracking-wide">All formats supported</span>
        </div>
        <textarea
          id="resume-text"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="1. Open your resume (PDF, Word, etc.)&#10;2. Select all text (Ctrl+A or Cmd+A)&#10;3. Copy (Ctrl+C or Cmd+C)&#10;4. Paste here (Ctrl+V or Cmd+V)&#10;5. Click 'Save Resume' below&#10;&#10;This method works with ANY file format and ensures perfect text extraction!"
          className="w-full h-64 px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 resize-none font-mono text-sm bg-white"
          disabled={isUploading}
        />
        {resumeText.includes("%PDF") && (
          <div className="bg-gray-100 border border-gray-300 p-4 text-sm text-gray-800">
            ⚠️ Raw PDF content detected. Please upload the PDF file or copy the actual text from your PDF viewer.
          </div>
        )}
        <button
          onClick={handlePasteResume}
          disabled={isUploading || !resumeText.trim()}
          className="btn-primary w-full disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isUploading ? "Saving..." : "Save Resume"}
        </button>
      </div>
    </div>
  );
}
