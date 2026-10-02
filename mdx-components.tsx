/**
 * Root MDX components file — required by @next/mdx.
 *
 * This file maps custom component names (like <Definition>, <Formula>, etc.)
 * to their React implementations so they can be used directly inside .mdx files
 * without any explicit import.
 *
 * It also overrides default HTML elements rendered by MDX (h1, h2, p, etc.)
 * to match the existing textbook visual design.
 */

import type { MDXComponents } from 'mdx/types'
import {
  Definition,
  Formula,
  Example,
  Problem,
  Note,
  Image as ContentImage,
  ImageGrid,
  Quiz,
  StressCalculator,
  MohrCircle,
  BeamDiagram,
} from '@/components/mdx-components'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // ─── Default element overrides ───────────────────────────────────
    // These ensure MDX-generated HTML matches the existing textbook typography.
    h1: (props) => (
      <h1
        className="font-serif text-4xl font-semibold tracking-[-0.03em] text-[#4a1112] sm:text-[52px] sm:leading-[1.05]"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className="mt-12 font-serif text-2xl font-semibold text-[#4b1719] sm:text-3xl"
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        className="mt-8 font-serif text-xl font-semibold text-[#4b1719]"
        {...props}
      />
    ),
    p: (props) => (
      <p className="mt-4 text-[15px] leading-8 text-[#604949]" {...props} />
    ),
    strong: (props) => (
      <strong className="font-semibold text-[#8f2525]" {...props} />
    ),
    em: (props) => <em className="italic" {...props} />,
    hr: () => <div className="my-10 h-px bg-[#dedbd3]" />,
    ul: (props) => (
      <ul
        className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-8 text-[#604949]"
        {...props}
      />
    ),
    ol: (props) => (
      <ol
        className="mt-4 list-decimal space-y-2 pl-6 text-[15px] leading-8 text-[#604949]"
        {...props}
      />
    ),
    li: (props) => <li className="pl-1" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="my-6 border-l-4 border-[#e3caca] pl-5 text-[15px] italic leading-8 text-[#765e5e]"
        {...props}
      />
    ),
    table: (props) => (
      <div className="my-6 overflow-x-auto">
        <table
          className="w-full border-collapse text-sm text-[#604949]"
          {...props}
        />
      </div>
    ),
    th: (props) => (
      <th
        className="border-b-2 border-[#e3caca] bg-[#faf0ef] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-[#765e5e]"
        {...props}
      />
    ),
    td: (props) => (
      <td className="border-b border-[#ead8d8] px-4 py-3" {...props} />
    ),
    code: (props) => (
      <code
        className="rounded border border-[#ead8d8] bg-[#faf0ef] px-1.5 py-0.5 font-mono text-[13px] text-[#6a2022]"
        {...props}
      />
    ),
    pre: (props) => (
      <pre
        className="my-6 overflow-x-auto rounded-lg border border-[#e3caca] bg-[#faf0ef] p-4 font-mono text-sm leading-6 text-[#4b1719]"
        {...props}
      />
    ),

    // ─── Custom MDX components available in every .mdx file ─────────
    Definition,
    Formula,
    Example,
    Problem,
    Note,
    Image: ContentImage,
    ImageGrid,
    Quiz,
    StressCalculator,
    MohrCircle,
    BeamDiagram,

    // Allow page-level overrides
    ...components,
  }
}
