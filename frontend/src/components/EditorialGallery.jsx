import React from 'react';
import { Calendar, MapPin, Camera, Maximize2, Sparkles, Tag } from 'lucide-react';
import { thumbnailImageUrl } from '../data/imageUrls';

export default function EditorialGallery({ photos, onSelectPhoto, activeLayout }) {
  if (photos.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full border border-gold-antique/30 flex items-center justify-center bg-obsidian-900">
          <Camera className="w-6 h-6 text-gold-antique animate-pulse" />
        </div>
        <h3 className="font-cinzel text-lg text-gold-pale uppercase tracking-widest mb-1">
          No Event Photographs Found
        </h3>
        <p className="font-serif text-parchment-dim text-xs">
          No photos match your current filter or query. Select another category or add a new event photo.
        </p>
      </div>
    );
  }

  // Layout 1: Spatial Mosaic Layout (Inspired by Option 2 Spatial Grid)
  if (activeLayout === 'mosaic') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, index) => {
            // Give some items wider span or unique aspect ratio for an organic mosaic feel
            const isWide = index % 5 === 0 && photos.length > 3;

            return (
              <div
                key={photo.id}
                onClick={() => onSelectPhoto(photo)}
                className={`group cursor-pointer relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-obsidian-900 to-obsidian-950 flex flex-col justify-between transition-all duration-500 hover:border-gold-antique/60 hover:-translate-y-1 hover:shadow-gold-subtle ${
                  isWide ? 'sm:col-span-2' : ''
                }`}
              >
                {/* Event Photo Container */}
                <div className={`relative w-full overflow-hidden bg-black ${isWide ? 'aspect-[21/9]' : 'aspect-[16/10]'}`}>
                  <img
                    src={thumbnailImageUrl(photo)}
                    alt={photo.title || photo.eventName}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-90 group-hover:brightness-100"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop';
                    }}
                  />

                  {/* Dark gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-black/40 pointer-events-none" />

                  {/* Top Badges: Category & Date */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-cinzel font-semibold tracking-wider uppercase bg-obsidian-950/85 backdrop-blur-md border border-gold-antique/40 text-gold-pale shadow-sm">
                      {photo.category}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-cinzel tracking-widest uppercase bg-obsidian-950/85 backdrop-blur-md border border-white/10 text-parchment-dim flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-gold-antique" />
                      <span>{photo.date}</span>
                    </span>
                  </div>

                  {/* Hover Inspect Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="px-4 py-2 rounded-full border border-gold-pale bg-obsidian-950/85 backdrop-blur-sm text-gold-pale text-xs font-cinzel tracking-widest flex items-center gap-2 shadow-gold-subtle">
                      <Maximize2 className="w-3.5 h-3.5 text-gold-antique" />
                      <span>View Photograph</span>
                    </div>
                  </div>
                </div>

                {/* Event Info Card */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {photo.eventDevanagari && (
                      <span className="font-devanagari text-xs text-gold-pale/80 block mb-1">
                        {photo.eventDevanagari}
                      </span>
                    )}

                    <h3 className="font-cinzel text-base font-bold text-parchment-light group-hover:text-gold-pale transition-colors leading-snug mb-1">
                      {photo.eventName}
                    </h3>

                    <h4 className="font-serif text-xs text-parchment-dim mb-3 italic">
                      "{photo.title}"
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-parchment-dim/80 mb-3">
                      <MapPin className="w-3 h-3 text-gold-antique/70 flex-shrink-0" />
                      <span className="truncate">{photo.venue}</span>
                    </div>

                    <p className="font-serif text-xs leading-relaxed text-parchment-dim/90 line-clamp-2">
                      {photo.description}
                    </p>
                  </div>

                  {/* Photographer & Order Tag footer */}
                  <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="font-serif text-parchment-dim text-[11px] flex items-center gap-1">
                      <Camera className="w-3 h-3 text-gold-antique/60" />
                      <span className="truncate max-w-[150px]">{photo.photographer}</span>
                    </span>

                    {photo.orderTag && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-cinzel uppercase border border-gold-antique/20 text-gold-antique bg-gold-antique/5">
                        Order of {photo.orderTag}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Layout 2: Arched Editorial Layout (Inspired by Option 1 Arches)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {photos.map((photo) => (
          <article
            key={photo.id}
            onClick={() => onSelectPhoto(photo)}
            className="group cursor-pointer relative flex flex-col bg-gradient-to-b from-obsidian-900 to-obsidian-950 border border-white/10 rounded-2xl overflow-hidden hover:border-gold-antique/60 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-gold-subtle"
          >
            {/* Arched Window Container for the Image */}
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-obsidian-950 p-3 pb-0">
              <div className="relative w-full h-full arch-top overflow-hidden border border-gold-antique/30 group-hover:border-gold-pale/60 transition-all duration-500">
                <img
                  src={thumbnailImageUrl(photo)}
                  alt={photo.eventName}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out filter brightness-90 group-hover:brightness-100"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-black/30 pointer-events-none" />

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-cinzel tracking-wider uppercase bg-obsidian-950/80 backdrop-blur-md border border-gold-antique/40 text-gold-pale">
                  {photo.category}
                </div>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-cinzel tracking-widest uppercase bg-obsidian-950/80 backdrop-blur-md border border-white/10 text-parchment-dim flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5 text-gold-antique" />
                  <span>{photo.date}</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="px-4 py-2 rounded-full border border-gold-pale bg-obsidian-950/80 backdrop-blur-sm text-gold-pale text-xs font-cinzel tracking-widest flex items-center gap-2 shadow-gold-subtle">
                    <Maximize2 className="w-3.5 h-3.5 text-gold-antique" />
                    <span>Expand Frame</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Placard */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                {photo.eventDevanagari && (
                  <span className="font-devanagari text-xs text-gold-pale/80 block mb-1">
                    {photo.eventDevanagari}
                  </span>
                )}

                <h3 className="font-cinzel text-base font-bold text-parchment-light group-hover:text-gold-pale transition-colors leading-snug mb-1">
                  {photo.eventName}
                </h3>

                <p className="font-serif text-xs text-parchment-dim mb-3 italic">
                  "{photo.title}"
                </p>

                <div className="flex items-center gap-1.5 text-xs text-parchment-dim/80 mb-3">
                  <MapPin className="w-3 h-3 text-gold-antique/70 flex-shrink-0" />
                  <span className="truncate">{photo.venue}</span>
                </div>

                <p className="font-serif text-xs leading-relaxed text-parchment-dim/90 line-clamp-2">
                  {photo.description}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="font-serif text-parchment-dim text-[11px] flex items-center gap-1">
                  <Camera className="w-3 h-3 text-gold-antique/60" />
                  <span className="truncate max-w-[140px]">{photo.photographer}</span>
                </span>
                <span className="font-cinzel text-[10px] tracking-widest text-gold-pale uppercase">
                  View →
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
