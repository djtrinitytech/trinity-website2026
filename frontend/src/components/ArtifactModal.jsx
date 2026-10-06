import React, { useEffect } from 'react';
import { X, Calendar, MapPin, Camera, Tag, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { displayImageUrl, originalImageUrl } from '../data/imageUrls';

export default function ArtifactModal({
  photo,
  onClose,
  onNext,
  onPrev,
  hasMultiple = false
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-2xl bg-obsidian-950/90 animate-in fade-in duration-300">
      
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Main Lightbox Frame */}
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-obsidian-900 via-obsidian-950 to-black border border-gold-antique/40 rounded-3xl overflow-hidden shadow-2xl my-auto">
        
        {/* Top Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <a
            href={originalImageUrl(photo)}
            target="_blank"
            rel="noreferrer"
            download
            className="p-2 rounded-full border border-gold-antique/30 bg-obsidian-950/80 text-parchment-dim hover:text-gold-pale hover:border-gold-pale transition-all"
            title="Open high-res original"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-gold-antique/30 bg-obsidian-950/80 text-parchment-dim hover:text-gold-pale hover:border-gold-pale transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
          
          {/* Left: Event Photograph Display (7 cols) */}
          <div className="lg:col-span-7 relative bg-black flex items-center justify-center p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-xl border border-gold-antique/20 shadow-2xl">
              <img
                src={displayImageUrl(photo)}
                alt={photo.eventName}
                className="max-h-[72vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Nav Arrows */}
            {hasMultiple && (
              <>
                <button
                  onClick={onPrev}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full border border-gold-antique/40 bg-obsidian-950/80 text-gold-pale hover:bg-gold-antique hover:text-obsidian-950 transition-all shadow-lg"
                  title="Previous photograph (Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={onNext}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full border border-gold-antique/40 bg-obsidian-950/80 text-gold-pale hover:bg-gold-antique hover:text-obsidian-950 transition-all shadow-lg"
                  title="Next photograph (Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Right: Curatorial Event Dossier (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div>
              {/* Event Category Tag */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-cinzel font-semibold tracking-wider uppercase bg-gold-antique/15 border border-gold-antique/40 text-gold-pale">
                  {photo.category}
                </span>
                {photo.orderTag && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-cinzel uppercase border border-white/10 text-parchment-dim bg-white/5">
                    Order of {photo.orderTag}
                  </span>
                )}
              </div>

              {/* Devanagari Title */}
              {photo.eventDevanagari && (
                <span className="font-devanagari text-xl font-bold text-gold-pale/90 block mb-1">
                  {photo.eventDevanagari}
                </span>
              )}

              {/* Event Name */}
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-parchment-light leading-snug mb-2">
                {photo.eventName}
              </h2>

              {/* Photo Title / Caption */}
              <h3 className="font-serif text-sm italic text-parchment-dim mb-6">
                "{photo.title}"
              </h3>

              {/* Date & Venue Box */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-xl border border-white/10 bg-obsidian-950/70">
                  <div className="flex items-center gap-1.5 text-[11px] font-cinzel text-gold-antique uppercase tracking-wider mb-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>Event Date</span>
                  </div>
                  <span className="font-serif text-xs text-parchment-light font-medium">
                    {photo.date}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-obsidian-950/70">
                  <div className="flex items-center gap-1.5 text-[11px] font-cinzel text-gold-antique uppercase tracking-wider mb-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>Venue</span>
                  </div>
                  <span className="font-serif text-xs text-parchment-light font-medium truncate block">
                    {photo.venue}
                  </span>
                </div>
              </div>

              {/* Narrative Story */}
              <div className="mb-6">
                <h4 className="text-xs font-cinzel tracking-[0.2em] uppercase text-gold-pale mb-2">
                  Event Chronicle
                </h4>
                <p className="font-serif text-sm leading-relaxed text-parchment-light/90">
                  {photo.description}
                </p>
              </div>

              {/* Photographer Credit */}
              <div className="p-3 rounded-xl border border-gold-antique/20 bg-gold-antique/5 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-gold-antique/40 bg-gold-antique/10 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-4 h-4 text-gold-antique" />
                </div>
                <div>
                  <div className="text-[10px] font-cinzel uppercase tracking-wider text-gold-pale">
                    Photographer & Media Guild
                  </div>
                  <div className="font-serif text-xs text-parchment-light font-medium">
                    {photo.photographer}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {photo.tags && photo.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3 h-3 text-gold-antique/70 mr-1" />
                  {photo.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full border border-white/10 bg-obsidian-950 text-xs font-mono text-parchment-dim"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-cinzel tracking-widest uppercase text-parchment-dim">
                Catalogue ID: {photo.id}
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full border border-gold-antique/40 bg-gold-antique/10 text-gold-pale font-cinzel text-xs tracking-wider uppercase hover:border-gold-pale hover:bg-gold-antique/20 transition-all"
              >
                Close Frame
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
