import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, MapPin } from 'lucide-react'
import type { FestEvent } from '@/lib/events'

export function EventCard({ event }: { event: FestEvent }) {
  return (
    <Link
      href={`/events/${event.category}/${event.slug}`}
      className="group flex h-full flex-col overflow-hidden border border-border bg-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_40px_-10px_rgba(217,169,91,0.5)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={event.image || '/placeholder.svg'}
          alt={event.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 border border-primary/50 bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          {event.prizePool}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">{event.name}</h2>
        <p className="mt-2 flex-1 text-pretty font-serif text-sm leading-relaxed text-muted-foreground">{event.summary}</p>
        <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4 font-mono text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-primary" aria-hidden="true" />
            {event.date} · {event.time}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-3.5 text-primary" aria-hidden="true" />
            {event.venue}
          </span>
        </div>
        <span className="mt-5 font-serif text-sm font-semibold text-primary">
          View details <span aria-hidden="true">{'→'}</span>
        </span>
      </div>
    </Link>
  )
}
