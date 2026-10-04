// Patch @astrojs/vercel@7.8.2 to support Node 22+
// The adapter's SUPPORTED_NODE_VERSIONS map only knows about 18 and 20,
// which are both now discontinued on Vercel. This adds 22 as 'default'.
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const adapterPath = resolve(__dirname, '..', 'node_modules', '@astrojs', 'vercel', 'dist', 'serverless', 'adapter.js');

try {
  let code = readFileSync(adapterPath, 'utf-8');

  const oldVersions = `const SUPPORTED_NODE_VERSIONS = {
    18: { status: 'retiring', removal: 'Early 2025', warnDate: new Date('October 1 2024') },
    20: { status: 'default' },
};`;

  const newVersions = `const SUPPORTED_NODE_VERSIONS = {
    18: { status: 'retiring', removal: 'Early 2025', warnDate: new Date('October 1 2024') },
    20: { status: 'default' },
    22: { status: 'default' },
};`;

  if (code.includes('22: {')) {
    console.log('[postinstall] @astrojs/vercel already patched for Node 22');
  } else if (code.includes(oldVersions)) {
    code = code.replace(oldVersions, newVersions);
    writeFileSync(adapterPath, code, 'utf-8');
    console.log('[postinstall] ✅ Patched @astrojs/vercel to support Node 22');
  } else {
    console.warn('[postinstall] ⚠️  Could not find SUPPORTED_NODE_VERSIONS to patch');
  }
} catch (err) {
  console.warn('[postinstall] ⚠️  Could not patch @astrojs/vercel:', err.message);
}
