import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const chapterNumber = url.searchParams.get('chapter');
    const docSlug = url.searchParams.get('slug');

    if (!chapterNumber || !docSlug) {
      return new Response(JSON.stringify({ error: 'Faltan parámetros' }), { status: 400 });
    }

    const chaptersPath = path.join(process.cwd(), 'lib', 'chapters.json');
    const chaptersContent = await fs.readFile(chaptersPath, 'utf-8');
    const chapters = JSON.parse(chaptersContent);

    const chData = chapters.find((c: any) => c.number === chapterNumber);
    if (!chData) {
      return new Response(JSON.stringify({ error: 'Capítulo no encontrado' }), { status: 404 });
    }

    const section = chData.sections.find((s: any) => {
      const sSlug = s.slug ? s.slug.split('/')[1] : s.id;
      return sSlug === docSlug;
    });

    if (!section || !section.slug) {
      return new Response(JSON.stringify({ error: 'Subtema no encontrado' }), { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'src', 'content', 'resistencia', section.slug, 'index.mdx');

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return new Response(JSON.stringify({ content: fileContent }), { status: 200 });
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        return new Response(JSON.stringify({ error: 'Archivo MDX no existe' }), { status: 404 });
      }
      throw e;
    }
  } catch (error: any) {
    console.error('Error leyendo archivo MDX:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
