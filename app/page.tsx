import { redirect } from 'next/navigation'
import { allSections } from '@/lib/course-data'

/**
 * Root page — redirects to the first available course section.
 *
 * If you want a landing page instead, replace the redirect with
 * a landing page component.
 */
export default function Page() {
  // Find the first section that has a content slug
  const first = allSections.find((s) => s.slug !== null)
  if (first?.slug) {
    redirect(`/curso/${first.slug}`)
  }
  // Fallback: redirect to the first section slug regardless
  redirect('/curso/01-introduccion/panorama-del-curso')
}
