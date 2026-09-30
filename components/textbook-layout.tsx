'use client'

import { useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { chapters, type Chapter, type Section } from '@/lib/course-data'
import CourseSearch from '@/components/course-search'

// ─── Logo ──────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <div className="flex size-9 items-center justify-center rounded-lg bg-[#7f0303] text-[#fff8f4] shadow-sm" aria-label="Universidad Nacional de Ingeniería">
      <span className="font-serif text-lg font-semibold tracking-tight">UNI</span>
    </div>
  )
}

// ─── Header ────────────────────────────────────────────────────────────
function Header({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const [dark, setDark] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-[#e3caca] bg-[#fbf7f4]/95 backdrop-blur supports-[backdrop-filter]:bg-[#fbf7f4]/80">
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onMenu} className="inline-flex size-9 items-center justify-center rounded-md text-[#7f0303] hover:bg-[#f2dddd] lg:hidden" aria-label="Abrir navegación">
            <Menu className="size-5" />
          </button>
          <LogoMark />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f0303]">Universidad Nacional de Ingeniería</p>
            <p className="truncate font-serif text-base font-semibold text-[#3a1718]">Resistencia de Materiales</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={onSearch} className="hidden h-9 items-center gap-2 rounded-md border border-[#d5c0c0] bg-white/70 px-3 text-sm text-[#765e5e] shadow-sm hover:border-[#b78383] hover:text-[#7f0303] md:flex" aria-label="Buscar en el curso">
            <Search className="size-4" /><span>Buscar en el curso</span><kbd className="ml-3 rounded border border-[#e3caca] bg-[#f7f5f0] px-1.5 py-0.5 text-[10px] text-[#967070]">⌘ K</kbd>
          </button>
          <button onClick={onSearch} className="inline-flex size-9 items-center justify-center rounded-md text-[#7f0303] hover:bg-[#f2dddd] md:hidden" aria-label="Buscar"><Search className="size-5" /></button>
          <button onClick={() => setDark(!dark)} className="inline-flex size-9 items-center justify-center rounded-md text-[#7f0303] hover:bg-[#f2dddd]" aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}>
            {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </button>
          <div className="ml-1 hidden size-8 items-center justify-center rounded-full bg-[#f0dada] text-xs font-bold text-[#6a2022] sm:flex">MR</div>
        </div>
      </div>
    </header>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────────────
function Sidebar({
  open,
  onClose,
  activeSlug,
}: {
  open: boolean
  onClose: () => void
  activeSlug: string | null
}) {
  const [expanded, setExpanded] = useState(() => {
    // Auto-expand the chapter that contains the active section
    if (!activeSlug) return '02'
    for (const ch of chapters) {
      if (ch.sections.some((s) => s.slug === activeSlug)) return ch.number
    }
    return '02'
  })

  /** Total section count for the subtitle. */
  const totalSections = chapters.reduce((acc, ch) => acc + ch.sections.length, 0)

  return (
    <>
      {open && <button className="fixed inset-0 z-40 bg-[#3a1718]/30 lg:hidden" onClick={onClose} aria-label="Cerrar navegación" />}
      <aside className={cn('fixed inset-y-0 left-0 z-50 flex w-[292px] flex-col border-r border-[#e3caca] bg-[#f8efed] pt-[68px] transition-transform duration-200 lg:sticky lg:top-[68px] lg:z-0 lg:h-[calc(100vh-68px)] lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#967070]">Contenido del curso</p>
            <p className="mt-1 text-sm text-[#6b5150]">{chapters.length} capítulos · {totalSections} secciones</p>
          </div>
          <button onClick={onClose} className="inline-flex size-8 items-center justify-center rounded-md text-[#795e5e] hover:bg-[#f2dddd] lg:hidden" aria-label="Cerrar navegación"><X className="size-4" /></button>
        </div>
        <nav className="scrollbar-none flex-1 overflow-y-auto px-3 pb-8" aria-label="Capítulos del curso">
          {chapters.map((chapter) => {
            const isExpanded = expanded === chapter.number
            return (
              <div key={chapter.number} className="mb-1">
                <button onClick={() => setExpanded(isExpanded ? '' : chapter.number)} className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors duration-75', isExpanded ? 'text-[#4b1719]' : 'text-[#604747] hover:bg-[#f3e0df]')}>
                  <span className="w-5 font-mono text-[10px] font-semibold text-[#a47b7b]">{chapter.number}</span>
                  <span className="flex-1 text-[13px] font-semibold">{chapter.title}</span>
                  {isExpanded ? <ChevronDown className="size-3.5 text-[#967070]" /> : <ChevronRight className="size-3.5 text-[#967070]" />}
                </button>
                {isExpanded && <div className="ml-8 border-l border-[#e5c6c4] pb-1 pl-3">
                  {chapter.sections.map((section) => {
                    const isActive = section.slug === activeSlug
                    const href = section.slug ? `/curso/${section.slug}` : '#'
                    return (
                      <a
                        key={section.id}
                        href={href}
                        onClick={(e) => {
                          if (!section.slug) e.preventDefault()
                          onClose()
                        }}
                        className={cn(
                          'relative block w-full rounded-r-md px-3 py-2 text-left text-xs leading-tight transition-colors duration-75',
                          isActive
                            ? 'bg-[#f2dddd] font-semibold text-[#7f0303] before:absolute before:-left-[13px] before:top-0 before:h-full before:w-0.5 before:bg-[#7f0303]'
                            : section.slug
                              ? 'text-[#765e5e] hover:bg-[#f3e0df] hover:text-[#6a2022]'
                              : 'cursor-default text-[#b8a0a0]'
                        )}
                      >
                        <span className="mr-1.5 text-[10px] text-[#b28a8a]">{section.id}</span>
                        {section.title}
                      </a>
                    )
                  })}
                </div>}
              </div>
            )
          })}
        </nav>
        <div className="border-t border-[#e3caca] p-4">
          <div className="flex items-center gap-3 rounded-lg bg-[#f1dddd] px-3 py-3"><div className="flex size-8 items-center justify-center rounded-md bg-white text-[#8f2929]"><CircleHelp className="size-4" /></div><div><p className="text-xs font-semibold text-[#6a2022]">¿Necesitas ayuda?</p><p className="text-[11px] text-[#795e5e]">Consulta la guía del curso</p></div></div>
        </div>
      </aside>
    </>
  )
}

// ─── Table of Contents (page-level) ────────────────────────────────────
function TableOfContents({ headings }: { headings?: { id: string; text: string; level: number }[] }) {
  // When headings are provided (from MDX frontmatter or extracted), use them.
  // Otherwise show a placeholder that auto-populates once content is available.
  const items = headings ?? []

  if (items.length === 0) return null

  return (
    <aside className="hidden w-[190px] shrink-0 xl:block">
      <div className="sticky top-[108px] border-l border-[#e3caca] pl-5">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#967070]">En esta página</p>
        <nav className="flex flex-col gap-3 text-xs">
          {items.map((h, i) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={cn(
                i === 0 ? 'font-semibold text-[#7f0303]' : 'text-[#765e5e] hover:text-[#7f0303]',
                h.level >= 3 && 'pl-3'
              )}
            >
              {h.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}

// ─── Course layout wrapper ─────────────────────────────────────────────
/**
 * The textbook shell is now a **layout wrapper**.
 *
 * It renders the header, sidebar, and optional table-of-contents,
 * then places `children` (typically the MDX-rendered content) in the
 * main content area.
 *
 * Props:
 * - `activeSlug` — current section slug for sidebar highlighting
 * - `chapterNumber` / `chapterTitle` — breadcrumb metadata
 * - `sectionTitle` — the h1 heading (when coming from the route metadata)
 * - `headings` — optional list of headings for the right-hand ToC
 * - `previous` / `next` — adjacent section metadata for navigation
 * - `children` — the MDX (or React) content to render
 */
export interface TextbookLayoutProps {
  activeSlug: string | null
  chapterNumber?: string
  chapterTitle?: string
  sectionTitle?: string
  headings?: { id: string; text: string; level: number }[]
  previous?: { slug: string; title: string } | null
  next?: { slug: string; title: string } | null
  children: React.ReactNode
}

export default function TextbookLayout({
  activeSlug,
  chapterNumber,
  chapterTitle,
  sectionTitle,
  headings,
  previous,
  next,
  children,
}: TextbookLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#fbf7f4] text-[#3b2022]">
      <Header onMenu={() => setSidebarOpen(true)} onSearch={() => {
        // Dispatch Ctrl+K to open CourseSearch
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
      }} />
      <CourseSearch />
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activeSlug={activeSlug} />
        <main className="min-w-0 flex-1">
          <div className="flex justify-center">
            {/* ─── Content area ─── */}
            <article className="mx-auto max-w-[760px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14 lg:px-10">
              {/* Breadcrumb */}
              {chapterNumber && chapterTitle && (
                <div className="mb-8 flex items-center gap-2 text-[11px] font-medium text-[#866b6b]">
                  <span>CAPÍTULO {chapterNumber}</span>
                  <span className="text-[#c9a4a4]">/</span>
                  <span className="text-[#7f0303]">{chapterTitle.toUpperCase()}</span>
                </div>
              )}

              {/* Section title (from metadata; MDX can also render its own h1) */}
              {sectionTitle && (
                <h1 className="font-serif text-4xl font-semibold tracking-[-0.03em] text-[#4a1112] sm:text-[52px] sm:leading-[1.05]">
                  {sectionTitle}
                </h1>
              )}

              {/* MDX content slot */}
              <div className="mdx-content">
                {children}
              </div>

              {/* Prev / Next navigation */}
              {(previous || next) && (
                <div className="mt-16 grid gap-3 border-t border-[#dedbd3] pt-5 sm:grid-cols-2">
                  {previous ? (
                    <a href={`/curso/${previous.slug}`} className="group rounded-lg p-3 text-left hover:bg-[#f8eaea]">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#967070]">← Anterior</p>
                      <p className="mt-1 font-serif text-sm font-semibold text-[#604747] group-hover:text-[#7f0303]">{previous.title}</p>
                    </a>
                  ) : <div />}
                  {next ? (
                    <a href={`/curso/${next.slug}`} className="group rounded-lg p-3 text-right hover:bg-[#f8eaea]">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#967070]">Siguiente →</p>
                      <p className="mt-1 font-serif text-sm font-semibold text-[#604747] group-hover:text-[#7f0303]">{next.title}</p>
                    </a>
                  ) : <div />}
                </div>
              )}
            </article>

            <TableOfContents headings={headings} />
          </div>
        </main>
      </div>
      {/* CourseSearch handles its own portal/overlay */}
    </div>
  )
}
