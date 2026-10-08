import type { Metadata } from 'next'
import { CategoryCard } from '@/components/category-card'
import { PageHeader } from '@/components/page-header'
import { categories } from '@/lib/events'

export const metadata: Metadata = {
  title: 'Events — Trinity',
  description: 'Choose your order: Cultural, Sports or Technical events at Trinity.',
}

export default function EventsPage() {
  return (
    <main className="mx-auto max-w-6xl px-8 pb-24 pt-10 md:px-16">
      <PageHeader
        eyebrow="Choose your order"
        devanagari="उत्सव"
        title="The Events"
        subtitle="Three orders, one archive. Select a path to discover the contests that await."
      />
      <ul className="mt-14 grid gap-8 md:grid-cols-3">
        {categories.map((c) => (
          <li key={c.slug}>
            <CategoryCard category={c} />
          </li>
        ))}
      </ul>
    </main>
  )
}
