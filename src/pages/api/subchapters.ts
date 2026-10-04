import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { chapterNumber, newSection } = data;

    if (!chapterNumber || !newSection || !newSection.id || !newSection.title || !newSection.slug) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), { status: 400 });
    }

    // Ruta absoluta a chapters.json
    const filePath = path.join(process.cwd(), 'lib', 'chapters.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const chapters = JSON.parse(fileContent);

    // Buscar el capítulo y agregar la nueva sección
    const chapterIndex = chapters.findIndex((c: any) => c.number === chapterNumber);
    if (chapterIndex === -1) {
      return new Response(JSON.stringify({ error: 'Capítulo no encontrado' }), { status: 404 });
    }

    if (chapters[chapterIndex].sections.find((s: any) => s.id === newSection.id)) {
      return new Response(JSON.stringify({ error: 'El ID del subtema ya existe' }), { status: 400 });
    }

    chapters[chapterIndex].sections.push(newSection);

    // Guardar los cambios
    await fs.writeFile(filePath, JSON.stringify(chapters, null, 2), 'utf-8');

    return new Response(JSON.stringify({ success: true, chapters }), { status: 200 });
  } catch (error: any) {
    console.error('Error al agregar subtema:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { chapterNumber, sections } = data;

    if (!chapterNumber || !Array.isArray(sections)) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'lib', 'chapters.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const chapters = JSON.parse(fileContent);

    const chapterIndex = chapters.findIndex((c: any) => c.number === chapterNumber);
    if (chapterIndex === -1) {
      return new Response(JSON.stringify({ error: 'Capítulo no encontrado' }), { status: 404 });
    }

    // Actualizar secciones
    chapters[chapterIndex].sections = sections;

    await fs.writeFile(filePath, JSON.stringify(chapters, null, 2), 'utf-8');

    return new Response(JSON.stringify({ success: true, chapters }), { status: 200 });
  } catch (error: any) {
    console.error('Error al reordenar subtemas:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
