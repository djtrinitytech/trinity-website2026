import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Hover pop-outs only make sense with a real pointer, and never under reduced motion
function canPopOut() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function CategoryCard({ category }) {
  const videoRef = useRef(null);
  const [popOut] = useState(() => Boolean(category.video) && canPopOut());
  const [open, setOpen] = useState(false);

  // play while open; rewind once the panel has finished collapsing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (open) {
      video.play().catch(() => {});
      return;
    }
    const timer = setTimeout(() => {
      video.pause();
      video.currentTime = 0;
    }, 450);
    return () => clearTimeout(timer);
  }, [open]);

  const show = () => popOut && setOpen(true);
  const hide = () => setOpen(false);

  return (
    <div className="relative h-full" onMouseEnter={show} onMouseLeave={hide}>
      <Link
        to={`/events/${category.slug}`}
        onFocus={show}
        onBlur={hide}
        className="group relative flex h-full flex-col overflow-hidden border border-border bg-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_40px_-10px_rgba(217,169,91,0.5)]"
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={category.image}
            alt={`${category.name} events emblem`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>
        <div className="flex flex-1 flex-col items-center px-6 pb-8 text-center">
          <p className="font-devanagari text-3xl text-primary" lang="hi">
            {category.sanskrit}
          </p>
          <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">{category.name}</h2>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{category.tagline}</p>
          <p className="mt-4 text-pretty font-serif text-sm leading-relaxed text-muted-foreground">{category.description}</p>
          <span className="mt-6 border-b border-primary/60 pb-0.5 font-serif text-sm font-semibold text-primary">
            Enter the order <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>

      {/* Video pop-out: rises out of the card, slightly larger than it, and plays while hovered.
          Sits outside the card's overflow clip; pointer-events-none keeps hover/click on the card. */}
      {popOut && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 top-1/2 z-30 aspect-[9/16] h-[112%] max-h-[92vh] origin-center overflow-hidden border border-primary/70 bg-card transition-[opacity,translate,scale,box-shadow] duration-[450ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            open
              ? "-translate-x-1/2 -translate-y-1/2 scale-100 opacity-100 shadow-[0_30px_80px_rgba(0,0,0,0.75),0_0_60px_-10px_rgba(217,169,91,0.55)]"
              : "-translate-x-1/2 -translate-y-[46%] scale-[0.86] opacity-0 shadow-none"
          }`}
        >
          <video
            ref={videoRef}
            src={category.video}
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
