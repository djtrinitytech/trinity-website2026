import React, { useEffect } from 'react';
import { X, Download, ArrowUpRight } from 'lucide-react';
import { displayImageUrl, originalImageUrl } from '../data/imageUrls';

export default function PhotoLightboxModal({ photo, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 backdrop-blur-2xl bg-black/90 animate-in fade-in duration-300">
      
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-[#0c0d12] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full border border-white/20 bg-black/70 text-white/80 hover:text-white hover:border-white transition-all shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: High-Definition Full Image */}
        <div className="md:w-3/5 bg-black flex items-center justify-center p-4 sm:p-6 border-b md:border-b-0 md:border-r border-white/10">
          <div className="relative max-h-[75vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img
              src={displayImageUrl(photo)}
              alt={photo.title}
              className="max-h-[72vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>

        {/* Right: Curatorial Memoir & Details */}
        <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between max-h-[75vh] overflow-y-auto">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-widest uppercase bg-white/10 border border-white/15 text-white inline-block mb-3">
              {photo.category}
            </span>

            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white leading-snug mb-3">
              {photo.title}
            </h2>

            <p className="font-serif text-sm leading-relaxed text-parchment-dim mb-6">
              {photo.description}
            </p>
          </div>

          {/* Action links */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <a
              href={originalImageUrl(photo)}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-gold-pale hover:underline"
            >
              <Download className="w-4 h-4" />
              <span>Full Resolution</span>
            </a>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-white/20 bg-white/10 text-white font-mono text-xs tracking-wider uppercase hover:bg-white hover:text-black transition-all"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
