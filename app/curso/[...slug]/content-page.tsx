'use client'

import TextbookLayout from '@/components/textbook-layout'
import { ContentProvider } from '@/lib/content-context'
import { BookOpen, Compass } from 'lucide-react'

interface ContentPageProps {
  slug: string
  section: {
    id: string
    title: string
    chapterNumber: string
    chapterTitle: string
    slug: string | null
  }
  previous: { slug: string | null; title: string } | null
  next: { slug: string | null; title: string } | null
  headings: { id: string; text: string; level: number }[]
  hasContent: boolean
  children: React.ReactNode
}

export default function ContentPage({
  slug,
  section,
  previous,
  next,
  headings,
  hasContent,
  children,
}: ContentPageProps) {
  const prevNav = previous?.slug ? { slug: previous.slug, title: previous.title } : null
  const nextNav = next?.slug ? { slug: next.slug, title: next.title } : null

  return (
    <TextbookLayout
      activeSlug={slug}
      chapterNumber={section.chapterNumber}
      chapterTitle={section.chapterTitle}
      headings={hasContent ? headings : undefined}
      previous={prevNav}
      next={nextNav}
    >
      {hasContent ? (
        /* MDX content is rendered here, wrapped in ContentProvider for image resolution */
        <ContentProvider slug={slug}>{children}</ContentProvider>
      ) : (
        /* Placeholder for sections that don't have MDX content yet */
        <div className="py-8">
          <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#7f0303]">
            <BookOpen className="size-4" /> Capítulo en preparación
          </div>
          <div className="rounded-2xl border border-[#dec4c1] bg-[#fffaf7] p-8 shadow-[0_12px_35px_rgba(127,3,3,0.06)] sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a45b5b]">Próximamente</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.03em] text-[#4a1112]">{section.title}</h1>
            <p className="mt-5 max-w-xl text-[16px] leading-8 text-[#624b4b]">
              Este tema todavía no está disponible. Estamos preparando el contenido, los ejemplos y los problemas para incorporarlos al material de la UNI.
            </p>
            <div className="mt-8 rounded-xl border border-dashed border-[#dec4c1] bg-[#fffaf7] p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f0dada] text-[#7f0303]">
                  <Compass className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#967070]">¿Quieres contribuir?</p>
                  <h3 className="mt-1 font-serif text-lg font-semibold text-[#4b1719]">Escribe este contenido</h3>
                  <p className="mt-2 text-sm leading-6 text-[#765e5e]">
                    Crea el archivo <code className="rounded border border-[#ead8d8] bg-[#faf0ef] px-1.5 py-0.5 font-mono text-[13px] text-[#6a2022]">src/content/resistencia/{slug}/index.mdx</code> y añade tu contenido usando los componentes disponibles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </TextbookLayout>
  )
}
