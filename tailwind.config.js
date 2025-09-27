/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8'
        },
        // Accent colors
        accent: {
          DEFAULT: '#f97316',
          hover: '#ea580c'
        },
        // Background colors
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f1f5f9'
        },
        // Text colors
        text: {
          DEFAULT: '#1f2937',
          secondary: '#64748b'
        },
        // Status colors
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}