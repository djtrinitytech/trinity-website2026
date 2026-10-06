import React from 'react';
import { LayoutGrid, Globe } from 'lucide-react';

export default function FestNavbar({ activeCategory, onSelectCategory, viewMode, onToggleViewMode }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-black/75 border-b border-gold-antique/15 select-none transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        
        {/* Left Navigation matching djstrinity.in/gallery */}
        <nav className="flex items-center gap-5 sm:gap-8 text-xs sm:text-sm font-cinzel tracking-[0.2em] font-medium text-parchment-dim">
          <a
            href="#events"
            onClick={(e) => { e.preventDefault(); onSelectCategory('All'); }}
            className="hover:text-gold-pale transition-colors text-gold-warm"
          >
            Events
          </a>

          <a
            href="#teams"
            onClick={(e) => { e.preventDefault(); onSelectCategory('Teams'); }}
            className="hover:text-gold-pale transition-colors text-gold-warm"
          >
            Teams
          </a>

          {/* Active Gallery Pill matching screenshot */}
          <div className="relative px-4 sm:px-5 py-1.5 rounded-full border border-gold-antique/70 bg-gold-antique/15 text-gold-pale shadow-gold-subtle flex items-center gap-1.5 cursor-pointer">
            <span className="font-semibold tracking-[0.2em] text-xs sm:text-sm text-gold-pale">
              Gallery
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold-pale animate-pulse" />
          </div>

          <a
            href="#sponsors"
            onClick={(e) => e.preventDefault()}
            className="hidden md:inline hover:text-gold-pale transition-colors text-gold-warm"
          >
            Sponsors
          </a>
        </nav>

        {/* Center Triangular Logo matching screenshot exactly (Neon Green Triangle + TRINITY) */}
        <div className="flex flex-col items-center justify-center cursor-pointer group px-2">
          <div className="relative flex items-center justify-center">
            {/* Neon Green Geometric Triangle Logo matching djstrinity.in */}
            <svg
              viewBox="0 0 120 70"
              className="w-14 sm:w-16 h-8 sm:h-9 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_10px_rgba(74,222,128,0.7)]"
            >
              {/* Outer Neon Triangle */}
              <polygon
                points="60,6 114,64 6,64"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              {/* Inner Accent Line */}
              <polyline
                points="35,64 60,20 85,64"
                fill="none"
                stroke="#4ade80"
                strokeWidth="2"
                strokeOpacity="0.8"
              />
              {/* TRINITY Text Plate across the triangle */}
              <rect x="24" y="42" width="72" height="16" fill="#07080a" rx="3" stroke="#22c55e" strokeWidth="1" />
              <text
                x="60"
                y="54"
                fill="#ffffff"
                fontSize="9"
                fontWeight="900"
                fontFamily="system-ui, sans-serif"
                letterSpacing="2.5"
                textAnchor="middle"
              >
                TRINITY
              </text>
            </svg>
          </div>
        </div>

        {/* Right Navigation matching djstrinity.in/gallery + View Mode Switcher */}
        <nav className="flex items-center gap-5 sm:gap-8 text-xs sm:text-sm font-cinzel tracking-[0.2em] font-medium text-parchment-dim">
          <a
            href="#leaderboard"
            onClick={(e) => e.preventDefault()}
            className="hidden lg:inline hover:text-gold-pale transition-colors text-gold-warm"
          >
            Leaderboard
          </a>

          <a
            href="#registrations"
            onClick={(e) => e.preventDefault()}
            className="hover:text-gold-pale transition-colors text-gold-warm"
          >
            Registrations
          </a>

          <a
            href="#contact"
            onClick={(e) => e.preventDefault()}
            className="hidden sm:inline hover:text-gold-pale transition-colors text-gold-warm"
          >
            Contact Us
          </a>

          {/* Quick View Switcher button: Curved 3D vs Clean Grid */}
          <button
            onClick={onToggleViewMode}
            className="px-3 py-1 rounded-full border border-gold-antique/40 bg-obsidian-900/90 text-gold-pale text-xs font-cinzel tracking-wider flex items-center gap-1.5 hover:border-gold-pale hover:shadow-gold-subtle transition-all"
            title={viewMode === 'sphere' ? 'Switch to Easy Grid View' : 'Switch to 3D Curved Dome'}
          >
            {viewMode === 'sphere' ? (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-gold-antique" />
                <span className="hidden md:inline">Grid View</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-gold-antique" />
                <span className="hidden md:inline">Curved Dome</span>
              </>
            )}
          </button>
        </nav>

      </div>
    </header>
  );
}
