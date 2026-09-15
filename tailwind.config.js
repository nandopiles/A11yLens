/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Technical Precision palette (from DESIGN.md)
        surface: {
          DEFAULT: '#faf8ff',
          dim: '#d2d9f4',
          bright: '#faf8ff',
          lowest: '#ffffff',
          low: '#f2f3ff',
          container: '#eaedff',
          high: '#e2e7ff',
          highest: '#dae2fd',
        },
        canvas: '#ffffff',
        panel: '#f8fafc',
        hover: '#f1f5f9',
        ink: '#0f172a',
        'ink-muted': '#334155',
        'ink-soft': '#434655',
        placeholder: '#94a3b8',
        hairline: '#e2e8f0',
        'hairline-strong': '#cbd5e1',
        primary: {
          DEFAULT: '#1d4ed8',
          strong: '#0037b0',
          on: '#ffffff',
        },
        secondary: {
          DEFAULT: '#4338ca',
          on: '#ffffff',
        },
        danger: {
          DEFAULT: '#ba1a1a',
          on: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-hero': ['40px', { lineHeight: '48px', letterSpacing: '-0.025em', fontWeight: '600' }],
        'headline-lg': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', letterSpacing: '-0.015em', fontWeight: '600' }],
        'headline-sm': ['16px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['15px', { lineHeight: '24px' }],
        'body-md': ['14px', { lineHeight: '22px' }],
        'body-sm': ['13px', { lineHeight: '18px' }],
        caption: ['12px', { lineHeight: '16px' }],
        'label-code': ['12px', { lineHeight: '16px', letterSpacing: '-0.01em', fontWeight: '500' }],
        'label-badge': ['11px', { lineHeight: '14px', letterSpacing: '0.02em', fontWeight: '500' }],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      maxWidth: {
        content: '1280px',
        workspace: '1440px',
      },
      boxShadow: {
        overlay:
          '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
