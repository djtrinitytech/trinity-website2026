import React from 'react';
import { Search, Camera, Filter } from 'lucide-react';

const CATEGORIES = [
  'All Events',
  'Workshops',
  'Orientations',
  'Exhibitions',
  'Team Reveals',
  'Field Expeditions'
];

export default function OrderFilter({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount
}) {
  return (
    <div id="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      
      {/* Top Bar: Search & Section Title */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-[0.2em] text-parchment-light uppercase flex items-center gap-3">
            <span>Event Photography</span>
            <span className="text-xs font-mono font-normal text-gold-antique/90 px-2.5 py-0.5 rounded-full border border-gold-antique/30 bg-gold-antique/10">
              {filteredCount} {filteredCount === 1 ? 'Photograph' : 'Photographs'}
            </span>
          </h2>
          <p className="text-xs font-serif text-parchment-dim mt-0.5">
            Documenting the living history, workshops, and milestones of Anugatha
          </p>
        </div>

        {/* Search Input */}
        <div className="relative sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-antique/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by event, venue, photographer..."
            className="w-full pl-10 pr-4 py-2 bg-obsidian-900/90 border border-gold-antique/30 rounded-full text-xs font-serif text-parchment-light placeholder:text-parchment-dim/50 focus:outline-none focus:border-gold-pale focus:ring-1 focus:ring-gold-pale/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-parchment-dim hover:text-parchment-light"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory.toLowerCase() === category.toLowerCase();

          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-cinzel tracking-wider uppercase transition-all duration-300 border ${
                isSelected
                  ? 'bg-gold-antique text-obsidian-950 border-gold-pale font-bold shadow-gold-subtle scale-105'
                  : 'border-white/10 bg-obsidian-900/70 text-parchment-dim hover:border-gold-antique/40 hover:text-parchment-light'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

    </div>
  );
}
