/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './sections/**/*.{js,vue,ts}',
    './app/**/*.vue',
    './app.vue',
    './error.vue'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ground: 'var(--ground)',
        sheet: 'var(--sheet)',
        inset: 'var(--inset)',
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
          hover: 'var(--ink-hover)'
        },
        rule: 'var(--rule)',
        accent: 'var(--accent)',
        danger: 'var(--danger)',
        success: 'var(--success)'
      },
      fontFamily: {
        sans: ['IBM Plex Sans Variable', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        read: ['Literata Variable', 'Literata', 'Georgia', 'serif']
      },
      fontSize: {
        meta: ['0.8125rem', { lineHeight: '1.4' }],
        ui: ['0.9375rem', { lineHeight: '1.45' }],
        reading: ['1.1875rem', { lineHeight: '1.65' }],
        title: ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        display: [
          'clamp(2.25rem, 1.6rem + 2.2vw, 3.25rem)',
          { lineHeight: '0.98', letterSpacing: '-0.03em' }
        ]
      },
      maxWidth: {
        frame: '1400px',
        read: '68ch'
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px'
      }
    }
  },
  plugins: []
}
