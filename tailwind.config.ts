import type { Config } from 'tailwindcss'

export default {
  darkMode: ['selector'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        "primary": "var(--primary-color)",
        "secondary": "var(--secondary-color)",
        "background": "var(--background-color)",
        "text": "var(--text-color)",

        "accent": "var(--accent-color)",
        "accent-hover": "var(--accent-hover-color)"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        top: "0px -7px 15px -10px var(--tw-shadow-color)",
        right: "12px 0px 10px -10px var(--tw-shadow-color)",
      },
      fontVariationSettings: {  
        'prevent-shift': '"GRAD" 0',  
      },
    },
  },
	plugins: [
		require('tailwindcss-animate'),
	],
} satisfies Config
