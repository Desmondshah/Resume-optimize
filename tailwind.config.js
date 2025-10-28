const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        mono: ["JetBrains Mono", ...fontFamily.mono],
      },
      borderRadius: {
        DEFAULT: "0",
        secondary: "0",
        container: "0",
      },
      boxShadow: {
        DEFAULT: "none",
        hover: "none",
        subtle: "0 1px 3px rgba(0, 0, 0, 0.05)",
      },
      colors: {
        primary: {
          DEFAULT: "#000000",
          hover: "#171717",
        },
        secondary: {
          DEFAULT: "#393c41",
          hover: "#171717",
        },
        accent: {
          DEFAULT: "#3e6ae1",
          hover: "#2e5ac7",
        },
        tesla: {
          red: "#e82127",
          blue: "#3e6ae1",
          gray: "#f4f4f4",
          darkgray: "#393c41",
        },
      },
      spacing: {
        "form-field": "16px",
        section: "48px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover", "active"],
    },
  },
};
