import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        executing: "#8B5CF6", // Purple
        influencing: "#F97316", // Orange
        relationship: "#3B82F6", // Blue
        strategic: "#10B981", // Emerald/Green
      },
    },
  },
  plugins: [],
};
export default config;
