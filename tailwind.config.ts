import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        technical: '#3B82F6',
        fundamental: '#10B981',
        supply: '#8B5CF6',
        sentiment: '#F59E0B',
      },
    },
  },
  plugins: [],
};

export default config;
