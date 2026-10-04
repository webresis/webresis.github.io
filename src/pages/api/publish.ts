import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { chapterId, slug, contentMarkdown } = data;

    if (!chapterId || !slug || !contentMarkdown) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), { status: 400 });
    }

    // Leer chapters.json para encontrar la ruta real del subtema
    const chaptersPath = path.join(process.cwd(), 'lib', 'chapters.json');
    const chaptersContent = await fs.readFile(chaptersPath, 'utf-8');
    const chapters = JSON.parse(chaptersContent);

    const chData = chapters.find((c: any) => c.number === chapterId);
    if (!chData) {
      return new Response(JSON.stringify({ error: 'Capítulo no encontrado' }), { status: 404 });
    }

    const section = chData.sections.find((s: any) => {
      const sSlug = s.slug ? s.slug.split('/')[1] : s.id;
      return sSlug === slug;
    });

    if (!section || !section.slug) {
      return new Response(JSON.stringify({ error: 'Subtema no encontrado' }), { status: 404 });
    }

    // Ruta de la carpeta del subtema
    const sectionDir = path.join(process.cwd(), 'src', 'content', 'resistencia', section.slug);
    const filePath = path.join(sectionDir, 'index.mdx');

    // Asegurar que el directorio exista
    await fs.mkdir(sectionDir, { recursive: true });

    // Escribir el archivo
    await fs.writeFile(filePath, contentMarkdown, 'utf-8');

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error('Error publicando MDX:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
