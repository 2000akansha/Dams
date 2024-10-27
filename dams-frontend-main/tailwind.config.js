/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#153c63",
        secondary: "#2b79c7",
      },
    },
  },
  plugins: [
    function ({ addComponents, theme }) {
      addComponents({
        ".error": {
          color: "rgb(239, 68, 68)",
          fontSize: "12px",
          position: "absolute",
          lineHeight: "1",
        },
        ".custom-input": {
          width: "100%",
          padding: "12px 20px",
          border: `1.25px solid ${theme("colors.secondary")}`,
          outlineColor: theme("colors.secondary"),
          borderRadius: "8px",
          boxSizing: "border-box",
          display: "inline-block",
          fontSize: "16px",
          "::placeholder": {
            color: theme("colors.secondary"),
            fontWeight: "600",
          },
        },
        ".hide-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        ".hide-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        ".custom-scrollbar::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        ".custom-scrollbar::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(100, 100, 255, 0.6)",
          borderRadius: "10px",
          border: "2px solid transparent",
          backgroundClip: "padding-box",
        },
        ".custom-scrollbar::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "rgba(100, 100, 255, 0.8)",
        },
        ".custom-scrollbar::-webkit-scrollbar-track": {
          backgroundColor: "rgba(200, 200, 255, 0.2)",
          borderRadius: "10px",
        },
      });
    },
  ],
};
