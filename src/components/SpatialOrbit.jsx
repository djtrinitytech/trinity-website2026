import React, { useState } from 'react';
import { ORDERS, getOrderById } from '../data/ordersConfig';
import { Compass, Sparkles, Eye, ArrowUpRight } from 'lucide-react';

export default function SpatialOrbit({ artifacts, onSelectArtifact }) {
  const [activeOrderNode, setActiveOrderNode] = useState(ORDERS[0].id);

  // Filter artifacts belonging to the selected spatial node, or general showcase
  const activeOrder = getOrderById(activeOrderNode);
  const activeArtifacts = artifacts.filter(a => a.orderId.toLowerCase() === activeOrderNode.toLowerCase());

  // Celestial angles for 6 orders around the circle (60 deg increments)
  // 0: Aakar (Top, 270 deg)
  // 1: Pragya (Top-Right, 330 deg)
  // 2: Utkarsh (Bottom-Right, 30 deg)
  // 3: Aarohan (Bottom, 90 deg)
  // 4: Kshatra (Bottom-Left, 150 deg)
  // 5: Sindhu (Top-Left, 210 deg)
  const nodePositions = [
    { id: 'aakar', angle: -90, radius: 210 },     // Top
    { id: 'pragya', angle: -30, radius: 220 },    // Top-right
    { id: 'utkarsh', angle: 30, radius: 210 },    // Bottom-right
    { id: 'aarohan', angle: 90, radius: 220 },    // Bottom
    { id: 'kshatra', angle: 150, radius: 210 },   // Bottom-left
    { id: 'sindhu', angle: 210, radius: 220 },    // Top-left
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      
      {/* Visual Instruction Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-antique/30 bg-obsidian-900/60 mb-2">
          <Compass className="w-3.5 h-3.5 text-gold-antique animate-spin-slow" />
          <span className="text-[11px] font-cinzel tracking-[0.25em] text-gold-pale uppercase">
            Option 2 • Spatial Reliquary
          </span>
        </div>
        <p className="font-serif text-xs text-parchment-dim max-w-lg mx-auto">
          Navigate the celestial orbit of civilization. Click any orbital pillar node to invoke its relics from the archives.
        </p>
      </div>

      {/* Main Cosmic Orbit Stage */}
      <div className="relative w-full max-w-4xl mx-auto aspect-square sm:h-[620px] rounded-3xl border border-gold-antique/20 bg-gradient-to-b from-obsidian-900/90 via-obsidian-950 to-[#050608] flex items-center justify-center overflow-hidden shadow-2xl">
        
        {/* Subtle Constellation Lines & Coordinate Markings (matching mockup 20.5090°) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between p-6 text-[10px] font-mono text-gold-antique">
          <div className="flex justify-between">
            <span>20.5090° N // MERIDIAN SANCTUM</span>
            <span>EPOCH. VEDIC-01</span>
          </div>
          <div className="flex justify-between">
            <span>78.9629° E // STELLAR POLARIS</span>
            <span>SIX ORDERS • ONE CIVILIZATION</span>
          </div>
        </div>

        {/* Concentric Celestial Orbit Rings */}
        <div className="absolute w-[520px] h-[520px] rounded-full border border-gold-antique/10 animate-spin-slow pointer-events-none"></div>
        <div className="absolute w-[440px] h-[440px] rounded-full border border-dashed border-gold-antique/20 pointer-events-none"></div>
        <div className="absolute w-[360px] h-[360px] rounded-full border border-gold-antique/15 animate-reverse-spin-slow pointer-events-none"></div>
        <div className="absolute w-[260px] h-[260px] rounded-full border border-gold-antique/25 pointer-events-none"></div>

        {/* Diagonal Astrolabe Crosshairs */}
        <div className="absolute w-[500px] h-[1px] bg-gradient-to-r from-transparent via-gold-antique/15 to-transparent pointer-events-none"></div>
        <div className="absolute h-[500px] w-[1px] bg-gradient-to-b from-transparent via-gold-antique/15 to-transparent pointer-events-none"></div>
        <div className="absolute w-[460px] h-[1px] rotate-45 bg-gradient-to-r from-transparent via-gold-antique/10 to-transparent pointer-events-none"></div>
        <div className="absolute w-[460px] h-[1px] -rotate-45 bg-gradient-to-r from-transparent via-gold-antique/10 to-transparent pointer-events-none"></div>

        {/* Central Hub: ANUGATHA Monolith Seal */}
        <div className="relative z-10 w-44 h-44 rounded-full border-2 border-gold-antique/60 bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-black p-4 flex flex-col items-center justify-center text-center shadow-gold-subtle transition-all duration-500 hover:scale-105">
          <div className="w-10 h-10 rounded-full border border-gold-antique/40 bg-gold-antique/10 flex items-center justify-center mb-1">
            <span className="font-devanagari text-xl font-bold text-gold-pale">अ</span>
          </div>
          <span className="font-devanagari text-xl font-bold gold-shimmer tracking-wider">
            अनुगाथा
          </span>
          <span className="font-cinzel text-[8px] tracking-[0.25em] text-gold-pale uppercase font-semibold mt-1">
            Anugatha
          </span>
          <span className="font-cinzel text-[7px] tracking-[0.2em] text-parchment-dim uppercase mt-0.5 max-w-[120px]">
            Civilizational Core
          </span>
        </div>

        {/* The 6 Orbital Nodes positioned in celestial orbit */}
        {nodePositions.map((pos) => {
          const order = getOrderById(pos.id);
          if (!order) return null;

          const isSelected = activeOrderNode === order.id;
          
          // Calculate x, y based on angle and radius
          const rad = (pos.angle * Math.PI) / 180;
          const x = Math.cos(rad) * pos.radius;
          const y = Math.sin(rad) * pos.radius;

          return (
            <div
              key={order.id}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              className="absolute z-20 flex flex-col items-center"
            >
              <button
                onClick={() => setActiveOrderNode(order.id)}
                className={`group relative flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 ${
                  isSelected
                    ? 'border-gold-pale bg-obsidian-900 scale-110 shadow-gold-intense z-30'
                    : 'border-white/10 bg-obsidian-950/80 hover:border-gold-antique/50 hover:scale-105'
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 25px ${order.glowColor}` : undefined
                }}
              >
                {/* Node Relic Icon / Arched Thumbnail */}
                <div 
                  className="w-12 h-14 rounded-t-full border flex items-center justify-center overflow-hidden mb-1.5 transition-transform"
                  style={{
                    backgroundColor: `${order.color}20`,
                    borderColor: isSelected ? order.color : 'rgba(212, 175, 55, 0.4)'
                  }}
                >
                  <img
                    src={order.representativeImage}
                    alt={order.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                {/* Node Title */}
                <span className="font-devanagari text-[10px] text-gold-pale/90 leading-none">
                  {order.sanskritName}
                </span>
                <span className="font-cinzel text-[9px] font-bold tracking-wider uppercase text-parchment-light">
                  {order.name}
                </span>

                {/* Status indicator */}
                {isSelected && (
                  <span 
                    className="w-1.5 h-1.5 rounded-full mt-1 animate-pulse"
                    style={{ backgroundColor: order.color }}
                  />
                )}
              </button>
            </div>
          );
        })}

      </div>

      {/* Selected Order Relic Showcase underneath */}
      {activeOrder && (
        <div className="mt-12 bg-gradient-to-b from-obsidian-900 to-obsidian-950 border border-gold-antique/30 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-devanagari text-xl text-gold-pale font-bold">
                  {activeOrder.sanskritName}
                </span>
                <span className="text-gold-antique">•</span>
                <span className="font-cinzel text-lg tracking-[0.2em] uppercase font-bold text-parchment-light">
                  Order of {activeOrder.name}
                </span>
              </div>
              <p className="font-serif text-sm text-parchment-dim">
                {activeOrder.subtitle} — {activeOrder.description}
              </p>
            </div>

            <div 
              className="px-4 py-1.5 rounded-full text-xs font-cinzel tracking-wider uppercase border"
              style={{
                backgroundColor: `${activeOrder.color}20`,
                borderColor: `${activeOrder.color}60`,
                color: '#ffffff'
              }}
            >
              {activeArtifacts.length} {activeArtifacts.length === 1 ? 'Relic Inscribed' : 'Relics Inscribed'}
            </div>
          </div>

          {/* Cards for this selected order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {activeArtifacts.map((artifact) => (
              <div
                key={artifact.id}
                onClick={() => onSelectArtifact(artifact)}
                className="group cursor-pointer bg-obsidian-950 border border-white/10 hover:border-gold-antique/50 rounded-xl p-4 flex gap-4 items-center transition-all hover:shadow-gold-subtle"
              >
                <div className="w-16 h-20 rounded-lg arch-top overflow-hidden border border-gold-antique/30 flex-shrink-0">
                  <img
                    src={artifact.imageUrl}
                    alt={artifact.titleEnglish}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-devanagari text-xs text-gold-pale/80 block truncate">
                    {artifact.titleDevanagari}
                  </span>
                  <h4 className="font-cinzel text-xs font-bold text-parchment-light truncate group-hover:text-gold-pale transition-colors">
                    {artifact.titleEnglish}
                  </h4>
                  <span className="font-cinzel text-[10px] tracking-wider text-parchment-dim block mt-0.5">
                    {artifact.era}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gold-antique/80 mt-1">
                    <Eye className="w-3 h-3" />
                    <span>View Dossier</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
