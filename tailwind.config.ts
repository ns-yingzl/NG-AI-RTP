import type { Config } from 'tailwindcss';
import * as netskopeTailwind from '@netskope-ui/tailwind';

// ESM import (not require) so the config also loads when Node's native TS loader picks it up.
const Preset = netskopeTailwind.Preset ?? (netskopeTailwind as unknown as { default: typeof netskopeTailwind }).default.Preset;

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './netskope-context/**/*.{ts,tsx}',
    './node_modules/@netskope-ui/**/*.{js,jsx}',
  ],
  presets: [Preset],
};

export default config;
