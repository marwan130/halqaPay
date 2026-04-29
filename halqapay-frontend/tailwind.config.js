/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#002645",
          container: "#1a3c5e",
          on: "#ffffff",
          muted: "#87a7ce",
          fixed: "#d1e4ff"
        },
        secondary: {
          DEFAULT: "#735c00",
          container: "#fed65b",
          "on-container": "#745c00"
        },
        background: "#f8f9fa",
        surface: {
          DEFAULT: "#f8f9fa",
          low: "#f3f4f5",
          high: "#e7e8e9",
          container: "#edeeef",
          lowest: "#ffffff"
        },
        on: {
          surface: {
            DEFAULT: "#191c1d",
            variant: "#43474e"
          },
          background: "#191c1d"
        },
        outline: {
          DEFAULT: "#73777f",
          variant: "#c3c6cf"
        },
        accent: "#fed65b",
        danger: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6"
        }
      },
      maxWidth: {
        containerMax: "1200px"
      },
      boxShadow: {
        card: "0px 4px 12px rgba(26, 60, 94, 0.05)",
        cardLg: "0px 8px 24px rgba(115, 92, 0, 0.1)"
      },
      borderRadius: {
        card: "1rem",
        modal: "1.5rem"
      },
      spacing: {
        gutter: "24px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "32px"
      }
    }
  },
  plugins: []
};
