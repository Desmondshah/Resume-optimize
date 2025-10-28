import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Parse PDF file from base64 data and extract text
 * Uses a simpler approach compatible with Convex runtime
 */
export const parsePDF = action({
  args: {
    pdfData: v.string(), // base64 encoded PDF
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // For Convex compatibility, we'll use a fetch-based approach
      // that doesn't rely on structuredClone or canvas APIs
      
      // Option 1: Try using pdf-parse library if available
      // For now, we'll use a basic text extraction approach
      
      const pdfBuffer = Buffer.from(args.pdfData, "base64");
      
      // Simple text extraction - looking for text streams in PDF
      const pdfText = pdfBuffer.toString('binary');
      
      // Extract text between stream markers
      const textRegex = /BT\s*(.*?)\s*ET/gs;
      const textContentRegex = /\((.*?)\)/g;
      
      let extractedText = '';
      let streamMatch;
      
      while ((streamMatch = textRegex.exec(pdfText)) !== null) {
        const streamContent = streamMatch[1];
        let textMatch;
        
        while ((textMatch = textContentRegex.exec(streamContent)) !== null) {
          extractedText += textMatch[1] + ' ';
        }
        extractedText += '\n';
      }
      
      // Clean up the extracted text
      const cleanedText = extractedText
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
      
      if (!cleanedText || cleanedText.length < 50) {
        throw new Error("Could not extract text from PDF. This might be a scanned document or image-based PDF. Please try the copy/paste method instead.");
      }
      
      // Count approximate pages (rough estimate)
      const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g);
      const numPages = pageMatches ? pageMatches.length : 1;
      
      return {
        text: cleanedText,
        numPages,
        fileName: args.fileName,
      };
      
    } catch (error: any) {
      console.error("PDF parsing error:", error);
      
      // Provide helpful error messages
      if (error.message?.includes("Invalid PDF")) {
        throw new Error("This PDF file appears to be corrupted. Please try re-saving it or using the copy/paste method.");
      }
      
      if (error.message?.includes("password")) {
        throw new Error("This PDF is password-protected. Please remove the password protection and try again.");
      }
      
      if (error.message?.includes("extract text")) {
        throw error; // Re-throw our custom message
      }
      
      throw new Error(`Failed to parse PDF. Please try the copy/paste method: ${error.message || "Unknown error"}`);
    }
  },
});

/**
 * Alternative: Parse PDF from uploaded file storage
 * Note: This is a fallback using basic text extraction
 */
export const parsePDFFromStorage = action({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Get the file from storage
      const fileUrl = await ctx.storage.getUrl(args.storageId as any);
      
      if (!fileUrl) {
        throw new Error("File not found in storage");
      }
      
      // Fetch the file
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);
      
      // Simple text extraction
      const pdfText = pdfBuffer.toString('binary');
      
      // Extract text between stream markers
      const textRegex = /BT\s*(.*?)\s*ET/gs;
      const textContentRegex = /\((.*?)\)/g;
      
      let extractedText = '';
      let streamMatch;
      
      while ((streamMatch = textRegex.exec(pdfText)) !== null) {
        const streamContent = streamMatch[1];
        let textMatch;
        
        while ((textMatch = textContentRegex.exec(streamContent)) !== null) {
          extractedText += textMatch[1] + ' ';
        }
        extractedText += '\n';
      }
      
      // Clean up the extracted text
      const cleanedText = extractedText
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
      
      if (!cleanedText || cleanedText.length < 50) {
        throw new Error("Could not extract text from PDF. Please try the copy/paste method.");
      }
      
      // Count approximate pages
      const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g);
      const numPages = pageMatches ? pageMatches.length : 1;
      
      return {
        text: cleanedText,
        numPages,
      };
      
    } catch (error: any) {
      console.error("PDF parsing error:", error);
      throw new Error(`Failed to parse PDF: ${error.message || "Unknown error"}`);
    }
  },
});
