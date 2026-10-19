import type { Config } from 'tailwindcss';
const { Preset } = require('@netskope-ui/tailwind');

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './netskope-context/**/*.{ts,tsx}',
    './node_modules/@netskope-ui/**/*.{js,jsx}',
  ],
  presets: [Preset],
};

export default config;
