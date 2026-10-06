import React, { useEffect } from 'react';
import { X, Calendar, MapPin, Download, Tag } from 'lucide-react';
import { displayImageUrl, originalImageUrl } from '../data/imageUrls';

export default function PhotoLightbox({ photo, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 backdrop-blur-2xl bg-black/85 animate-in fade-in duration-300">
      
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-gradient-to-b from-obsidian-900 to-obsidian-950 border border-gold-antique/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full border border-gold-antique/30 bg-obsidian-950/80 text-parchment-dim hover:text-gold-pale hover:border-gold-pale transition-all shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: High-Res Photo */}
        <div className="md:w-3/5 bg-black flex items-center justify-center p-4 sm:p-6 border-b md:border-b-0 md:border-r border-white/10">
          <div className="relative max-h-[70vh] overflow-hidden rounded-2xl border border-gold-antique/20 shadow-2xl">
            <img
              src={displayImageUrl(photo)}
              alt={photo.title}
              className="max-h-[68vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>

        {/* Right: Event Information */}
        <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between max-h-[75vh] overflow-y-auto">
          <div>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-cinzel font-semibold tracking-wider uppercase bg-gold-antique/15 border border-gold-antique/40 text-gold-pale inline-block mb-3">
              {photo.category}
            </span>

            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-parchment-light leading-snug mb-1">
              {photo.title}
            </h2>

            <p className="font-serif text-sm italic text-gold-warm mb-6">
              {photo.event}
            </p>

            {/* Date & Venue */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs font-serif text-parchment-dim">
                <Calendar className="w-3.5 h-3.5 text-gold-antique" />
                <span>{photo.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-serif text-parchment-dim">
                <MapPin className="w-3.5 h-3.5 text-gold-antique" />
                <span>{photo.venue}</span>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-white/10 pt-4 mb-4">
              <h4 className="text-[11px] font-cinzel tracking-widest uppercase text-gold-pale mb-1.5">
                Event Memoir
              </h4>
              <p className="font-serif text-xs leading-relaxed text-parchment-dim">
                {photo.description}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <a
              href={originalImageUrl(photo)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-cinzel tracking-wider uppercase text-gold-pale hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full Resolution</span>
            </a>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full border border-gold-antique/40 bg-gold-antique/10 text-gold-pale font-cinzel text-xs tracking-wider uppercase hover:border-gold-pale transition-all"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
