'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useContentSlug } from '@/lib/content-context'

export function Definition({ children, title = 'Definición' }: { children: ReactNode; title?: string }) {
  return <aside className="my-7 rounded-r-lg border border-y-0 border-r-0 border-l-4 border-l-[#7f0303] bg-[#f8eaea] px-5 py-4"><p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#765e5e]">{title}</p><div className="text-sm leading-7 text-[#4d3838]">{children}</div></aside>
}

export function Note({ children, title = 'Nota' }: { children: ReactNode; title?: string }) {
  return <aside className="my-7 rounded-r-lg border border-y-0 border-r-0 border-l-4 border-l-[#a34a4a] bg-[#f8eeee] px-5 py-4"><p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#765e5e]">{title}</p><div className="text-sm leading-7 text-[#4d3838]">{children}</div></aside>
}

export function Formula({ children, label }: { children: ReactNode; label?: string }) {
  return <div className="my-7 rounded-lg border border-[#ead7d7] bg-[#faf0ef] px-5 py-6 text-center"><div className="font-serif text-3xl italic tracking-wide text-[#4b1719] sm:text-4xl">{children}</div>{label && <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-[#9a7777]">{label}</p>}</div>
}

export function Example({ children, title = 'Ejemplo resuelto' }: { children: ReactNode; title?: string }) {
  return <section className="my-8 rounded-lg border border-[#e3caca] bg-white/55 p-5 sm:p-6"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8f2525]">{title}</p><div className="text-sm leading-7 text-[#604747]">{children}</div></section>
}

export function Problem({ children, title = 'Problema propuesto' }: { children: ReactNode; title?: string }) {
  return <section className="my-8 rounded-lg border border-dashed border-[#d9aaaa] bg-[#fcf7f5] p-5 sm:p-6"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a6262]">{title}</p><div className="text-sm leading-7 text-[#604747]">{children}</div></section>
}

export function Image({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const slug = useContentSlug()

  // Resolve relative paths (./image.png or image.png) to the content API
  let resolvedSrc = src
  if (slug && !src.startsWith('/') && !src.startsWith('http')) {
    // Strip leading ./ if present
    const filename = src.replace(/^\.\//, '')
    resolvedSrc = `/api/imagen/${slug}/${filename}`
  }

  return (
    <figure className="my-8">
      <img src={resolvedSrc} alt={alt} className="h-auto w-full rounded-lg border border-[#e5cfcd]" loading="lazy" />
      {caption && <figcaption className="mt-2 text-center text-xs text-[#765e5e]">{caption}</figcaption>}
    </figure>
  )
}

export function Quiz({ question, answer }: { question: string; answer?: ReactNode }) {
  const [open, setOpen] = useState(false)
  return <section className="my-8 rounded-lg border border-[#e5c6c4] bg-[#f7e9e8] p-5"><p className="text-sm font-semibold text-[#4b1719]">{question}</p>{answer && <button type="button" onClick={() => setOpen(!open)} className="mt-3 text-xs font-semibold text-[#7f0303] underline underline-offset-4">{open ? 'Ocultar respuesta' : 'Ver respuesta'}</button>}{open && <div className="mt-3 border-t border-[#e5c6c4] pt-3 text-sm leading-7 text-[#604747]">{answer}</div>}</section>
}

export function StressCalculator() {
  const [force, setForce] = useState('12000')
  const [area, setArea] = useState('490.9')
  const stress = useMemo(() => { const p = Number(force); const a = Number(area); return a > 0 && Number.isFinite(p) ? (p / a).toFixed(1) : '—' }, [force, area])
  return <section className="my-10 rounded-xl border border-[#e5c6c4] bg-[#f7e9e8] p-5 sm:p-7"><div className="mb-5"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8f2525]">Herramienta interactiva</p><h3 className="font-serif text-xl font-semibold text-[#4b1719]">Calculadora de esfuerzo normal</h3></div><div className="grid gap-4 sm:grid-cols-[1fr_1fr_1.1fr] sm:items-end"><label className="flex flex-col gap-2"><span className="text-xs font-semibold text-[#674b4b]">Fuerza P <span className="font-normal text-[#a98383]">(N)</span></span><input value={force} onChange={(e) => setForce(e.target.value)} type="number" className="h-11 rounded-md border border-[#e5c6c4] bg-white px-3 font-mono text-sm text-[#4b1719] outline-none ring-[#a33b3b] focus:ring-2" /></label><label className="flex flex-col gap-2"><span className="text-xs font-semibold text-[#674b4b]">Área A <span className="font-normal text-[#a98383]">(mm²)</span></span><input value={area} onChange={(e) => setArea(e.target.value)} type="number" className="h-11 rounded-md border border-[#e5c6c4] bg-white px-3 font-mono text-sm text-[#4b1719] outline-none ring-[#a33b3b] focus:ring-2" /></label><div className="flex h-20 items-center justify-between rounded-md bg-[#4b1719] px-4 text-[#f4f1e9] sm:h-11"><span className="text-xs text-[#e2bcbc]">σ = P / A</span><span className="font-mono text-xl font-semibold">{stress} <small className="text-xs font-normal text-[#e2bcbc]">MPa</small></span></div></div></section>
}

export function BeamDiagram({ children }: { children?: ReactNode }) { return <figure className="my-7 rounded-lg border border-[#e5cfcd] bg-[#fcf7f5] p-6 text-center text-sm text-[#765e5e]">{children ?? 'Diagrama de viga pendiente de definir.'}</figure> }
export function MohrCircle({ children }: { children?: ReactNode }) { return <figure className={cn('my-7 rounded-lg border border-[#e5cfcd] bg-[#fcf7f5] p-6 text-center text-sm text-[#765e5e]')}>{children ?? 'Círculo de Mohr pendiente de definir.'}</figure> }

export const mdxComponents = { Definition, Formula, Example, Problem, Note, Image, Quiz, StressCalculator, MohrCircle, BeamDiagram }

export default mdxComponents
