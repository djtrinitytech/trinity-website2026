import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EventCard } from '@/components/event-card'
import { PageHeader } from '@/components/page-header'
import { categories, getCategory, getEventsByCategory } from '@/lib/events'

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const cat = getCategory(category)
  return { title: cat ? `${cat.name} Events — Trinity` : 'Events — Trinity', description: cat?.description }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = getCategory(category)
  if (!cat) notFound()
  const list = getEventsByCategory(cat.slug)

  return (
    <main className="mx-auto max-w-6xl px-8 pb-24 pt-10 md:px-16">
      <Link href="/events" className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-primary">
        <span aria-hidden="true">{'← '}</span>All orders
      </Link>
      <div className="mt-6">
        <PageHeader eyebrow={cat.tagline} devanagari={cat.sanskrit} title={`${cat.name} Events`} subtitle={cat.description} />
      </div>

      <nav aria-label="Event categories" className="mt-10 flex justify-center gap-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/events/${c.slug}`}
            aria-current={c.slug === cat.slug ? 'page' : undefined}
            className={
              c.slug === cat.slug
                ? 'border-b border-primary pb-1 font-serif font-semibold text-primary'
                : 'border-b border-transparent pb-1 font-serif text-muted-foreground hover:text-foreground'
            }
          >
            {c.name}
          </Link>
        ))}
      </nav>

      <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((e) => (
          <li key={e.slug}>
            <EventCard event={e} />
          </li>
        ))}
      </ul>
    </main>
  )
}
