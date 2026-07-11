import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const dataPath = new URL('../src/data/movieCatalog.js', import.meta.url);
const publicDir = new URL('../public/movies/', import.meta.url);

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {}
}

function extFromContentType(ct) {
  if (!ct) return '.jpg';
  if (ct.includes('png')) return '.png';
  if (ct.includes('webp')) return '.webp';
  if (ct.includes('svg')) return '.svg';
  return '.jpg';
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
}

const mod = await import(dataPath.href);
const movies = Array.isArray(mod.default) ? mod.default : [];

await ensureDir(publicDir);

const updated = [];

for (const m of movies) {
  const copy = { ...m };
  for (const key of ['poster', 'backdrop']) {
    const val = copy[key];
    if (!val) continue;
    if (typeof val === 'string' && /^https?:\/\//.test(val)) {
      try {
        const res = await fetch(val, { method: 'HEAD' });
        const ct = res.headers.get('content-type') || '';
        const ext = extFromContentType(ct);
        const filename = `${m._id}-${key}${ext}`;
        const destFileUrl = new URL(filename, publicDir);
        const destPath = fileURLToPath(destFileUrl);
        console.log('Downloading', val, '→', destPath);
        await download(val, destPath);
        copy[key] = `/movies/${filename}`;
      } catch (e) {
        console.error('Failed to download', val, e.message);
      }
    }
  }
  updated.push(copy);
}

// Write updated JS file (export default ...)
const out = `const movieCatalog = ${JSON.stringify(updated, null, 2)};\n\nexport default movieCatalog;\n`;
await fs.writeFile(new URL('../src/data/movieCatalog.js', import.meta.url), out, 'utf8');
console.log('Updated client/src/data/movieCatalog.js with local poster/backdrop paths.');
