# Testing PDF Upload Feature

## Quick Test Steps

### 1. Restart Convex Dev Server
The new `pdfParser.ts` file needs to be registered with Convex.

```powershell
# Stop the current dev server (Ctrl+C in the terminal running it)
# Then restart:
npm run dev:backend
```

### 2. Test PDF Upload

1. Start the application:
   ```powershell
   npm run dev
   ```

2. Navigate to the Resume Upload section

3. Try uploading a PDF file:
   - Click "Upload Resume"
   - Select a PDF file from your computer
   - Wait for the processing message
   - Verify the text is extracted and displayed

### 3. Expected Behavior

**✅ Success Case:**
- "Parsing PDF... This may take a moment." toast appears
- "PDF parsed successfully!" toast appears
- "Resume uploaded successfully!" toast appears
- Text area shows the extracted text

**❌ Error Cases:**
- Password-protected PDF → Clear error message
- Corrupted PDF → Error with instructions
- Empty/image-only PDF → "PDF appears to be empty or contains mostly images"

### 4. Fallback Method

If PDF upload has issues, the copy/paste method still works:
1. Open PDF in any viewer
2. Ctrl+A to select all
3. Ctrl+C to copy
4. Paste in the text area
5. Click "Save Resume"

## Troubleshooting

### Error: "parsePDF is not a function"
**Solution:** The Convex dev server needs to be restarted to pick up the new file.
```powershell
# In the terminal running convex dev:
Ctrl+C
npm run dev:backend
```

### Error: "Failed to parse PDF"
**Possible causes:**
- PDF is password-protected → Remove password
- PDF contains only images → Use OCR tool first or copy/paste
- PDF is corrupted → Try re-saving the PDF

### PDF parsing is slow
**Expected:** Large PDFs (10+ pages) may take 2-3 seconds. This is normal.

## Developer Notes

### Files Modified
- `convex/pdfParser.ts` - New PDF parsing actions
- `src/components/ResumeUpload.tsx` - Updated to use PDF parser
- `PDF_UPLOAD_GUIDE.md` - Documentation

### Key Dependencies
- `pdfjs-dist@^5.4.296` - Already installed, no new packages needed

### API Endpoints
- `api.pdfParser.parsePDF` - Main PDF parsing action
- `api.pdfParser.parsePDFFromStorage` - Alternative method (for future use)
