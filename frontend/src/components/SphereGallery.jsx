import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SPHERE_PHOTOS } from '../data/spherePhotos';
import { RotateCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, LayoutGrid, Eye } from 'lucide-react';

export default function SphereGallery({ onSelectPhoto, selectedCategory, onSelectCategory, onSwitchToGrid }) {
  // 3D Sphere Transform State
  const [rotation, setRotation] = useState({ x: -1, y: 0 });
  const [zoom, setZoom] = useState(1150);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const containerRef = useRef(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0.1 });
  const animationFrameId = useRef(null);

  const categories = ['All', 'Concerts', 'Cultural', 'Esports', 'Sports', 'Competitions', 'Teams'];

  const displayedPhotos = SPHERE_PHOTOS.filter(photo => {
    if (selectedCategory === 'All') return true;
    return photo.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Balanced 3-tier elevation angles so cards face forward and are large & legible:
  // Row 1: +18deg (top tier)
  // Row 2: 0deg (eye-level middle tier, flat & clear!)
  // Row 3: -18deg (bottom tier)
  const rows = [18, 0, -18];
  const colsPerRow = 8;
  const colStep = 360 / colsPerRow; // 45 degrees

  // Continuous animation loop for inertia and auto-drift
  useEffect(() => {
    const animate = () => {
      if (!isDragging) {
        setRotation(prev => {
          let nextY = prev.y;
          let nextX = prev.x;

          if (autoRotate) {
            nextY = (nextY + velocity.current.y) % 360;
          }

          // Damping
          velocity.current.x *= 0.94;
          if (!autoRotate) velocity.current.y *= 0.94;

          nextX = Math.max(-20, Math.min(20, nextX + velocity.current.x));
          return { x: nextX, y: nextY };
        });
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isDragging, autoRotate]);

  // Pointer event handlers (Mouse & Touch)
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;

    lastMousePos.current = { x: clientX, y: clientY };

    const rotSpeed = 0.22;
    velocity.current = {
      x: -deltaY * rotSpeed * 0.3,
      y: deltaX * rotSpeed * 0.7
    };

    setRotation(prev => ({
      x: Math.max(-20, Math.min(20, prev.x - deltaY * rotSpeed * 0.3)),
      y: (prev.y + deltaX * rotSpeed * 0.7) % 360
    }));
  }, [isDragging]);

  const handlePointerUp = () => {
    setIsDragging(false);
    setTimeout(() => {
      velocity.current.y = 0.08;
      setAutoRotate(true);
    }, 2500);
  };

  // Step Left / Right Buttons for effortless one-click navigation
  const stepRotate = (direction) => {
    setAutoRotate(false);
    setRotation(prev => ({
      ...prev,
      y: prev.y + (direction === 'left' ? colStep : -colStep)
    }));
    setTimeout(() => setAutoRotate(true), 3000);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      className="relative w-screen h-screen overflow-hidden bg-[#050608] select-none cursor-grab active:cursor-grabbing flex items-center justify-center pt-16"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.08) 0%, rgba(5, 6, 8, 0.98) 75%),
          radial-gradient(ellipse 100% 60% at 50% 10%, rgba(34, 197, 94, 0.05) 0%, transparent 60%)
        `
      }}
    >
      
      {/* Category Filter Pills (floating under nav) */}
      <div className="absolute top-24 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-950/85 backdrop-blur-md border border-gold-antique/25 shadow-2xl overflow-x-auto max-w-[92vw]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={(e) => {
              e.stopPropagation();
              onSelectCategory(cat);
            }}
            className={`px-3.5 py-1 rounded-full text-xs font-cinzel tracking-wider uppercase transition-all duration-300 ${
              selectedCategory === cat
                ? 'bg-gold-antique text-obsidian-950 font-bold shadow-gold-subtle scale-105'
                : 'text-parchment-dim hover:text-gold-pale hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Left / Right Quick Click Step Arrows for easy browsing */}
      <button
        onClick={(e) => { e.stopPropagation(); stepRotate('left'); }}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-gold-antique/40 bg-obsidian-950/80 text-gold-pale hover:bg-gold-antique hover:text-obsidian-950 transition-all shadow-xl hover:scale-110"
        title="Previous Photos (Rotate Left)"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); stepRotate('right'); }}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-gold-antique/40 bg-obsidian-950/80 text-gold-pale hover:bg-gold-antique hover:text-obsidian-950 transition-all shadow-xl hover:scale-110"
        title="Next Photos (Rotate Right)"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Switch to Grid View Callout Button at Bottom for users who prefer standard view */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onSwitchToGrid(); }}
          className="px-4 py-2 rounded-full border border-gold-antique/60 bg-gradient-to-r from-gold-antique/20 via-obsidian-950 to-gold-antique/10 text-gold-pale text-xs font-cinzel tracking-widest uppercase flex items-center gap-2 shadow-gold-subtle hover:border-gold-pale hover:scale-105 transition-all"
        >
          <LayoutGrid className="w-4 h-4 text-gold-antique" />
          <span>Switch to Easy Grid View</span>
        </button>
      </div>

      {/* Zoom and Reset Controls */}
      <div className="absolute right-6 bottom-6 z-30 flex flex-col gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.min(1450, prev + 80)); }}
          className="p-2.5 rounded-full border border-gold-antique/30 bg-obsidian-950/80 text-parchment-dim hover:text-gold-pale hover:border-gold-pale transition-all shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.max(850, prev - 80)); }}
          className="p-2.5 rounded-full border border-gold-antique/30 bg-obsidian-950/80 text-parchment-dim hover:text-gold-pale hover:border-gold-pale transition-all shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setRotation({ x: -1, y: 0 });
            setZoom(1150);
            setAutoRotate(true);
          }}
          className="p-2.5 rounded-full border border-gold-antique/30 bg-obsidian-950/80 text-parchment-dim hover:text-gold-pale hover:border-gold-pale transition-all shadow-lg"
          title="Reset Orbit"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* 3D SCENE PERSPECTIVE WRAPPER */}
      <div
        className="relative w-full h-full flex items-center justify-center pointer-events-none"
        style={{
          perspective: `${zoom}px`,
          perspectiveOrigin: '50% 50%'
        }}
      >
        {/* SPHERE WORLD */}
        <div
          className="relative preserve-3d transition-transform duration-75 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            width: '0px',
            height: '0px'
          }}
        >
          {rows.map((rowAngle, rowIndex) => {
            return Array.from({ length: colsPerRow }).map((_, colIndex) => {
              const photoIndex = (rowIndex * colsPerRow + colIndex) % displayedPhotos.length;
              const photo = displayedPhotos[photoIndex] || SPHERE_PHOTOS[photoIndex % SPHERE_PHOTOS.length];
              const colAngle = colIndex * colStep;

              // Generous sphere radius: cards in view are large and front-facing
              const sphereRadius = 960;
              // Card dimensions: 330px wide x 215px high
              const cardW = 330;
              const cardH = 215;

              return (
                <div
                  key={`${rowIndex}-${colIndex}-${photo.id}`}
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: `${cardW}px`,
                    height: `${cardH}px`,
                    marginLeft: `-${cardW / 2}px`,
                    marginTop: `-${cardH / 2}px`,
                    transformStyle: 'preserve-3d',
                    transform: `
                      rotateY(${colAngle}deg)
                      rotateX(${rowAngle}deg)
                      translateZ(${sphereRadius}px)
                    `,
                    backfaceVisibility: 'hidden'
                  }}
                  className="pointer-events-auto"
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPhoto(photo);
                    }}
                    onMouseEnter={() => setAutoRotate(false)}
                    onMouseLeave={() => setAutoRotate(true)}
                    className="group relative w-full h-full rounded-2xl overflow-hidden border border-white/15 bg-obsidian-900 cursor-pointer shadow-2xl transition-all duration-300 hover:scale-110 hover:border-gold-pale hover:shadow-gold-intense hover:z-50"
                  >
                    {/* Event Photo */}
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center filter brightness-95 group-hover:brightness-105 transition-all duration-500"
                    />

                    {/* Subtle vignette gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-black/30 opacity-75 group-hover:opacity-40 transition-opacity" />

                    {/* Category pill */}
                    <div className="absolute top-2.5 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-cinzel font-semibold tracking-wider uppercase bg-obsidian-950/85 backdrop-blur-sm border border-gold-antique/40 text-gold-pale shadow-sm">
                      {photo.category}
                    </div>

                    {/* Date pill */}
                    <div className="absolute top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-cinzel tracking-wider uppercase bg-obsidian-950/85 backdrop-blur-sm border border-white/10 text-parchment-dim">
                      {photo.date}
                    </div>

                    {/* Inspect Icon on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="p-2.5 rounded-full bg-obsidian-950/90 border border-gold-pale text-gold-pale shadow-gold-subtle transform scale-90 group-hover:scale-100 transition-transform">
                        <Eye className="w-5 h-5 text-gold-antique" />
                      </div>
                    </div>

                    {/* Caption at Bottom */}
                    <div className="absolute inset-x-0 bottom-0 p-3 pt-5 bg-gradient-to-t from-obsidian-950 via-obsidian-950/80 to-transparent">
                      <h4 className="font-cinzel text-xs font-bold text-parchment-light truncate group-hover:text-gold-pale transition-colors">
                        {photo.title}
                      </h4>
                      <p className="font-serif text-[11px] text-parchment-dim truncate mt-0.5">
                        {photo.event} • {photo.venue}
                      </p>
                    </div>

                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>

    </div>
  );
}
