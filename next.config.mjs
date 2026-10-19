import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- GitHub Pages static export (opt-in via env) ---------------------------
// `yarn dev` and a plain `yarn build` are unaffected. The Pages deploy workflow
// sets BUILD_STATIC_EXPORT=true to emit a static site to ./out, and
// PAGES_BASE_PATH=/<repo> so asset/link URLs work under a project page
// (https://<owner>.github.io/<repo>/). Leave PAGES_BASE_PATH empty for a
// user/org root page.
const isStaticExport = process.env.BUILD_STATIC_EXPORT === 'true';
const basePath = process.env.PAGES_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  ...(isStaticExport && {
    output: 'export',
    basePath: basePath || undefined,
    assetPrefix: basePath || undefined,
    images: { unoptimized: true },
  }),
  transpilePackages: [
    '@netskope-ui/core',
    '@netskope-ui/charts',
    '@netskope-ui/combo-box',
    '@netskope-ui/dates-v2',
    '@netskope-ui/dropdown',
    '@netskope-ui/file-uploader',
    '@netskope-ui/filter',
    '@netskope-ui/hooks',
    '@netskope-ui/icons',
    '@netskope-ui/pagination',
    '@netskope-ui/select',
    '@netskope-ui/side-panel-v2',
    '@netskope-ui/table-v2',
    '@netskope-ui/tabs',
    '@netskope-ui/tailwind',
    '@netskope-ui/toast-factory',
    '@netskope-ui/top-bar',
    '@netskope-ui/utils',
  ],
};

export default nextConfig;
