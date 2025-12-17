/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dark-core': '#0B0F12',
                'dark-panel': '#1A1F24',
                'neon-cyan': '#00BFFF',
                'solar-amber': '#FFB347',
                'tech-green': '#34E0A1',
                'alert-red': '#FF5E5E',
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'sans-serif'],
                mono: ['Roboto Mono', 'monospace'],
            },
            backgroundImage: {
                'logo-gradient': 'linear-gradient(135deg, #00E5FF 0%, #00BFFF 100%)',
            }
        },
    },
    plugins: [],
}
