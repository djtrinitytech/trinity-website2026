import Image from 'next/image'

export function SiteBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b0c0b]">
      <Image src="/images/bg-events.png" alt="" fill priority sizes="100vw" className="object-cover" />
    </div>
  )
}
