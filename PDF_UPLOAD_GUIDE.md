# PDF Upload Feature

## Overview
The application now supports direct PDF uploads with automatic text extraction. Users no longer need to manually copy and paste text from their PDF resumes.

## How It Works

### Architecture
1. **Frontend (ResumeUpload.tsx)**: Handles file selection and converts PDF to base64
2. **Backend (pdfParser.ts)**: Uses pdf.js to extract text from PDF files
3. **Convex Actions**: Processes PDFs server-side for better performance and reliability

### User Flow
1. User selects a PDF file from their computer
2. File is converted to base64 in the browser
3. Base64 data is sent to Convex action `parsePDF`
4. Server extracts text using pdf.js (Node.js environment)
5. Extracted text is returned to the frontend
6. Text is saved to the database via `uploadResume` mutation

## Supported Formats
- **PDF** (✅ Fully supported with automatic text extraction)
- **TXT** (✅ Direct text reading)
- **DOC/DOCX** (⚠️ Basic support - may require copy/paste for best results)

## Technical Details

### PDF Parser (`convex/pdfParser.ts`)
- Uses `pdfjs-dist` library (already installed)
- Two methods available:
  - `parsePDF`: Takes base64-encoded PDF data
  - `parsePDFFromStorage`: Takes Convex storage ID (for future use)
- Extracts text page by page
- Cleans up whitespace and formatting
- Handles errors gracefully (encrypted PDFs, corrupted files, etc.)

### Component Updates (`src/components/ResumeUpload.tsx`)
- Added `useAction` hook for PDF parsing
- Updated file input to accept `.pdf` files
- Browser-compatible base64 conversion
- Improved UI messaging
- Loading states during PDF processing

## Error Handling
The system provides helpful error messages for:
- Empty or image-only PDFs
- Password-protected PDFs
- Corrupted PDF files
- Network/processing errors

## Performance Considerations
- Large PDFs (10+ pages) may take 2-3 seconds to process
- Processing happens server-side to avoid browser memory issues
- Toast notifications keep users informed during processing

## Future Enhancements
- [ ] Support for scanned PDFs (OCR)
- [ ] Batch PDF processing
- [ ] PDF preview before extraction
- [ ] Better formatting preservation
- [ ] Direct Word document support

## Testing
Test with various PDF types:
1. Simple text PDF (✅ Works great)
2. Complex multi-column PDF (⚠️ May need manual cleanup)
3. Scanned/image PDF (❌ Not supported - use copy/paste)
4. Password-protected PDF (❌ Returns clear error message)

## Dependencies
- `pdfjs-dist@^5.4.296` - Already installed
- Uses legacy build for Node.js compatibility
- No additional dependencies required
