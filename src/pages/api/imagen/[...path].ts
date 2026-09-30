import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';

const ALLOWED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.ico',
]);

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const CONTENT_ROOT = path.resolve(process.cwd(), 'src', 'content', 'resistencia');

export function getStaticPaths() {
  const paths: { params: { path: string } }[] = [];

  if (!existsSync(CONTENT_ROOT)) return [];

  function walk(dir: string, base: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, base);
      } else if (ALLOWED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        const rel = path.relative(base, fullPath).replace(/\\/g, '/');
        paths.push({ params: { path: rel } });
      }
    }
  }

  walk(CONTENT_ROOT, CONTENT_ROOT);

  if (paths.length === 0) {
    paths.push({ params: { path: '.dummy-image' } });
  }

  return paths;
}

export async function GET({ params, request }: any) {
  const imagePath = params.path;

  if (!imagePath) {
    return new Response(JSON.stringify({ error: 'Ruta no válida' }), { status: 400 });
  }

  const filePath = path.resolve(CONTENT_ROOT, imagePath);

  if (!filePath.startsWith(CONTENT_ROOT + path.sep)) {
    return new Response(JSON.stringify({ error: 'Acceso denegado' }), { status: 403 });
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return new Response(JSON.stringify({ error: 'Tipo de archivo no permitido' }), { status: 403 });
  }

  try {
    const stat = await fs.stat(filePath);
    const fileBuffer = await fs.readFile(filePath);
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

    const etag = `"${stat.mtimeMs.toString(36)}-${stat.size.toString(36)}"`;
    const ifNoneMatch = request.headers.get('if-none-match');
    
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 });
    }

    const isDev = import.meta.env.DEV;
    const cacheControl = isDev ? 'no-cache' : 'public, max-age=3600, must-revalidate';

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'ETag': etag,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Imagen no encontrada' }), { status: 404 });
  }
}
