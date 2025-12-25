/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Anxiety-safe color palette - no harsh reds
        safe: {
          green: '#10B981',   // Success - calm green
          blue: '#3B82F6',    // Primary action
          purple: '#8B5CF6',  // Hint/help
          amber: '#F59E0B',   // Gentle attention
          gray: '#6B7280',    // Neutral
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
