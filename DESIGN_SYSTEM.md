# Tesla Design System - Quick Reference

## 🎨 Color Variables

```css
/* Primary Colors */
--color-black: #000000      /* Main brand, buttons, text */
--color-white: #ffffff      /* Backgrounds, button text */

/* Gray Scale */
--color-gray-50: #f4f4f4    /* Light backgrounds */
--color-gray-200: #e5e5e5   /* Borders, dividers */
--color-gray-300: #d4d4d4   /* Input underlines */
--color-gray-400: #a3a3a3   /* Disabled states */
--color-gray-500: #737373   /* Secondary text */
--color-gray-600: #525252   /* Body text */
--color-gray-900: #171717   /* Dark text, hover states */

/* Accent */
--color-accent: #3e6ae1     /* Call-to-action */
--color-accent-hover: #2e5ac7
```

## 🔤 Typography Scale

```css
/* Headings */
.heading-hero:     text-5xl font-bold tracking-tight      /* 48px */
.heading-section:  text-3xl font-semibold tracking-tight  /* 30px */
.heading-card:     text-2xl font-semibold tracking-tight  /* 24px */
.heading-sub:      text-xl font-semibold tracking-tight   /* 20px */

/* Body Text */
.body-large:       text-xl text-gray-600                  /* 20px */
.body-normal:      text-base text-gray-700                /* 16px */
.body-small:       text-sm text-gray-600                  /* 14px */

/* Labels & Meta */
.label-primary:    text-sm font-semibold uppercase tracking-wide  /* 14px */
.label-secondary:  text-xs uppercase tracking-wide text-gray-500  /* 12px */
```

## 📦 Spacing System

Based on 4px grid:

```css
/* Padding/Margin */
p-1:  4px
p-2:  8px
p-3:  12px
p-4:  16px
p-6:  24px
p-8:  32px
p-12: 48px
p-16: 64px
p-20: 80px

/* Gaps */
gap-1:  4px    /* Tight elements */
gap-2:  8px    /* Related items */
gap-4:  16px   /* Sections */
gap-6:  24px   /* Major sections */
gap-8:  32px   /* Page sections */
```

## 🔘 Button Styles

### Primary Button (Black)
```html
<button class="btn-primary">
  <!-- Or manually: -->
  <button class="px-6 py-3 bg-black text-white font-medium 
                 hover:bg-gray-900 transition-all duration-200 
                 uppercase text-sm tracking-wider">
    Click Me
  </button>
</button>
```

### Secondary Button (White with Black Border)
```html
<button class="btn-secondary">
  <!-- Or manually: -->
  <button class="px-6 py-3 bg-white text-black border-2 border-black 
                 font-medium hover:bg-black hover:text-white 
                 transition-all duration-200 uppercase text-sm tracking-wider">
    Click Me
  </button>
</button>
```

### Accent Button (Blue)
```html
<button class="btn-accent">
  <!-- Or manually: -->
  <button class="px-6 py-3 bg-accent text-white font-medium 
                 hover:bg-accent-hover transition-all duration-200 
                 uppercase text-sm tracking-wider">
    Click Me
  </button>
</button>
```

## 📝 Input Styles

### Text Input (Underline Style)
```html
<input class="w-full px-4 py-4 border-0 border-b-2 border-gray-300 
              focus:border-black outline-none transition-all duration-200 
              bg-white" 
       type="text" 
       placeholder="Enter text">
```

### Textarea (Underline Style)
```html
<textarea class="w-full h-32 px-4 py-4 border-0 border-b-2 border-gray-300 
                 focus:border-black outline-none transition-all duration-200 
                 resize-none bg-white" 
          placeholder="Enter text"></textarea>
```

### Label
```html
<label class="block text-sm font-semibold text-black mb-3 
              uppercase tracking-wide">
  Field Name
</label>
```

## 📋 Card Components

### Basic Card
```html
<div class="bg-white border-2 border-gray-200 p-6 
            hover:border-black transition-all duration-200">
  <!-- Content -->
</div>
```

### Info Banner
```html
<div class="bg-gray-50 border border-gray-200 p-6">
  <div class="flex items-start space-x-4">
    <div class="flex-shrink-0 w-8 h-8 bg-black text-white 
                flex items-center justify-center text-sm font-bold">
      i
    </div>
    <div class="flex-1">
      <h4 class="text-sm font-semibold text-black mb-2 
                uppercase tracking-wide">
        Title
      </h4>
      <p class="text-sm text-gray-700">Content here</p>
    </div>
  </div>
</div>
```

### Action Card
```html
<button class="text-left p-6 border-2 border-gray-200 
               hover:border-black transition-all duration-200 w-full">
  <div class="font-semibold text-lg mb-2">Title</div>
  <div class="text-sm text-gray-500 uppercase tracking-wide">
    Subtitle
  </div>
</button>
```

## 🗂️ Navigation Tabs

### Main Tabs
```html
<div class="flex overflow-x-auto border-b border-gray-200">
  <button class="px-8 py-4 font-medium tracking-wide whitespace-nowrap 
                 transition-all border-b-4 border-black text-black">
    ACTIVE TAB
  </button>
  <button class="px-8 py-4 font-medium tracking-wide whitespace-nowrap 
                 transition-all text-gray-500 hover:text-black">
    INACTIVE TAB
  </button>
</div>
```

### Sub Tabs
```html
<div class="flex flex-wrap gap-1 mb-10 border-b border-gray-200">
  <button class="px-6 py-3 font-medium tracking-wide transition-all 
                 border-b-4 border-black text-black">
    ACTIVE
  </button>
  <button class="px-6 py-3 font-medium tracking-wide transition-all 
                 text-gray-500 hover:text-black">
    INACTIVE
  </button>
</div>
```

## 🎭 Animations

### Fade In
```html
<div class="animate-fade-in">
  <!-- Content fades in on mount -->
</div>
```

### Slide Up
```html
<div class="animate-slide-up">
  <!-- Content slides up with fade on mount -->
</div>
```

## 📐 Layout Patterns

### Hero Section (Full Width Black)
```html
<section class="bg-black text-white py-20 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="max-w-3xl">
      <h2 class="text-5xl font-bold mb-6 tracking-tight">
        Hero Title
      </h2>
      <p class="text-xl text-gray-300 leading-relaxed">
        Subtitle or description
      </p>
    </div>
  </div>
</section>
```

### Info Section (Gray Background)
```html
<section class="py-16 px-6 bg-gray-50">
  <div class="max-w-7xl mx-auto">
    <h3 class="text-3xl font-semibold text-center mb-16 tracking-tight">
      Section Title
    </h3>
    <!-- Content -->
  </div>
</section>
```

### Content Section (White Background)
```html
<section class="py-12 px-6 bg-white">
  <div class="max-w-7xl mx-auto">
    <h3 class="text-3xl font-semibold mb-8 tracking-tight">
      Section Title
    </h3>
    <!-- Content -->
  </div>
</section>
```

### Grid Layouts
```html
<!-- 4 Columns (Desktop) -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
  <!-- Items -->
</div>

<!-- 3 Columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Items -->
</div>

<!-- 2 Columns -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <!-- Items -->
</div>
```

## 🎯 Best Practices

### DO ✅
- Use uppercase for navigation and labels
- Keep sharp corners (no border-radius)
- Use black/white as primary colors
- Add generous spacing
- Use smooth 200ms transitions
- Invert colors on hover (black↔white)
- Use clean underline inputs
- Keep animations minimal

### DON'T ❌
- Add rounded corners
- Use colorful backgrounds
- Add drop shadows
- Use emojis in UI
- Make buttons too small
- Use blue as primary color
- Add unnecessary decorations
- Over-animate elements

## 📱 Responsive Classes

```html
<!-- Hide on mobile, show on desktop -->
<div class="hidden md:block">Desktop only</div>

<!-- Show on mobile, hide on desktop -->
<div class="block md:hidden">Mobile only</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  <!-- Stacks on mobile, 2 cols on tablet, 4 on desktop -->
</div>

<!-- Responsive spacing -->
<div class="py-8 md:py-12 lg:py-16">
  <!-- More padding on larger screens -->
</div>
```

## 🔍 States

### Disabled
```html
<button class="btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed" 
        disabled>
  Disabled Button
</button>
```

### Loading
```html
<button class="btn-primary" disabled>
  Processing...
</button>
```

### Focus
```html
<!-- Inputs automatically get black border on focus -->
<input class="border-b-2 border-gray-300 focus:border-black">
```

### Hover
```html
<!-- All interactive elements should have hover states -->
<button class="text-gray-500 hover:text-black transition-all">
  Hover Me
</button>
```

---

**Pro Tip**: When in doubt, look at Tesla's website for inspiration!
