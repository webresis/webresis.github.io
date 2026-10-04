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

    // El path relativo dentro de src/
    const relativePath = `src/content/resistencia/${section.slug}/index.mdx`;

    const githubToken = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO || process.env.VITE_GITHUB_REPO;

    if (githubToken && githubRepo) {
      // 1. Integración con GitHub (Ideal para producción en Vercel)
      try {
        // Primero, obtener el SHA del archivo si existe (para actualizar)
        const getUrl = `https://api.github.com/repos/${githubRepo}/contents/${relativePath}`;
        const getRes = await fetch(getUrl, {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        let sha = undefined;
        if (getRes.ok) {
          const fileData = await getRes.json();
          sha = fileData.sha;
        }

        // Hacer el commit
        const commitRes = await fetch(getUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Actualizado: ${section.title} desde el Editor Admin`,
            content: Buffer.from(contentMarkdown).toString('base64'),
            sha: sha
          })
        });

        if (!commitRes.ok) {
          const errData = await commitRes.json();
          console.error("Error en GitHub API:", errData);
          throw new Error('No se pudo guardar en GitHub.');
        }

      } catch (githubErr) {
        console.error("Fallo la subida a Github:", githubErr);
        // Si falla Github, podríamos retornar error, o intentar guardar local de todas formas
      }
    } 

    // 2. Guardar en el disco duro local (Siempre lo hacemos como respaldo, y principal si no hay Github Token)
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
