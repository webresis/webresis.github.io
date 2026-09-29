import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { findSectionBySlug, allSections } from '@/lib/course-data'
import ContentPage from './content-page'

/**
 * Generate static paths for all sections that have content (slug !== null).
 * This allows Next.js to pre-render every known course page at build time.
 */
export function generateStaticParams() {
  return allSections
    .filter((s) => s.slug !== null)
    .map((s) => ({
      slug: s.slug!.split('/'),
    }))
}

/** Dynamic metadata for SEO. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug: slugParts } = await params
  const slug = slugParts.join('/')
  const result = findSectionBySlug(slug)
  if (!result) return { title: 'No encontrado' }

  return {
    title: `${result.section.title} | Resistencia de Materiales — UNI`,
    description: `Capítulo ${result.section.chapterNumber}: ${result.section.chapterTitle} — ${result.section.title}`,
  }
}

/**
 * Dynamic catch-all route: /curso/[...slug]
 *
 * Attempts to load the MDX page from the content directory.
 * Falls back to a "coming soon" placeholder when the MDX file doesn't exist yet.
 */
export default async function CursoPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug: slugParts } = await params
  const slug = slugParts.join('/')
  const sectionData = findSectionBySlug(slug)

  if (!sectionData) {
    notFound()
  }

  const { section, previous, next } = sectionData

  // Try to dynamically import the MDX file.
  // The content lives under src/content/resistencia/<slug>/index.mdx
  // or src/content/resistencia/<slug>.mdx
  let MdxContent: React.ComponentType | null = null
  let headings: { id: string; text: string; level: number }[] = []

  try {
    // Attempt directory-style import first: <slug>/index.mdx
    const mod = await import(`@/src/content/resistencia/${slug}/index.mdx`)
    MdxContent = mod.default
    headings = mod.headings ?? []
  } catch {
    try {
      // Attempt flat-file import: <slug>.mdx
      const mod = await import(`@/src/content/resistencia/${slug}.mdx`)
      MdxContent = mod.default
      headings = mod.headings ?? []
    } catch {
      // MDX file doesn't exist yet — render placeholder
      MdxContent = null
    }
  }

  return (
    <ContentPage
      slug={slug}
      section={section}
      previous={previous}
      next={next}
      headings={headings}
      hasContent={MdxContent !== null}
    >
      {MdxContent && <MdxContent />}
    </ContentPage>
  )
}
