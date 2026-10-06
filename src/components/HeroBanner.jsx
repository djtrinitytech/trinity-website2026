import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles, ArrowRight } from 'lucide-react';

export default function HeroBanner({ onSelectFeaturedEvent }) {
  // Live countdown timer matching mockup's "Design Submission Deadline" card
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 12,
    minutes: 36,
    seconds: 21
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format2Digits = (num) => String(num).padStart(2, '0');

  return (
    <section className="relative pt-10 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Background Golden Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold-antique/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        
        {/* Main Title Area */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-antique/30 bg-obsidian-900/60 mb-3 shadow-sm">
            <Sparkles className="w-3 h-3 text-gold-antique animate-pulse" />
            <span className="text-[11px] font-cinzel tracking-[0.25em] text-gold-pale uppercase">
              Six Orders • One Civilization
            </span>
          </div>

          <h1 className="font-devanagari text-5xl sm:text-6xl md:text-7xl font-bold tracking-wider text-parchment-light mb-2">
            <span className="gold-shimmer text-glow">
              अनुगाथा
            </span>
          </h1>

          <p className="font-cinzel text-xs sm:text-sm tracking-[0.3em] text-gold-pale uppercase font-medium mb-1">
            Event Gallery & Living Chronicles
          </p>

          <p className="font-serif text-xs text-parchment-dim max-w-lg mx-auto">
            Witness photographic archives from our workshops, conclaves, design charettes, and grand ceremonies.
          </p>
        </div>

        {/* Highlighted Event Cards (Directly replicating the bottom half of mockup!) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          
          {/* Pinned Card 1: Registrations Open / Featured Event Banner */}
          <div 
            onClick={() => onSelectFeaturedEvent && onSelectFeaturedEvent('event-photo-01')}
            className="lg:col-span-2 group cursor-pointer relative rounded-2xl overflow-hidden border border-gold-antique/40 bg-gradient-to-t from-obsidian-950 via-obsidian-900 to-obsidian-850 p-6 flex flex-col justify-between min-h-[260px] hover:border-gold-pale hover:shadow-gold-subtle transition-all duration-500"
          >
            {/* Background Event Photo with vignette */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop"
                alt="Featured Event"
                className="w-full h-full object-cover filter brightness-[0.35] group-hover:scale-105 group-hover:brightness-[0.45] transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/60 to-transparent" />
            </div>

            {/* Top row: Pinned tag + Date */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-cinzel font-bold tracking-widest uppercase bg-red-950/80 border border-red-500/60 text-red-300">
                PINNED
              </span>
              <span className="text-xs font-cinzel tracking-wider text-gold-pale/90 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gold-antique" />
                <span>12 Sep 2025</span>
              </span>
            </div>

            {/* Middle: Title & Narrative */}
            <div className="my-4">
              <span className="text-xs font-devanagari text-gold-pale/80 block mb-1">
                दृश्य कथा वाचन एवं अभिकल्प संगम
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-parchment-light group-hover:text-gold-pale transition-colors leading-snug">
                Registrations for Anugatha 2025 are now open
              </h3>
              <p className="font-serif text-xs text-parchment-dim mt-2 line-clamp-2 max-w-xl">
                Be a part of the journey. Explore, create, and contribute across the six orders through visual storytelling, architecture, and sacred geometry.
              </p>
            </div>

            {/* Bottom: Know more CTA */}
            <div className="flex items-center gap-2 text-xs font-cinzel tracking-widest uppercase text-gold-pale group-hover:translate-x-1 transition-transform">
              <span>View Workshop Photos</span>
              <ArrowRight className="w-4 h-4 text-gold-antique" />
            </div>
          </div>

          {/* Card 2: Design Submission Deadline + Live Countdown (Matching Mockup Option 2 Card) */}
          <div className="relative rounded-2xl overflow-hidden border border-gold-antique/30 bg-gradient-to-b from-obsidian-900 to-obsidian-950 p-6 flex flex-col justify-between hover:border-gold-antique/60 transition-all">
            
            {/* Top header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel uppercase tracking-wider text-gold-pale/80">
                Next Event Milestone
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-cinzel uppercase border border-gold-antique/30 text-gold-pale bg-gold-antique/10">
                Utkarsh
              </span>
            </div>

            {/* Title */}
            <div className="my-3">
              <h3 className="font-cinzel text-lg font-bold text-parchment-light leading-snug">
                Design Submission Deadline
              </h3>
              <span className="text-xs font-serif text-parchment-dim flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-gold-antique" />
                <span>25 Sep 2025 • 11:59 PM</span>
              </span>
            </div>

            {/* Live Countdown Display (Matching Mockup: 04 DAYS 12 HRS 36 MINS 21 SECS) */}
            <div className="grid grid-cols-4 gap-2 my-2 text-center">
              <div className="p-2 rounded-xl bg-obsidian-950 border border-white/10">
                <div className="font-mono text-xl font-bold text-gold-pale">{format2Digits(timeLeft.days)}</div>
                <div className="text-[9px] font-cinzel tracking-widest text-parchment-dim uppercase mt-0.5">DAYS</div>
              </div>
              <div className="p-2 rounded-xl bg-obsidian-950 border border-white/10">
                <div className="font-mono text-xl font-bold text-gold-pale">{format2Digits(timeLeft.hours)}</div>
                <div className="text-[9px] font-cinzel tracking-widest text-parchment-dim uppercase mt-0.5">HRS</div>
              </div>
              <div className="p-2 rounded-xl bg-obsidian-950 border border-white/10">
                <div className="font-mono text-xl font-bold text-gold-pale">{format2Digits(timeLeft.minutes)}</div>
                <div className="text-[9px] font-cinzel tracking-widest text-parchment-dim uppercase mt-0.5">MINS</div>
              </div>
              <div className="p-2 rounded-xl bg-obsidian-950 border border-white/10">
                <div className="font-mono text-xl font-bold text-gold-antique animate-pulse">{format2Digits(timeLeft.seconds)}</div>
                <div className="text-[9px] font-cinzel tracking-widest text-parchment-dim uppercase mt-0.5">SECS</div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 text-[10px] font-cinzel tracking-widest uppercase text-parchment-dim text-center">
              Jury Review & Public Exhibition
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
