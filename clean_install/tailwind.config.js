/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#137fec",
                "background-light": "#f6f7f8",
                "background-dark": "#101922",
                'santillana-blue': {
                    50: '#f1f5f9',
                    100: '#e2e8f0',
                    200: '#cbd5e1',
                    300: '#94a3b8',
                    400: '#64748b',
                    500: '#475569',
                    600: '#254b8d',
                    700: '#1e3a8a',
                    800: '#1e3a8a',
                    900: '#0f172a',
                },
                'santillana-green': {
                    50: '#f7fee7',
                    100: '#ecfccb',
                    200: '#d9f99d',
                    300: '#bef264',
                    400: '#a3e635',
                    500: '#84cc16',
                    600: '#70a040',
                    700: '#4d7c0f',
                    800: '#3f6212',
                    900: '#365314',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
