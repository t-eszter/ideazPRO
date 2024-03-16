/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./frontend/src/**/*.{html,js,jsx}"],
  plugins: [require("daisyui"), require("@tailwindcss/line-clamp")],
  daisyui: {
    themes: [
      {
        ideaz: {
          primary: "#005a8a",
          secondary: "#0480b3",
          accent: "#E16C37",
          neutral: "#f1f7f8",
          "base-100": "#fafafa",
        },
      },
    ],
  },
  variants: {
    extend: {
      opacity: ["hover", "before", "after", "hover:before", "hover:after"],
      inset: ["before", "after"],
      backgroundImage: ["before", "after", "hover:before", "hover:after"],
      gradientColorStops: ["before", "after", "hover:before", "hover:after"],
    },
  },
  theme: {
    extend: {
      fontFamily: {
        source: ["Source Serif Pro", "serif"],
        rubik: ["Rubik", "sans-serif"],
        kumbh: ["Kumbh Sans", "sans-serif"],
        sans: ["Kumbh Sans", "sans-serif"],
      },

      backgroundSize: {
        "size-200": "200% 200%",
      },
      backgroundPosition: {
        "pos-0": "0% 0%",
        "pos-100": "100% 100%",
      },
      dropShadow: {
        card: "5px 5px rgba(0, 0, 0, 0.05)",
      },
      colors: {
        link: "#0074BD",
        lochmara: {
          900: "#005a8a",
          800: "#0064a0",
          700: "#006eb6",
          600: "#0078cc",
          500: "#0074BD", // Base Color
          400: "#3382c0",
          300: "#6690c4",
          200: "#99a0c8",
          100: "#ccd0dc",
          50: "#e6e8f0",
        },
        cerulean: {
          900: "#0480b3",
          800: "#048cc6",
          700: "#0498d9",
          600: "#04a4ec",
          500: "#05A8E0", // Base Color
          400: "#3cb1e4",
          300: "#73b9e8",
          200: "#a9c2ec",
          100: "#e0eaf0",
          50: "#f0f5f8",
        },
        sinbad: {
          900: "#6994a3",
          800: "#7ca1ad",
          700: "#8eafb7",
          600: "#a0bcc1",
          500: "#9ACAD6", // Base Color
          400: "#a9d1dc",
          300: "#b7d8e2",
          200: "#c5dfe8",
          100: "#e2ecf0",
          50: "#f1f7f8",
        },
        alabaster: {
          900: "#c2c2c2",
          800: "#d0d0d0",
          700: "#dedede",
          600: "#ebebeb",
          500: "#FAFAFA", // Base Color
          400: "#fcfcfc",
          300: "#fdfdfd",
          200: "#fefefe",
          100: "#FAFAFA",
          50: "#ffffff",
        },
        flamingo: {
          900: "#b24c1b",
          800: "#be551d",
          700: "#cb5e20",
          600: "#d76723",
          500: "#F26321", // Base Color
          400: "#f4763f",
          300: "#f6895d",
          200: "#f99c7b",
          100: "#fcb599",
          50: "#fdd7b7",
        },
      },
    },
  },
};
