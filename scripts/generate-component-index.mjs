#!/usr/bin/env node
/**
 * generate-component-index.mjs
 *
 * Builds .ai-context/generated/index.json — a deterministic, machine-derived map
 * of every @netskope-ui/* component to the *authoritative artifacts* that
 * describe it. It does NOT summarize the library (that's what drifted and gave
 * us the wrong filter/tabs docs). It only records WHERE to look, so the agent
 * (and the /find-usage skill) can read the real source on demand.
 *
 * For each installed @netskope-ui package it records:
 *   - exports        — runtime export names parsed from dist/es/index.js
 *   - dts            — path to dist/index.d.ts (authoritative prop types) if present
 *   - registry       — path to dist/registry.json if present
 *   - renderDir      — dist/es (compiled render fns: the truth for behavior)
 *   - stories        — vendored Storybook stories (truth for composition)
 *   - codeConnect    — vendored *.figma.tsx (Figma → component-name mapping)
 *
 * Plus a flat `componentIndex` (export name → package) so "which package is X in?"
 * is a one-line lookup.
 *
 * Run via `yarn refresh-ds` (after install) or directly: node scripts/generate-component-index.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NM = join(ROOT, 'node_modules', '@netskope-ui');
const OUT_DIR = join(ROOT, '.ai-context', 'generated');
const OUT = join(OUT_DIR, 'index.json');

const rel = (p) => relative(ROOT, p);

/** Recursively list files under dir matching a predicate. */
function walk(dir, match, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, match, acc);
    else if (match(name)) acc.push(full);
  }
  return acc;
}

/**
 * Parse runtime export names from an ES module index. Handles:
 *   export { A, B as C } from '...'   →  A, C
 *   export { default as D } from '...' →  D
 *   export const E = ...               →  E
 *   export function F() {}             →  F
 */
function parseExports(jsPath) {
  if (!existsSync(jsPath)) return [];
  const src = readFileSync(jsPath, 'utf8');
  const names = new Set();
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const token = part.trim();
      if (!token) continue;
      const asMatch = token.match(/\bas\s+([A-Za-z0-9_$]+)$/);
      const name = asMatch ? asMatch[1] : token;
      if (name && name !== 'default') names.add(name);
    }
  }
  for (const m of src.matchAll(/export\s+(?:const|function|class|let|var)\s+([A-Za-z0-9_$]+)/g)) {
    names.add(m[1]);
  }
  return [...names].sort();
}

function vendoredFor(shortName, subdir) {
  const base = join(ROOT, '.ai-context', subdir, shortName);
  return walk(base, () => true).map(rel).sort();
}

if (!existsSync(NM)) {
  console.error(`✗ ${rel(NM)} not found — run install-ds.sh first.`);
  process.exit(1);
}

const pinnedSha = existsSync(join(ROOT, 'PINNED_SHA'))
  ? readFileSync(join(ROOT, 'PINNED_SHA'), 'utf8').trim()
  : null;

const packages = {};
const componentIndex = {};

for (const shortName of readdirSync(NM).sort()) {
  const pkgDir = join(NM, shortName);
  if (!statSync(pkgDir).isDirectory()) continue;
  const dist = join(pkgDir, 'dist');
  const esIndex = join(dist, 'es', 'index.js');
  const cjsIndex = join(dist, 'cjs', 'index.js');
  const exports = parseExports(existsSync(esIndex) ? esIndex : cjsIndex);
  const dts = join(dist, 'index.d.ts');
  const registry = join(dist, 'registry.json');
  const renderDir = join(dist, 'es');

  const entry = {
    package: `@netskope-ui/${shortName}`,
    exports,
    dts: existsSync(dts) ? rel(dts) : null,
    registry: existsSync(registry) ? rel(registry) : null,
    renderDir: existsSync(renderDir) ? rel(renderDir) : null,
    stories: vendoredFor(shortName, 'stories'),
    codeConnect: vendoredFor(shortName, 'code-connect'),
  };
  packages[`@netskope-ui/${shortName}`] = entry;
  for (const name of exports) {
    // First package to export a name wins; collisions are rare and logged.
    if (componentIndex[name] && componentIndex[name] !== entry.package) {
      componentIndex[name] = [].concat(componentIndex[name], entry.package);
    } else {
      componentIndex[name] = entry.package;
    }
  }
}

const out = {
  generatedAt: new Date().toISOString(),
  pinnedSha,
  note: 'Machine-derived map of @netskope-ui/* artifacts. Do NOT hand-edit. Regenerate via `yarn refresh-ds` or `node scripts/generate-component-index.mjs`. For a component, read its dts (props) + stories (composition) + codeConnect; the registry/llms summaries can be stale.',
  packageCount: Object.keys(packages).length,
  packages,
  componentIndex,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

const withDts = Object.values(packages).filter((p) => p.dts).length;
const withStories = Object.values(packages).filter((p) => p.stories.length).length;
console.log(
  `✓ Indexed ${out.packageCount} packages (${Object.keys(componentIndex).length} exports), ` +
    `${withDts} with .d.ts, ${withStories} with stories → ${rel(OUT)}`,
);
