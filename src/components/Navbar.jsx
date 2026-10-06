import React from 'react';
import { Camera, PlusCircle, Calendar, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenUpload, totalPhotos, activeLayout, onChangeLayout }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-obsidian-950/85 border-b border-gold-antique/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand / Emblem */}
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer flex items-center justify-center">
            <div className="w-11 h-11 rounded-lg border border-gold-antique/60 bg-gradient-to-br from-gold-antique/20 via-obsidian-900 to-obsidian-950 flex items-center justify-center shadow-gold-subtle group-hover:border-gold-pale transition-all">
              <span className="font-devanagari font-bold text-2xl text-gold-pale select-none group-hover:scale-110 transition-transform">
                अ
              </span>
            </div>
            <div className="absolute -inset-1 rounded-lg bg-gold-antique/10 blur-sm group-hover:bg-gold-antique/20 -z-10 transition-all"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-devanagari text-lg text-gold-pale font-bold tracking-wide">
                अनुगाथा
              </span>
              <span className="text-gold-antique/40">•</span>
              <span className="font-cinzel text-xs tracking-[0.25em] text-parchment-dim uppercase">
                Event Gallery
              </span>
            </div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-gold-antique/70 font-cinzel">
              Photographic Chronicles
            </p>
          </div>
        </div>

        {/* View Layout Switcher */}
        <div className="hidden sm:flex items-center gap-2 border border-gold-antique/25 rounded-full p-1 bg-obsidian-900/80">
          <button
            onClick={() => onChangeLayout('mosaic')}
            className={`px-3.5 py-1 rounded-full text-xs font-cinzel tracking-wider uppercase transition-all ${
              activeLayout === 'mosaic'
                ? 'bg-gold-antique text-obsidian-950 font-bold shadow-sm'
                : 'text-parchment-dim hover:text-parchment-light'
            }`}
          >
            Spatial Mosaic
          </button>
          <button
            onClick={() => onChangeLayout('arches')}
            className={`px-3.5 py-1 rounded-full text-xs font-cinzel tracking-wider uppercase transition-all ${
              activeLayout === 'arches'
                ? 'bg-gold-antique text-obsidian-950 font-bold shadow-sm'
                : 'text-parchment-dim hover:text-parchment-light'
            }`}
          >
            Arched Editorial
          </button>
        </div>

        {/* Upload Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenUpload}
            className="group px-4 py-2 rounded-full border border-gold-antique/50 bg-gradient-to-r from-gold-antique/20 via-obsidian-900 to-gold-antique/15 text-gold-pale font-cinzel text-xs tracking-[0.18em] uppercase flex items-center gap-2 hover:border-gold-pale hover:shadow-gold-subtle transition-all duration-300"
          >
            <PlusCircle className="w-4 h-4 text-gold-antique group-hover:rotate-90 transition-transform" />
            <span>Add Event Photo</span>
          </button>
        </div>

      </div>
    </header>
  );
}
