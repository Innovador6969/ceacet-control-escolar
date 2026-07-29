import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        muted: "#667085",
        line: "#E4E7EC",
        surface: "#F7F8FA",
        brand: {
          50: "#EEF4FF",
          100: "#E0EAFF",
          500: "#4F46E5",
          600: "#4338CA",
          700: "#3730A3"
        },
        mint: "#12B76A",
        amber: "#F79009",
        rose: "#F04438",
        cyan: "#06AED4"
      },
      boxShadow: {
        panel: "0 18px 48px rgba(16, 24, 40, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
