/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern color palette
        'primary-black': '#0f172a',
        'secondary-black': '#1e293b',
        'tertiary-black': '#334155',
        'primary-white': '#ffffff',
        'secondary-white': '#f8fafc',
        'tertiary-white': '#e2e8f0',
        
        // Vibrant accent colors
        'brand-blue': '#3b82f6',
        'brand-blue-hover': '#2563eb',
        'brand-blue-light': '#dbeafe',
        'brand-green': '#10b981',
        'brand-green-dark': '#059669',
        'brand-green-light': '#d1fae5',
        'brand-red': '#ef4444',
        'brand-red-dark': '#dc2626',
        'brand-red-light': '#fee2e2',
        'brand-purple': '#8b5cf6',
        'brand-purple-light': '#ede9fe',
        'brand-yellow': '#f59e0b',
        'brand-yellow-light': '#fef3c7',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      },
    },
  },
  plugins: [],
}
