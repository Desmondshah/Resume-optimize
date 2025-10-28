# Component Update Guide - Tesla Design

## Updated Components ✅

1. **App.tsx** - Main layout with Tesla-inspired navigation
2. **SignInForm.tsx** - Minimalist auth form
3. **SignOutButton.tsx** - Clean header button
4. **ResumeUpload.tsx** - Streamlined upload interface
5. **JobDescription.tsx** - Modern form styling
6. **ResumeOptimizer.tsx** - Complete Tesla redesign
7. **CoverLetterGenerator.tsx** - Clean letter generation UI
8. **BulletPointImprover.tsx** - Minimalist improvement tool
9. **ResumeComparison.tsx** - Side-by-side comparison view

## Pattern Guide for Remaining Updates

### Info Banners
Replace:
```jsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
```

With:
```jsx
<div className="bg-gray-50 border border-gray-200 p-6">
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
      ICON
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-black uppercase tracking-wide text-sm mb-1">Title</h3>
      <p className="text-sm text-gray-700">Description</p>
    </div>
  </div>
</div>
```

### Buttons
Replace:
```jsx
className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
```

With:
```jsx
className="btn-primary"  // or btn-secondary, btn-accent
```

### Input Fields
Replace:
```jsx
className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
```

With:
```jsx
className="border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200"
```

### Labels
Replace:
```jsx
className="text-sm font-medium text-gray-700 mb-2"
```

With:
```jsx
className="text-sm font-semibold text-black mb-3 uppercase tracking-wide"
```

### Cards/Boxes
Replace:
```jsx
className="border border-gray-200 rounded-lg p-4 hover:border-blue-300"
```

With:
```jsx
className="border-2 border-gray-200 p-6 hover:border-black transition-all duration-200"
```

### Color-Coded Elements (Tags/Badges)
Replace colorful rounded pills:
```jsx
className="px-3 py-1 bg-green-100 text-green-800 rounded-full"
```

With:
```jsx
className="px-4 py-2 bg-black text-white font-medium"  // or bg-white border-2 border-black
```

### Remove
- All `rounded-lg`, `rounded-full` classes
- `bg-gradient` classes
- Colorful backgrounds (blue-50, purple-50, etc.)
- Shadow classes
- Emoji decorations from UI text (keep in placeholders/tips)

### Typography
- All headings: Add `uppercase tracking-wide`
- Important text: Use `font-semibold` instead of `font-bold`
- Metadata: Add `uppercase tracking-wide text-xs`

## Quick Replacements

1. **Remove all rounded corners:**
   - `rounded-lg` → (remove)
   - `rounded-full` → (remove)
   - `rounded` → (remove)

2. **Update colors:**
   - `bg-blue-*` → `bg-gray-50` or `bg-black`
   - `bg-purple-*` → `bg-gray-50` or `bg-black`
   - `bg-green-*` → `bg-gray-50` or `bg-black`
   - `border-blue-*` → `border-gray-200`
   - `text-blue-*` → `text-black` or `text-gray-700`

3. **Button patterns:**
   - Primary action → `btn-primary`
   - Secondary action → `btn-secondary`
   - Accent/special → `btn-accent`

4. **Empty states:**
   ```jsx
   <div className="text-center py-20">
     <p className="text-gray-500 uppercase tracking-wide text-sm">Message here</p>
   </div>
   ```

## Fonts

Inter font is now loaded for the entire app with proper weights (300-900).
JetBrains Mono is available for code/monospace text.

Use:
- `font-sans` (default)
- `font-mono` for code blocks

## Spacing

Use generous spacing:
- Section gaps: `space-y-10`
- Card padding: `p-6` or `p-8`
- Input padding: `px-4 py-4`
- Button padding: `px-6 py-3`

## Complete Example Transformation

### Before:
```jsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <h3 className="font-semibold text-blue-900 mb-2">Interview Prep</h3>
  <p className="text-sm text-blue-700">Generate questions</p>
</div>

<button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
  Generate
</button>
```

### After:
```jsx
<div className="bg-gray-50 border border-gray-200 p-6">
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
      I
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-black uppercase tracking-wide text-sm mb-1">Interview Prep</h3>
      <p className="text-sm text-gray-700">Generate interview questions</p>
    </div>
  </div>
</div>

<button className="btn-primary w-full">
  Generate
</button>
```
