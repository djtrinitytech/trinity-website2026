export function PageHeader({
  eyebrow,
  title,
  devanagari,
  subtitle,
}: {
  eyebrow: string
  title: string
  devanagari?: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">{eyebrow}</p>
      {devanagari && (
        <p className="text-metal mt-3 font-devanagari text-6xl leading-tight md:text-8xl" lang="hi">
          {devanagari}
        </p>
      )}
      <h1 className="mt-2 font-serif text-2xl uppercase tracking-[0.2em] text-foreground md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-4 max-w-xl text-pretty font-serif text-base leading-relaxed text-muted-foreground">{subtitle}</p>}
      <div aria-hidden="true" className="mt-6 flex items-center gap-3 text-primary">
        <span className="h-px w-16 bg-primary/50" />
        <span className="size-1.5 rotate-45 bg-primary" />
        <span className="h-px w-16 bg-primary/50" />
      </div>
    </div>
  )
}
