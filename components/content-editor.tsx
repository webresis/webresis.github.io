'use client'

import { useDeferredValue, useMemo, useRef, useState } from 'react'
import {
  Bold,
  Code2,
  Download,
  Eye,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Maximize2,
  PanelLeftOpen,
  Quote,
  Sigma,
  Table2,
} from 'lucide-react'
import ContentRenderer from '@/components/content-renderer'
import { chapters } from '@/lib/course-data'
import {
  slugify,
  starterDocument,
  titleFromMarkdown,
  validateCourseDocument,
  type CourseDocument,
} from '@/lib/content-schema'

const inputClass = 'w-full rounded-lg border border-[#dcc3c3] bg-white px-3 py-2.5 text-sm text-[#3b2022] outline-none transition focus:border-[#9c4d4d] focus:ring-2 focus:ring-[#9c4d4d]/15'
const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#7d6060]'

export default function ContentEditor() {
  const [document, setDocument] = useState<CourseDocument>(() => structuredClone(starterDocument))
  const deferredDocument = useDeferredValue(document)
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const markdownRef = useRef<HTMLTextAreaElement>(null)
  const validation = useMemo(() => validateCourseDocument(document), [document])

  function updateMarkdown(contentMarkdown: string) {
    setDocument((current) => {
      const title = titleFromMarkdown(contentMarkdown)
      return {
        ...current,
        title,
        slug: current.slug === 'nueva-pagina' ? slugify(title) : current.slug,
        contentMarkdown,
      }
    })
  }

  function insertMarkdown(before: string, after = '', placeholder = '') {
    const textarea = markdownRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const editorScrollTop = textarea.scrollTop
    const editorScrollLeft = textarea.scrollLeft
    const pageScrollX = window.scrollX
    const pageScrollY = window.scrollY
    const selected = document.contentMarkdown.slice(start, end) || placeholder
    const next = `${document.contentMarkdown.slice(0, start)}${before}${selected}${after}${document.contentMarkdown.slice(end)}`
    updateMarkdown(next)
    requestAnimationFrame(() => {
      textarea.focus({ preventScroll: true })
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
      textarea.scrollTop = editorScrollTop
      textarea.scrollLeft = editorScrollLeft
      window.scrollTo(pageScrollX, pageScrollY)
    })
  }

  function downloadMarkdown() {
    const blob = new Blob([document.contentMarkdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const anchor = window.document.createElement('a')
    anchor.href = url
    anchor.download = `${document.slug || 'pagina'}.md`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function handleMarkdownKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Tab') return
    event.preventDefault()
    insertMarkdown('  ')
  }

  function insertEducationalBlock(kind: string) {
    if (kind === 'definition') insertMarkdown('\n<Definition title="Definición">\n', '\n</Definition>\n', 'Escribe la definición.')
    else if (kind === 'note') insertMarkdown('\n<Note title="Nota importante">\n', '\n</Note>\n', 'Escribe la observación.')
    else if (kind === 'example') insertMarkdown('\n<Example number={1} title="Ejemplo resuelto">\n', '\n\n<Solution>\nDescribe la solución paso a paso.\n</Solution>\n</Example>\n', 'Escribe el enunciado.')
    else if (kind === 'problem') insertMarkdown('\n<Problem number={1} title="Problema propuesto">\n', '\n\n<Solution>\nDescribe la solución paso a paso.\n</Solution>\n</Problem>\n', 'Escribe el problema.')
    else if (kind === 'quiz') insertMarkdown('\n<Quiz question="Escribe la pregunta">\n', '\n</Quiz>\n', 'Escribe la respuesta.')
    else if (kind === 'summary') insertMarkdown('\n<Summary title="Resumen">\n', '\n</Summary>\n', 'Resume los puntos principales.')
    else if (kind === 'imagegrid') insertMarkdown('\n<ImageGrid columns={2}>\n  <Image src="imagen-1.png" alt="Descripción de la primera imagen" caption="Figura 1" />\n\n  <Image src="imagen-2.png" alt="Descripción de la segunda imagen" caption="Figura 2" />\n</ImageGrid>\n')
  }

  const toolClass = 'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[#6f5050] hover:bg-[#f1dddd] hover:text-[#7f0303]'

  return <div className="min-h-screen bg-[#f3ece8] text-[#3b2022]">
    <header className="sticky top-0 z-30 border-b border-[#ddcaca] bg-[#fbf7f4]/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#7f0303]">Panel de contenido</p><h1 className="font-serif text-xl font-semibold">Editor Markdown</h1></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={downloadMarkdown} className="inline-flex items-center gap-2 rounded-lg bg-[#7f0303] px-3 py-2 text-xs font-semibold text-white hover:bg-[#681012]"><Download className="size-4" />Exportar Markdown</button>
        </div>
      </div>
    </header>

    <div className={`mx-auto grid max-w-[1800px] gap-5 p-4 sm:p-6 ${previewExpanded ? 'grid-cols-1' : 'xl:grid-cols-[minmax(420px,0.9fr)_minmax(520px,1.1fr)]'}`}>
      {!previewExpanded && <section className="min-w-0 space-y-4">
        <details className="rounded-xl border border-[#ddcaca] bg-[#fbf7f4] shadow-sm">
          <summary className="cursor-pointer px-4 py-3 font-serif font-semibold text-[#4b1719]">Configuración de la página</summary>
          <div className="space-y-3 border-t border-[#eadada] p-4"><div className="grid gap-3 sm:grid-cols-2"><label><span className={labelClass}>Capítulo</span><select className={inputClass} value={document.chapterId} onChange={(event) => setDocument({ ...document, chapterId: event.target.value })}>{chapters.map((chapter) => <option key={chapter.number} value={chapter.number}>{chapter.number} · {chapter.title}</option>)}</select></label><label><span className={labelClass}>Slug</span><input className={`${inputClass} font-mono`} value={document.slug} onChange={(event) => setDocument({ ...document, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} /></label></div><p className="text-xs text-[#8b6d6d]">Título detectado automáticamente: <strong>{document.title}</strong></p></div>
        </details>

        <div className="overflow-hidden rounded-xl border border-[#ddcaca] bg-white shadow-sm">
          <div onMouseDown={(event) => { if ((event.target as HTMLElement).closest('button')) event.preventDefault() }} className="flex flex-nowrap items-center gap-1 overflow-x-auto border-b border-[#eadada] bg-[#fbf7f4] p-2 [scrollbar-width:thin]">
            <button type="button" className={toolClass} title="Negrita" aria-label="Negrita" onClick={() => insertMarkdown('**', '**', 'texto')}><Bold className="size-4" /></button>
            <button type="button" className={toolClass} title="Cursiva" aria-label="Cursiva" onClick={() => insertMarkdown('*', '*', 'texto')}><Italic className="size-4" /></button>
            <button type="button" className={toolClass} title="Subtítulo H2" aria-label="Subtítulo H2" onClick={() => insertMarkdown('\n## ', '\n', 'Subtítulo')}><Heading2 className="size-4" /></button>
            <button type="button" className={toolClass} title="Subtítulo H3" aria-label="Subtítulo H3" onClick={() => insertMarkdown('\n### ', '\n', 'Subtítulo menor')}><Heading3 className="size-4" /></button>
            <span className="mx-1 h-6 w-px shrink-0 bg-[#decaca]" />
            <button type="button" className={toolClass} title="Lista" aria-label="Lista" onClick={() => insertMarkdown('\n- ', '\n', 'Elemento')}><List className="size-4" /></button>
            <button type="button" className={toolClass} title="Lista numerada" aria-label="Lista numerada" onClick={() => insertMarkdown('\n1. ', '\n2. Segundo elemento\n', 'Primer elemento')}><ListOrdered className="size-4" /></button>
            <button type="button" className={toolClass} title="Enlace" aria-label="Enlace" onClick={() => insertMarkdown('[', '](https://ejemplo.com)', 'texto del enlace')}><Link className="size-4" /></button>
            <button type="button" className={toolClass} title="Cita" aria-label="Cita" onClick={() => insertMarkdown('\n> ', '\n', 'Cita o idea destacada')}><Quote className="size-4" /></button>
            <button type="button" className={toolClass} title="Código" aria-label="Código" onClick={() => insertMarkdown('`', '`', 'código')}><Code2 className="size-4" /></button>
            <span className="mx-1 h-6 w-px shrink-0 bg-[#decaca]" />
            <button type="button" className={toolClass} title="Fórmula" aria-label="Fórmula" onClick={() => insertMarkdown('\n<Formula label="Nombre de la fórmula">\n$$\n', '\n$$\n</Formula>\n', '\\sigma = \\frac{P}{A}')}><Sigma className="size-4" /></button>
            <button type="button" className={toolClass} title="Imagen" aria-label="Imagen" onClick={() => insertMarkdown('\n<Image src="', '" alt="Descripción de la imagen" caption="Figura 1" />\n', 'imagen.png')}><ImageIcon className="size-4" /></button>
            <button type="button" className={toolClass} title="Tabla" aria-label="Tabla" onClick={() => insertMarkdown('\n| Propiedad | Símbolo | Valor |\n|---|---|---|\n| Esfuerzo | σ | 40 MPa |\n', '\n')}><Table2 className="size-4" /></button>
            <span className="mx-1 h-6 w-px shrink-0 bg-[#decaca]" />
            <select aria-label="Insertar componente del curso" defaultValue="" onChange={(event) => { insertEducationalBlock(event.target.value); event.target.value = '' }} className="h-8 shrink-0 rounded-md border border-[#d8c1c1] bg-white px-2 text-xs font-semibold text-[#6f5050] outline-none hover:border-[#b78383]">
              <option value="" disabled>Insertar componente…</option>
              <option value="definition">Definición</option>
              <option value="note">Nota</option>
              <option value="example">Ejemplo</option>
              <option value="problem">Problema</option>
              <option value="quiz">Quiz</option>
              <option value="summary">Resumen</option>
              <option value="imagegrid">ImageGrid</option>
            </select>
          </div>
          <textarea ref={markdownRef} value={document.contentMarkdown} onChange={(event) => updateMarkdown(event.target.value)} onKeyDown={handleMarkdownKeyDown} spellCheck className="min-h-[650px] w-full resize-y bg-[#fffdfc] p-5 font-mono text-[14px] leading-7 text-[#3f3030] outline-none sm:p-7" placeholder="# Título de la página&#10;&#10;Empieza a escribir en Markdown…" />
          <div className="border-t border-[#eadada] bg-[#fbf7f4] px-4 py-2 text-[10px] text-[#967070]">Markdown · GFM · LaTeX · {document.contentMarkdown.length.toLocaleString('es')} caracteres</div>
        </div>
      </section>}

      <aside className={`min-w-0 ${previewExpanded ? 'h-[calc(100vh-105px)]' : 'xl:sticky xl:top-[81px] xl:h-[calc(100vh-105px)]'}`}>
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#d8c2c2] bg-white shadow-lg shadow-[#4b1719]/5"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eadada] bg-[#fbf7f4] px-4 py-3"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#765e5e]"><Eye className="size-4 text-[#7f0303]" />Vista previa en vivo</p><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${validation.success ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{validation.success ? 'Markdown válido' : `${validation.errors.length} observaciones`}</span><button type="button" onClick={() => setPreviewExpanded((expanded) => !expanded)} className="inline-flex items-center gap-1.5 rounded-md border border-[#d5baba] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#6a2022] hover:bg-[#f8eaea]" aria-label={previewExpanded ? 'Mostrar editor Markdown' : 'Expandir vista previa'}>{previewExpanded ? <PanelLeftOpen className="size-3.5" /> : <Maximize2 className="size-3.5" />}<span className="hidden sm:inline">{previewExpanded ? 'Volver a editar' : 'Vista completa'}</span></button></div></div><div className="flex-1 overflow-y-auto bg-[#fbf7f4] p-5 sm:p-8"><div className="mx-auto max-w-[760px]"><ContentRenderer document={deferredDocument} /></div></div></div>
      </aside>
    </div>
  </div>
}
