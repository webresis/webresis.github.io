/**
 * Course structure metadata.
 *
 * This file is the **single source of truth** for the sidebar navigation
 * and the mapping between chapter/section identifiers and their MDX content
 * slugs under `src/content/resistencia/`.
 *
 * When a contributor adds a new topic they should:
 *   1. Create the `.mdx` file under `src/content/resistencia/<chapter>/<section>/index.mdx`
 *   2. Add (or update) the corresponding entry here so the sidebar picks it up.
 */

export interface Section {
  /** Short numeric or alphanumeric id, e.g. "2.1" */
  id: string
  /** Human-readable title shown in the sidebar */
  title: string
  /**
   * Slug path relative to `src/content/resistencia/`.
   * Example: "02-esfuerzo-deformacion/esfuerzo-normal"
   * When `null` the section is listed but marked as "coming soon".
   */
  slug: string | null
}

export interface Chapter {
  /** Two-digit chapter number, e.g. "01" */
  number: string
  /** Chapter title */
  title: string
  /** Ordered list of sections inside this chapter */
  sections: Section[]
}

export const chapters: Chapter[] = [
  {
    number: '01',
    title: 'Esfuerzos, falla y factor de seguridad',
    sections: [
      { id: '1.1', title: 'Esfuerzos Principales', slug: '01-esfuerzos-falla/esfuerzos-principales' },],
  },
  {
    number: '02',
    title: 'Deformaciones y ley de Hooke',
    sections: [
      { id: '2.1', title: 'Conceptos principales', slug: '02-deformaciones-ley-hooke/conceptos-principales' },],
  },
  {
    number: '03',
    title: 'Cambio de temperatura y problemas hiperestáticos',
    sections: [
      { id: '3.1', title: 'Conceptos principales', slug: '03-cambio-temperatura-hiperestaticos/conceptos-principales' },
    ],
  },
  {
    number: '04',
    title: 'Transformación de esfuerzos y deformaciones',
    sections: [
      { id: '4.1', title: 'Conceptos principales', slug: '04-transformacion-esfuerzos/conceptos-principales' },
    ],
  },
  {
    number: '05',
    title: 'Recipientes delgados sujetos a presión',
    sections: [
      { id: '5.1', title: 'Conceptos principales', slug: '05-recipientes-presion/conceptos-principales' },
    ],
  },
  {
    number: '06',
    title: 'Torsión en ejes circulares',
    sections: [
      { id: '6.1', title: 'Conceptos principales', slug: '06-torsion/conceptos-principales' },
    ],
  },
  {
    number: '07',
    title: 'Flexión y cortante en vigas',
    sections: [
      { id: '7.1', title: 'Conceptos principales', slug: '07-flexion-cortante/conceptos-principales' },
    ],
  },
  {
    number: '08',
    title: 'Flexión asimétrica',
    sections: [
      { id: '8.1', title: 'Conceptos principales', slug: '08-flexion-asimetrica/conceptos-principales' },
    ],
  },
  {
    number: '09',
    title: 'Deflexión por integración directa en vigas',
    sections: [
      { id: '9.1', title: 'Conceptos principales', slug: '09-deflexion-integracion/conceptos-principales' },
    ],
  },
  {
    number: '10',
    title: 'Funciones de discontinuidad y área momento',
    sections: [
      { id: '10.1', title: 'Conceptos principales', slug: '10-funciones-discontinuidad/conceptos-principales' },
    ],
  },
  {
    number: '11',
    title: 'Vigas hiperestáticas',
    sections: [
      { id: '11.1', title: 'Conceptos principales', slug: '11-vigas-hiperestaticas/conceptos-principales' },
    ],
  },
  {
    number: '12',
    title: 'Columnas',
    sections: [
      { id: '12.1', title: 'Conceptos principales', slug: '12-columnas/conceptos-principales' },
    ],
  },
  {
    number: '13',
    title: 'Fórmula de la secante y diseño de columnas',
    sections: [
      { id: '13.1', title: 'Conceptos principales', slug: '13-formula-secante/conceptos-principales' },
    ],
  },
]

/** Flat list of all sections, in sidebar order. */
export const allSections = chapters.flatMap((ch) =>
  ch.sections.map((sec) => ({ ...sec, chapterNumber: ch.number, chapterTitle: ch.title }))
)

/**
 * Given a slug like "02-esfuerzo-deformacion/esfuerzo-normal",
 * find the section metadata and its neighbours for prev/next navigation.
 */
export function findSectionBySlug(slug: string) {
  const index = allSections.findIndex((s) => s.slug === slug)
  if (index === -1) return null
  return {
    section: allSections[index],
    previous: index > 0 ? allSections[index - 1] : null,
    next: index < allSections.length - 1 ? allSections[index + 1] : null,
  }
}
