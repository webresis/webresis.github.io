import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import pc from 'picocolors';

const COURSE_DATA_PATH = path.join(process.cwd(), 'lib', 'course-data.ts');
const CONTENT_PATH = path.join(process.cwd(), 'src', 'content', 'resistencia');

// Utility to read course-data
function readCourseData() {
  return fs.readFileSync(COURSE_DATA_PATH, 'utf-8');
}

// Utility to write course-data
function writeCourseData(content) {
  fs.writeFileSync(COURSE_DATA_PATH, content, 'utf-8');
}

// Parse chapters from course-data
function getChapters() {
  const content = readCourseData();
  const chapterRegex = /number:\s*'(\d+)',\s*title:\s*'([^']+)',\s*sections:\s*\[([\s\S]*?)\]/g;
  const chapters = [];

  let match;
  while ((match = chapterRegex.exec(content)) !== null) {
    const number = match[1];
    const title = match[2];
    const sectionsBlock = match[3];

    const sectionRegex = /id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*slug:\s*'([^']+)'/g;
    const sections = [];
    let secMatch;
    while ((secMatch = sectionRegex.exec(sectionsBlock)) !== null) {
      sections.push({
        id: secMatch[1],
        title: secMatch[2],
        slug: secMatch[3]
      });
    }

    chapters.push({ number, title, sections });
  }
  return chapters;
}

function toSlug(str) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(de|del|el|la|los|las|un|una|unos|unas|y|o|en|por|para|con)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function createSection() {
  const chapters = getChapters();

  const { chapterNum } = await prompts({
    type: 'select',
    name: 'chapterNum',
    message: '¿En qué capítulo quieres agregar el tema?',
    choices: chapters.map(c => ({ title: `${c.number}. ${c.title}`, value: c.number }))
  });
  if (!chapterNum) return;

  const chapter = chapters.find(c => c.number === chapterNum);
  const nextId = `${Number(chapter.number)}.${chapter.sections.length + 1}`;

  const { title } = await prompts({
    type: 'text',
    name: 'title',
    message: `Título del nuevo tema (Ej: Ley de Hooke):`,
    validate: value => value.length > 0 || 'El título no puede estar vacío'
  });
  if (!title) return;

  // Folder name for the chapter (find it from existing sections, or guess it)
  let chapterFolder = '';
  if (chapter.sections.length > 0) {
    chapterFolder = chapter.sections[0].slug.split('/')[0];
  } else {
    chapterFolder = `${chapter.number}-${toSlug(chapter.title)}`;
  }

  const sectionFolder = toSlug(title);
  const slug = `${chapterFolder}/${sectionFolder}`;

  if (chapter.sections.some(s => s.slug === slug || s.title.toLowerCase() === title.toLowerCase())) {
    console.log(pc.red(`\n❌ Ya existe un tema con ese título o en esa misma carpeta. Por favor elige un nombre diferente o edita el existente.`));
    return;
  }

  const newSectionLine = `\n      { id: '${nextId}', title: '${title}', slug: '${slug}' },`;

  let content = readCourseData();

  // Find the exact chapter block and append to its sections
  const regex = new RegExp(`(number:\\s*'${chapterNum}',[\\s\\S]*?sections:\\s*\\[)([\\s\\S]*?)(\\]\\s*,?\\s*})`);
  content = content.replace(regex, (match, p1, p2, p3) => {
    return p1 + p2 + newSectionLine + p3;
  });

  writeCourseData(content);

  // Create folder and file
  const fullDirPath = path.join(CONTENT_PATH, slug);
  if (!fs.existsSync(fullDirPath)) {
    fs.mkdirSync(fullDirPath, { recursive: true });
  }

  const filePath = path.join(fullDirPath, 'index.mdx');
  if (!fs.existsSync(filePath)) {
    const mdxTemplate = `# ${title}

Aquí puedes escribir la introducción al tema. Explica brevemente de qué se trata y por qué es importante.

## 1. Conceptos Fundamentales

<Definition title="Concepto Principal">
Escribe aquí la definición clara de este concepto.
</Definition>

## 2. Ejemplos Prácticos

<Example number={1} title="Problema de aplicación">
Escribe aquí el enunciado del problema.

<Solution>
1. Escribe el primer paso de tu solución.
2. Agrega las ecuaciones necesarias.
</Solution>
</Example>
`;
    fs.writeFileSync(filePath, mdxTemplate, 'utf-8');
    console.log(pc.green(`\n✔ Tema creado en: src/content/resistencia/${slug}/index.mdx`));
  } else {
    console.log(pc.yellow(`\n⚠️ La carpeta ya existía y contenía un index.mdx. Se registró el tema pero no se sobrescribió el archivo.`));
  }
}

async function editSection() {
  const chapters = getChapters();
  const allSections = chapters.flatMap(c => c.sections.map(s => ({ ...s, chapter: c.number })));

  const { selectedSlug } = await prompts({
    type: 'select',
    name: 'selectedSlug',
    message: 'Selecciona el tema a editar:',
    choices: allSections.map(s => ({ title: `${s.id} - ${s.title}`, value: s.slug }))
  });
  if (!selectedSlug) return;

  const section = allSections.find(s => s.slug === selectedSlug);

  const { newTitle } = await prompts({
    type: 'text',
    name: 'newTitle',
    message: `Nuevo título para "${section.title}":`,
    initial: section.title
  });
  if (!newTitle || newTitle === section.title) return;

  const oldSlug = section.slug;
  const chapterFolder = oldSlug.split('/')[0];
  const newSectionFolder = toSlug(newTitle);
  const newSlug = `${chapterFolder}/${newSectionFolder}`;

  let content = readCourseData();
  const regex = new RegExp(`id:\\s*'${section.id}',\\s*title:\\s*'[^']+',\\s*slug:\\s*'${oldSlug}'`);
  content = content.replace(regex, `id: '${section.id}', title: '${newTitle}', slug: '${newSlug}'`);
  writeCourseData(content);

  // Renombrar la carpeta en el sistema de archivos si el slug cambió
  if (oldSlug !== newSlug) {
    const oldDirPath = path.join(CONTENT_PATH, oldSlug);
    const newDirPath = path.join(CONTENT_PATH, newSlug);
    if (fs.existsSync(oldDirPath)) {
      fs.renameSync(oldDirPath, newDirPath);
    }
  }

  console.log(pc.green(`\n✔ Título actualizado y carpeta renombrada a "${newSectionFolder}".`));
}

async function deleteSection() {
  const chapters = getChapters();
  const allSections = chapters.flatMap(c => c.sections.map(s => ({ ...s, chapter: c.number })));

  const { selectedSlug } = await prompts({
    type: 'select',
    name: 'selectedSlug',
    message: 'Selecciona el tema que quieres ELIMINAR:',
    choices: allSections.map(s => ({ title: `${s.id} - ${s.title}`, value: s.slug }))
  });
  if (!selectedSlug) return;

  const section = allSections.find(s => s.slug === selectedSlug);

  const { confirm } = await prompts({
    type: 'select',
    name: 'confirm',
    message: pc.red(`¿Estás seguro de eliminar "${section.title}" y todos sus archivos? Esta acción no se puede deshacer.`),
    choices: [
      { title: '❌ Cancelar (No borrar nada)', value: false },
      { title: '⚠️  Sí, eliminar permanentemente', value: true }
    ]
  });

  if (confirm) {
    let content = readCourseData();
    // Remove the line safely
    const lineRegex = new RegExp(`\\s*\\{\\s*id:\\s*'${section.id}'[^\}]+slug:\\s*'${section.slug}'\\s*\\},?`);
    content = content.replace(lineRegex, '');
    writeCourseData(content);

    // Delete folder
    const fullDirPath = path.join(CONTENT_PATH, section.slug);
    if (fs.existsSync(fullDirPath)) {
      fs.rmSync(fullDirPath, { recursive: true, force: true });
    }
    console.log(pc.green(`\n✔ Tema eliminado correctamente.`));
  }
}

async function main() {
  console.clear();
  console.log(pc.cyan(pc.bold('========================================================')));
  console.log(pc.cyan(pc.bold('📖 Gestor de Contenidos - Resistencia de materiales UNI')));
  console.log(pc.cyan(pc.bold('========================================================\n')));

  while (true) {
    const { action } = await prompts({
      type: 'select',
      name: 'action',
      message: '¿Qué deseas hacer?',
      choices: [
        { title: '✨ Crear nuevo tema', value: 'create' },
        { title: '✏️  Editar título de un tema', value: 'edit' },
        { title: '🗑️  Eliminar un tema', value: 'delete' },
        { title: '🚪 Salir', value: 'exit' }
      ]
    });

    if (!action || action === 'exit') {
      console.log(pc.gray('¡Hasta pronto!'));
      break;
    }

    if (action === 'create') await createSection();
    if (action === 'edit') await editSection();
    if (action === 'delete') await deleteSection();

    console.log('\n----------------------------------------\n');
  }
}

main().catch(err => {
  console.error(pc.red('Error:'), err);
});
