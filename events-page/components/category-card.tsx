import Image from 'next/image'
import Link from 'next/link'
import type { Category } from '@/lib/events'

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/events/${category.slug}`}
      className="group relative flex h-full flex-col overflow-hidden border border-border bg-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_40px_-10px_rgba(217,169,91,0.5)]"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={category.image || '/placeholder.svg'}
          alt={`${category.name} events emblem`}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col items-center px-6 pb-8 text-center">
        <p className="font-devanagari text-3xl text-primary" lang="hi">
          {category.sanskrit}
        </p>
        <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">{category.name}</h2>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{category.tagline}</p>
        <p className="mt-4 text-pretty font-serif text-sm leading-relaxed text-muted-foreground">{category.description}</p>
        <span className="mt-6 border-b border-primary/60 pb-0.5 font-serif text-sm font-semibold text-primary">
          Enter the order <span aria-hidden="true">{'→'}</span>
        </span>
      </div>
    </Link>
  )
}
