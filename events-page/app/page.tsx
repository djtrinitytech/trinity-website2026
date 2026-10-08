import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="relative flex min-h-[calc(100svh-88px)] flex-col items-center justify-center px-6 text-center">
      <p className="absolute left-10 top-8 hidden font-mono text-xs uppercase leading-6 tracking-[0.3em] text-muted-foreground md:block md:left-16">
        Six Orders
        <br />
        One Civilization
      </p>

      <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">A Living Archive</p>
      <h1 className="text-metal mt-2 font-devanagari text-7xl leading-tight md:text-9xl" lang="hi">
        अनुगाथा
      </h1>
      <p className="mt-6 font-serif text-sm uppercase leading-7 tracking-[0.2em] text-foreground md:text-base">
        A Journey Through
        <br />
        The Pillars of Civilization
      </p>
      <Link
        href="/events"
        className="mt-8 border-b border-foreground/60 pb-1 font-serif font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        Begin the passage <span aria-hidden="true">{'→'}</span>
      </Link>

      <p className="absolute bottom-8 right-10 hidden font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground md:block md:right-16">
        {"Est. 2026'27 · 19° 04′ N"}
      </p>
    </main>
  )
}
