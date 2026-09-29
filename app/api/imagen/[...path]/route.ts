import { NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import fs from 'node:fs/promises'

/**
 * Serves images co-located with MDX content files.
 *
 * Route: /api/imagen/<chapter>/<section>/<filename>
 * Example: /api/imagen/02-esfuerzo-deformacion/esfuerzo-normal/barra-axial.png
 *
 * Source directory: src/content/resistencia/
 */

// Allowlist of image extensions — only these are served
const ALLOWED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.ico',
])

// MIME types for each extension
const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

/** The root content directory (resolved at startup). */
const CONTENT_ROOT = path.resolve(process.cwd(), 'src', 'content', 'resistencia')

export const dynamic = 'force-static'

/**
 * Generate static paths for all images in the content directory.
 * This allows Next.js static export (GitHub Pages) to save them as static files.
 */
export function generateStaticParams() {
  const fsSync = require('fs')
  const contentDir = path.resolve(process.cwd(), 'src', 'content', 'resistencia')
  const paths: { path: string[] }[] = []

  if (!fsSync.existsSync(contentDir)) return []

  function walk(dir: string, base: string) {
    const entries = fsSync.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath, base)
      } else if (ALLOWED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        const rel = path.relative(base, fullPath).replace(/\\/g, '/')
        paths.push({ path: rel.split('/') })
      }
    }
  }

  walk(contentDir, contentDir)

  // Next.js static export fails if a dynamic route returns an empty array.
  // If there are no images yet, provide a dummy path so the build succeeds.
  if (paths.length === 0) {
    paths.push({ path: ['.dummy-image'] })
  }

  return paths
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params

  if (!pathSegments || pathSegments.length === 0) {
    return NextResponse.json({ error: 'Ruta no válida' }, { status: 400 })
  }

  // Sanitize each segment: strip traversal sequences, use only the basename
  const sanitizedSegments = pathSegments.map((segment) =>
    path.basename(segment)
  )

  // Reconstruct the file path within the content directory
  const filePath = path.resolve(CONTENT_ROOT, ...sanitizedSegments)

  // Security: verify the resolved path is inside the content root
  // (trailing separator prevents partial directory name matching)
  if (!filePath.startsWith(CONTENT_ROOT + path.sep)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  // Validate file extension against allowlist
  const ext = path.extname(filePath).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: 'Tipo de archivo no permitido' },
      { status: 403 }
    )
  }

  // Attempt to read the file
  try {
    const stat = await fs.stat(filePath)
    const fileBuffer = await fs.readFile(filePath)
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'

    // ETag based on modification time + size for cache revalidation
    const etag = `"${stat.mtimeMs.toString(36)}-${stat.size.toString(36)}"`

    // If the browser already has this version, return 304
    const ifNoneMatch = _request.headers.get('if-none-match')
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }

    // In dev: always revalidate. In prod: cache 1 hour, then revalidate.
    const isDev = process.env.NODE_ENV === 'development'
    const cacheControl = isDev
      ? 'no-cache'
      : 'public, max-age=3600, must-revalidate'

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'ETag': etag,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Imagen no encontrada' },
      { status: 404 }
    )
  }
}
