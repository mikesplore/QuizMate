/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional slate grays
        'primary-black': '#0f172a',    // slate-900
        'secondary-black': '#1e293b',   // slate-800
        'tertiary-black': '#334155',    // slate-700
        'primary-white': '#ffffff',
        'secondary-white': '#f8fafc',   // slate-50
        'tertiary-white': '#e2e8f0',    // slate-200
        
        // Professional accent colors
        'brand-blue': '#3b82f6',        // blue-500
        'brand-blue-hover': '#2563eb',  // blue-600
        'brand-blue-light': '#dbeafe',  // blue-50
        'brand-green': '#10b981',       // emerald-500
        'brand-green-dark': '#059669',  // emerald-600
        'brand-green-light': '#d1fae5', // emerald-50
        'brand-red': '#ef4444',         // red-500
        'brand-red-dark': '#dc2626',    // red-600
        'brand-red-light': '#fee2e2',   // red-50
        'brand-purple': '#8b5cf6',      // violet-500
        'brand-purple-light': '#ede9fe', // violet-50
        'brand-yellow': '#f59e0b',      // amber-500
        'brand-yellow-light': '#fef3c7', // amber-50
        'brand-amber': '#f59e0b',       // amber-500
        'brand-amber-light': '#fef3c7', // amber-50
        'brand-emerald': '#10b981',     // emerald-500
        'brand-emerald-light': '#d1fae5', // emerald-50
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
