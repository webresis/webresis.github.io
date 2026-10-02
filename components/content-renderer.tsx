import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { visit } from 'unist-util-visit'
import { Image } from '@/components/mdx-components'
import type { CourseDocument } from '@/lib/content-schema'

const allowedDirectives = new Set(['definition', 'note', 'example', 'problem', 'solution', 'quiz', 'summary', 'formula', 'imagegrid'])

function attribute(source: string, name: string): string {
  return source.match(new RegExp(`${name}=["']([^"']*)["']`))?.[1]
    || source.match(new RegExp(`${name}=\\{([^}]*)\\}`))?.[1]
    || ''
}

function normalizeLegacyMdx(markdown: string): string {
  // Text copied from chats/editors commonly escapes Markdown punctuation and inserts space entities.
  let normalized = markdown
    .replace(/&#x20;|&nbsp;/gi, ' ')
    .replace(/\\([#*<>_])/g, '$1')

  normalized = normalized.replace(/<(Solution)\s*>\s*([\s\S]*?)\s*<\/\1>/gi, (_match, _tag, body) => `:::solution\n${body.trim()}\n:::`)

  normalized = normalized.replace(/<Image\b([\s\S]*?)\/>/gi, (_match, attrs) => {
    const src = attribute(attrs, 'src')
    const alt = attribute(attrs, 'alt') || 'Imagen del curso'
    const caption = attribute(attrs, 'caption').replace(/"/g, "'")
    return src ? `![${alt}](${src}${caption ? ` "${caption}"` : ''})` : ''
  })

  normalized = normalized.replace(/<ImageGrid([^>]*)>\s*([\s\S]*?)\s*<\/ImageGrid>/gi, (_match, attrs, body) => {
    const columns = attribute(attrs, 'columns') || '2'
    return `::::imagegrid{columns="${columns}"}\n${body.trim()}\n::::`
  })

  normalized = normalized.replace(/<Quiz([^>]*)>\s*([\s\S]*?)\s*<\/Quiz>/gi, (_match, attrs, body) => {
    const question = attribute(attrs, 'question') || 'Pregunta'
    return `:::quiz{question="${question}"}\n${body.trim()}\n:::`
  })

  for (const tag of ['Definition', 'Note', 'Example', 'Problem', 'Summary']) {
    const pattern = new RegExp(`<(${tag})([^>]*)>\\s*([\\s\\S]*?)\\s*<\\/${tag}>`, 'gi')
    normalized = normalized.replace(pattern, (_match, _name, attrs, body) => {
      const kind = tag.toLowerCase()
      const title = attribute(attrs, 'title')
      const number = attribute(attrs, 'number')
      const displayTitle = number ? `${tag} ${number}${title ? `: ${title}` : ''}` : title
      return `::::${kind}${displayTitle ? `{title="${displayTitle}"}` : ''}\n${body.trim()}\n::::`
    })
  }

  normalized = normalized.replace(/<Formula([^>]*)>\s*([\s\S]*?)\s*<\/Formula>/gi, (_match, attrs, body) => {
    const label = attribute(attrs, 'label')
    const latex = body.trim().replace(/^\$\$\s*/, '').replace(/\s*\$\$$/, '')
    return `:::formula${label ? `{title="${label}"}` : ''}\n$$\n${latex}\n$$\n:::`
  })

  return normalized
}

function remarkCourseDirectives() {
  return (tree: unknown) => {
    visit(tree as never, ['containerDirective'], (node: any) => {
      if (!allowedDirectives.has(node.name)) return
      node.data ||= {}
      node.data.hName = 'div'
      node.data.hProperties = {
        'data-course-kind': node.name,
        'data-course-title': node.attributes?.title || node.label || '',
        'data-course-question': node.attributes?.question || '',
        'data-course-columns': node.attributes?.columns || '',
      }
    })
  }
}

function CourseDirective({ kind, title, question, columns, children }: { kind: string; title?: string; question?: string; columns?: string; children: ReactNode }) {
  if (kind === 'imagegrid') {
    const grid = columns === '3' ? 'md:grid-cols-3' : columns === '4' ? 'md:grid-cols-4' : 'sm:grid-cols-2'
    return <div className={`my-8 grid grid-cols-1 gap-5 ${grid} [&>p]:contents [&_figure]:my-0`}>{children}</div>
  }
  if (kind === 'formula') {
    return <div className="my-7 overflow-x-auto rounded-lg border border-[#ead7d7] bg-[#faf0ef] px-5 py-6 text-center"><div className="text-[#4b1719] [&>p]:my-0">{children}</div>{title && <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-[#9a7777]">{title}</p>}</div>
  }
  if (kind === 'solution') {
    return <details className="group my-5"><summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.14em] text-[#7f0303]">Mostrar solución</summary><div className="mt-3 border-l-2 border-[#e3caca] pl-4">{children}</div></details>
  }
  if (kind === 'quiz') {
    return <section className="my-8 rounded-lg border border-[#e5c6c4] bg-[#f7e9e8] p-5"><p className="font-semibold text-[#4b1719]">{question || title || 'Pregunta'}</p><details className="group mt-3"><summary className="cursor-pointer text-xs font-semibold text-[#7f0303] underline underline-offset-4">Ver respuesta</summary><div className="mt-3 border-t border-[#e5c6c4] pt-3">{children}</div></details></section>
  }

  const labels: Record<string, string> = { definition: 'Definición', note: 'Nota', example: 'Ejemplo resuelto', problem: 'Problema propuesto', summary: 'Resumen' }
  const styles: Record<string, string> = {
    definition: 'border-l-[#7f0303] bg-[#f8eaea]',
    note: 'border-l-[#a34a4a] bg-[#f8eeee]',
    example: 'border-l-[#8f2525] bg-[#fdfaf9]',
    problem: 'border-l-[#a56d6d] bg-[#fcf7f5]',
    summary: 'border-l-[#7f0303] bg-[#f9ebe9]',
  }
  return <section className={`my-8 rounded-r-lg border-l-4 px-5 py-4 ${styles[kind] || styles.note}`}><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7f0303]">{title || labels[kind] || kind}</p><div className="text-sm leading-7 text-[#4d3838]">{children}</div></section>
}

function DirectiveDiv(props: ComponentPropsWithoutRef<'div'> & { node?: unknown }) {
  const { node: _node, children, ...rest } = props
  const kind = String(rest['data-course-kind' as keyof typeof rest] || '')
  if (!kind) return <div {...rest}>{children}</div>
  const title = String(rest['data-course-title' as keyof typeof rest] || '')
  const question = String(rest['data-course-question' as keyof typeof rest] || '')
  const columns = String(rest['data-course-columns' as keyof typeof rest] || '')
  return <CourseDirective kind={kind} title={title} question={question} columns={columns}>{children}</CourseDirective>
}

export function ContentRenderer({ document }: { document: CourseDocument }) {
  return <article className="markdown-course">
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath, remarkDirective, remarkCourseDirectives]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1: ({ children }) => <h1 className="mb-8 font-serif text-4xl font-semibold tracking-[-0.03em] text-[#4a1112] sm:text-[52px] sm:leading-[1.05]">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-4 mt-10 font-serif text-2xl font-semibold text-[#4b1719] sm:text-3xl">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-3 mt-8 font-serif text-xl font-semibold text-[#4b1719]">{children}</h3>,
        p: ({ children }) => <p className="my-5 text-[15px] leading-8 text-[#604747]">{children}</p>,
        ul: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-6 text-[15px] leading-7 text-[#604747]">{children}</ul>,
        ol: ({ children }) => <ol className="my-5 list-decimal space-y-2 pl-6 text-[15px] leading-7 text-[#604747]">{children}</ol>,
        blockquote: ({ children }) => <blockquote className="my-6 border-l-4 border-[#c89b9b] pl-5 italic text-[#765e5e]">{children}</blockquote>,
        a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="font-medium text-[#7f0303] underline underline-offset-4">{children}</a>,
        code: ({ children, className }) => className ? <code className={`${className} block overflow-x-auto rounded-lg bg-[#321b1c] p-4 text-sm text-[#fff4f0]`}>{children}</code> : <code className="rounded bg-[#f1e4e2] px-1.5 py-0.5 font-mono text-[0.9em] text-[#7f0303]">{children}</code>,
        table: ({ children }) => <div className="my-7 overflow-x-auto"><table className="w-full border-collapse text-sm">{children}</table></div>,
        th: ({ children }) => <th className="border border-[#ddcaca] bg-[#f4e5e3] px-3 py-2 text-left text-[#4b1719]">{children}</th>,
        td: ({ children }) => <td className="border border-[#e5d4d4] px-3 py-2 text-[#604747]">{children}</td>,
        img: ({ src, alt, title }) => <Image src={src || ''} alt={alt || ''} caption={title || undefined} />,
        div: DirectiveDiv,
      }}
    >
      {normalizeLegacyMdx(document.contentMarkdown)}
    </ReactMarkdown>
  </article>
}

export default ContentRenderer
