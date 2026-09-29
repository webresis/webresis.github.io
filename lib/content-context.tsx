'use client'

import { createContext, useContext } from 'react'

/**
 * Provides the current content slug to child components.
 *
 * This lets the <Image> component resolve relative paths like
 * `./barra-axial.png` into the correct API URL without the
 * MDX author needing to write full paths.
 */

interface ContentContextValue {
  /** Current section slug, e.g. "02-esfuerzo-deformacion/esfuerzo-normal" */
  slug: string
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({
  slug,
  children,
}: {
  slug: string
  children: React.ReactNode
}) {
  return (
    <ContentContext.Provider value={{ slug }}>
      {children}
    </ContentContext.Provider>
  )
}

/**
 * Returns the current content slug.
 * Returns null if called outside a ContentProvider (e.g. in a non-content page).
 */
export function useContentSlug(): string | null {
  const ctx = useContext(ContentContext)
  return ctx?.slug ?? null
}
