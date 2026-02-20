/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#135bec',
                    light: '#3b82f6',
                    dark: '#0c4ad1'
                },
                'background-light': '#f6f6f8',
                'background-dark': '#101622',
                'card-dark': '#1a2234',
                army: '#6b7f3e',
                navy: '#002395',
                airforce: '#87CEEB',
                // Legacy colors for compatibility
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                    light: '#9ca3af',
                    dark: '#4b5563'
                },
                accent: {
                    DEFAULT: 'var(--color-accent)',
                    light: '#84cc16',
                    dark: '#6b7c54'
                },
                bg: 'var(--color-bg)',
                surface: 'var(--color-surface)',
                text: 'var(--color-text)'
            },
            fontFamily: {
                display: ['"Public Sans"', 'sans-serif'],
                sans: ['"Public Sans"', 'system-ui', 'sans-serif']
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                lg: '0.5rem',
                xl: '0.75rem',
                '2xl': '1rem'
            }
        },
    },
    plugins: [],
}
