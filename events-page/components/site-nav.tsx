'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const leftLinks = [
  { label: 'Events', href: '/events' },
  { label: 'Leaderboard', href: '#' },
  { label: 'Gallery', href: '#' },
  { label: 'Registrations', href: '#' },
]

const rightLinks = [
  { label: 'Teams', href: '#' },
  { label: 'Sponsors', href: '#' },
  { label: 'Announcements', href: '#' },
  { label: 'Contact Us', href: '#' },
]

function NavLink({ label, href, active, onClick }: { label: string; href: string; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative font-serif whitespace-nowrap text-base font-bold tracking-wide xl:text-lg text-primary transition-colors hover:text-foreground',
        'after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100',
        active && 'text-foreground after:scale-x-100',
      )}
    >
      {label}
    </Link>
  )
}

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isActive = (href: string) => href !== '#' && pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-[#0b0c0b]/80 to-transparent">
      <span aria-hidden="true" className="absolute left-4 top-1/2 hidden size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-primary/70 md:left-10 lg:block" />
      <span aria-hidden="true" className="absolute right-4 top-1/2 hidden size-3 translate-x-1/2 -translate-y-1/2 rotate-45 border border-primary/70 md:right-10 lg:block" />
      <nav aria-label="Main" className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-6 py-5 md:px-16">
        <ul className="hidden items-center gap-5 lg:flex xl:gap-10">
          {leftLinks.map((l) => (
            <li key={l.label}>
              <NavLink {...l} active={isActive(l.href)} />
            </li>
          ))}
        </ul>

        <Link href="/" className="shrink-0" aria-label="Trinity home">
          <span
            role="img"
            aria-label="Trinity"
            className="block h-10 w-[100px] bg-[url('/images/trinity-logo.png')] bg-contain bg-center bg-no-repeat [mask-image:url('/images/trinity-logo.png')] [mask-mode:luminance] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
          />
        </Link>

        <ul className="hidden items-center gap-5 lg:flex xl:gap-10">
          {rightLinks.map((l) => (
            <li key={l.label}>
              <NavLink {...l} active={isActive(l.href)} />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="text-primary lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </nav>

      {open && (
        <ul id="mobile-menu" className="flex flex-col gap-5 border-y border-primary/20 bg-background/95 px-8 py-6 lg:hidden">
          {[...leftLinks, ...rightLinks].map((l) => (
            <li key={l.label}>
              <NavLink {...l} active={isActive(l.href)} onClick={() => setOpen(false)} />
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
