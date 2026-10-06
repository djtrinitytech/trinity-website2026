export const ORDERS = [
  {
    id: 'sindhu',
    name: 'Sindhu',
    sanskritName: 'सिन्धु',
    subtitle: 'Rivers, Oceans & Maritime Trade',
    description: 'Masters of oceanic navigation, monsoon channels, and transcontinental merchant voyages.',
    color: '#14b8a6',
    accentText: 'text-teal-400',
    borderClass: 'border-teal-500/40 hover:border-teal-400',
    bgBadge: 'bg-teal-950/60 text-teal-300 border-teal-500/30',
    glowColor: 'rgba(20, 184, 166, 0.35)',
    symbolSvg: 'M3 17c3-1.5 6-1.5 9 0 3-1.5 6-1.5 9 0M2 12c4-2 8-2 12 0 4-2 8-2 8 0M4 7l8-4 8 4v5c0 5-4 9-8 10-4-1-8-5-8-10V7z',
    representativeImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'aakar',
    name: 'Aakar',
    sanskritName: 'आकार',
    subtitle: 'Architects, Sculptors & Creators',
    description: 'Sculptors of monolithic mountain sanctuaries, sacred geometry, and enduring granite edifices.',
    color: '#eab308',
    accentText: 'text-amber-400',
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    bgBadge: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
    glowColor: 'rgba(234, 179, 8, 0.35)',
    symbolSvg: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-8h6v8M9 10h6',
    representativeImage: 'https://images.unsplash.com/photo-1600100397608-f010f443b740?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'pragya',
    name: 'Pragya',
    sanskritName: 'प्रज्ञा',
    subtitle: 'Knowledge, Philosophy & Ideas',
    description: 'Keepers of ancient palm-leaf codices, astronomical calculi, logic, and sacred literature.',
    color: '#10b981',
    accentText: 'text-emerald-400',
    borderClass: 'border-emerald-500/40 hover:border-emerald-400',
    bgBadge: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    symbolSvg: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    representativeImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'kshatra',
    name: 'Kshatra',
    sanskritName: 'क्षात्र',
    subtitle: 'Protectors, Warriors & Courage',
    description: 'Guardians of civilizational sovereign frontiers, crucible wootz blades, and royal citadel bulwarks.',
    color: '#ef4444',
    accentText: 'text-red-400',
    borderClass: 'border-red-500/40 hover:border-red-400',
    bgBadge: 'bg-red-950/60 text-red-300 border-red-500/30',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    symbolSvg: 'M12 2l7 4v6c0 5.55-3.84 10.74-7 12-3.16-1.26-7-6.45-7-12V6l7-4z',
    representativeImage: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'aarohan',
    name: 'Aarohan',
    sanskritName: 'आरोहण',
    subtitle: 'Explorers, Navigators & Discovery',
    description: 'Pathfinders of the northern star passes, desert caravans, and celestial astrolabes.',
    color: '#3b82f6',
    accentText: 'text-blue-400',
    borderClass: 'border-blue-500/40 hover:border-blue-400',
    bgBadge: 'bg-blue-950/60 text-blue-300 border-blue-500/30',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    symbolSvg: 'M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93',
    representativeImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'utkarsh',
    name: 'Utkarsh',
    sanskritName: 'उत्कर्ष',
    subtitle: 'Prosperity, Commerce & Craftsmanship',
    description: 'Patrons of fine metallurgy, punch-marked silver mints, repoussé gold chalices, and agrarian wealth.',
    color: '#a855f7',
    accentText: 'text-purple-400',
    borderClass: 'border-purple-500/40 hover:border-purple-400',
    bgBadge: 'bg-purple-950/60 text-purple-300 border-purple-500/30',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    symbolSvg: 'M8 3h8l2 5v4a6 6 0 0 1-6 6v3h3v2H9v-2h3v-3a6 6 0 0 1-6-6V8l2-5z',
    representativeImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop'
  }
];

export const getOrderById = (id) => {
  return ORDERS.find(o => o.id.toLowerCase() === (id || '').toLowerCase());
};
