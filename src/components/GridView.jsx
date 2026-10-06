import React from 'react';
import { SPHERE_PHOTOS } from '../data/spherePhotos';
import { Calendar, MapPin, Maximize2, Tag } from 'lucide-react';

export default function GridView({ selectedCategory, onSelectCategory, onSelectPhoto }) {
  const categories = ['All', 'Concerts', 'Cultural', 'Esports', 'Sports', 'Competitions', 'Teams'];

  const displayedPhotos = SPHERE_PHOTOS.filter(photo => {
    if (selectedCategory === 'All') return true;
    return photo.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="w-full min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto overflow-y-auto">
      
      {/* Category Pills & Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-[0.2em] text-parchment-light uppercase">
            Event Gallery Chronicles
          </h2>
          <p className="font-serif text-xs text-parchment-dim mt-0.5">
            Showing {displayedPhotos.length} high-definition photographs from annual college festivals
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-cinzel tracking-wider uppercase transition-all flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-gold-antique text-obsidian-950 font-bold shadow-gold-subtle scale-105'
                  : 'bg-obsidian-900/80 text-parchment-dim border border-white/10 hover:border-gold-antique/40 hover:text-parchment-light'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clean, High-Definition Photo Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => onSelectPhoto(photo)}
            className="group cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-obsidian-900 to-obsidian-950 hover:border-gold-antique/60 hover:-translate-y-1.5 hover:shadow-gold-subtle transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image Frame */}
            <div className="relative aspect-[16/10] overflow-hidden bg-black">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-100"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-black/30 pointer-events-none" />

              {/* Category pill */}
              <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-cinzel font-semibold tracking-wider uppercase bg-obsidian-950/85 backdrop-blur-md border border-gold-antique/40 text-gold-pale shadow-sm">
                {photo.category}
              </div>

              {/* Date chip */}
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-cinzel tracking-widest uppercase bg-obsidian-950/85 backdrop-blur-md border border-white/10 text-parchment-dim flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5 text-gold-antique" />
                <span>{photo.date}</span>
              </div>

              {/* Hover overlay inspect badge */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="px-4 py-2 rounded-full border border-gold-pale bg-obsidian-950/90 text-gold-pale text-xs font-cinzel tracking-widest flex items-center gap-2 shadow-gold-subtle">
                  <Maximize2 className="w-3.5 h-3.5 text-gold-antique" />
                  <span>Enlarge Photograph</span>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-cinzel text-base font-bold text-parchment-light group-hover:text-gold-pale transition-colors leading-snug mb-1">
                  {photo.title}
                </h3>

                <p className="font-serif text-xs text-gold-warm italic mb-2">
                  {photo.event}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-parchment-dim mb-2 font-serif">
                  <MapPin className="w-3 h-3 text-gold-antique/70 flex-shrink-0" />
                  <span className="truncate">{photo.venue}</span>
                </div>

                <p className="font-serif text-xs leading-relaxed text-parchment-dim/90 line-clamp-2">
                  {photo.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-cinzel text-gold-antique">
                <span className="tracking-widest uppercase text-parchment-dim">
                  Click to Expand
                </span>
                <span className="tracking-widest uppercase font-bold text-gold-pale">
                  View →
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
