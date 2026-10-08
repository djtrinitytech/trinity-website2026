import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import gsap from "gsap";
import "./GallerySectionDNA.css";

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?w=1200&h=900&q=85&auto=format&fit=crop`;

// Curated 4:3 landscape event, presentation & cultural showcase photographs
export const DNA_ITEMS = [
  {
    id: "01",
    num: "01",
    title: "Project Presentation & Ideation",
    image: photo("1531482615713-2afd69097998"),
    strand: "A",
  },
  {
    id: "02",
    num: "02",
    title: "Cultural Stage & Musical Performance",
    image: photo("1514525253161-7a46d19cd819"),
    strand: "B",
  },
  {
    id: "03",
    num: "03",
    title: "Hackathon Engineering Lab",
    image: photo("1517245386807-bb43f82c33c4"),
    strand: "A",
  },
  {
    id: "04",
    num: "04",
    title: "Dramatic Arts & Theatrical Showcase",
    image: photo("1507676184212-d03ab07a01bf"),
    strand: "B",
  },
  {
    id: "05",
    num: "05",
    title: "Student Innovation Symposium",
    image: photo("1524178232363-1fb2b075b655"),
    strand: "A",
  },
  {
    id: "06",
    num: "06",
    title: "Festival of Lights & Harmony",
    image: photo("1492684223066-81342ee5ff30"),
    strand: "B",
  },
  {
    id: "07",
    num: "07",
    title: "Monumental Architecture & Sthapatya",
    image: photo("1544620347-c4fd4a3d5957"),
    strand: "A",
  },
  {
    id: "08",
    num: "08",
    title: "Visual Archive Exhibition",
    image: photo("1518998053901-5348d3961a04"),
    strand: "B",
  },
];

import { getHomepageGallery } from "../../services/galleryService";

export default function GallerySectionDNA() {
  const [galleryList, setGalleryList] = useState(DNA_ITEMS);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadGallery() {
      try {
        const { data, error } = await getHomepageGallery();
        if (!error && data && data.length > 0) {
          const mapped = data.map((item, i) => ({
            id: item.id,
            num: String(i + 1).padStart(2, "0"),
            title: item.title || `Trinity Showcase ${i + 1}`,
            image: item.image_url,
            strand: i % 2 === 0 ? "A" : "B",
          }));
          if (isMounted) {
            setGalleryList(mapped);
          }
        }
      } catch (err) {
        console.warn("Using fallback DNA items:", err);
      }
    }
    loadGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  // Ensure enough repeated items for an uninterrupted continuous edge-to-edge carousel
  const displayList = useMemo(() => {
    if (!galleryList || galleryList.length === 0) return [];
    const minItems = 20;
    const repeatCount = Math.max(1, Math.ceil(minItems / galleryList.length));
    const items = [];
    for (let r = 0; r < repeatCount; r++) {
      galleryList.forEach((item, originalIndex) => {
        items.push({
          ...item,
          uniqueKey: `${item.id || originalIndex}-slot-${r}`,
          originalIndex,
        });
      });
    }
    return items;
  }, [galleryList]);

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);

  // Keep cardRefs synced with displayList length
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, displayList.length);
  }, [displayList.length]);

  // Animation physics state
  const progressRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const rafIdRef = useRef(null);
  const hasAnimatedEntryRef = useRef(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Responsive spatial parameters calibrated for continuous end-to-end flow
  const getSpatialParams = useCallback(() => {
    const width = stageRef.current
      ? stageRef.current.clientWidth
      : typeof window !== "undefined"
      ? window.innerWidth
      : 1200;
    const isMobile = width <= 640;
    const isTablet = width <= 1024 && !isMobile;

    if (isMobile) {
      return {
        isMobile: true,
        isTablet: false,
        xSpacing: 210,
        zScale: 90,
        zMax: 40,
        baseScale: 0.95,
        dragSens: 0.0035,
      };
    }
    if (isTablet) {
      return {
        isMobile: false,
        isTablet: true,
        xSpacing: 300,
        zScale: 120,
        zMax: 60,
        baseScale: 1.05,
        dragSens: 0.0028,
      };
    }
    return {
      isMobile: false,
      isTablet: false,
      xSpacing: 370,
      zScale: 140,
      zMax: 70,
      baseScale: 1.12,
      dragSens: 0.0022,
    };
  }, []);

  // Update 3D transforms for all image cards in a normal horizontal 3D carousel
  const updateTransforms = useCallback(() => {
    const { isMobile, isTablet, xSpacing, zScale, zMax, baseScale } = getSpatialParams();
    const progress = progressRef.current;
    const time = performance.now() * 0.001;

    // Subtle idle floating breathing
    const idleY = prefersReducedMotion ? 0 : Math.sin(time * 1.4) * 6;
    const idleRot = prefersReducedMotion ? 0 : Math.cos(time * 0.8) * 1.5;

    const totalItems = displayList.length;
    if (totalItems === 0) return;

    displayList.forEach((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return;

      // Wrap offset into [-totalItems/2, totalItems/2]
      let diff = i - progress;
      let wrapped = ((diff % totalItems) + totalItems) % totalItems;
      if (wrapped > totalItems / 2) wrapped -= totalItems;
      const d = wrapped;
      const absD = Math.abs(d);

      // 3D coordinates: straight horizontal path with gentle idle breathing on focused card
      const x = d * xSpacing;
      const y = absD < 0.5 ? idleY : 0;

      // Depth into perspective
      const centerFactor = Math.max(0, 1 - absD);
      const z = centerFactor * zMax - Math.pow(absD, 1.2) * zScale;

      // Scale: center card is baseScale, side cards scale down gracefully
      const scale = baseScale * Math.exp(-absD * 0.18);

      // Opacity: center card is 1, side cards remain vividly visible across edges, fading smoothly beyond viewport
      const fadeLimit = isMobile ? 2.6 : isTablet ? 3.8 : 5.0;
      const normD = Math.min(1, absD / fadeLimit);
      const opacity = absD > fadeLimit ? 0 : Math.max(0, 1 - Math.pow(normD, 1.8));

      // Blur: subtle depth of field on distant cards
      const blur = prefersReducedMotion
        ? 0
        : absD <= 1.2
        ? 0
        : Math.min(4, Math.pow(absD - 0.8, 1.1) * 1.2);

      // Normal 3D carousel facing: side cards turn smoothly toward the viewer
      const rotY = -Math.sign(d) * Math.min(22, Math.pow(absD, 0.85) * 11);
      const rotX = 0;
      const rotZ = absD < 0.5 ? idleRot : 0;

      // Z-Index layering: center is highest
      const zIndex = Math.round(100 - absD * 10);

      // Direct GPU transform update
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(0deg) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : "none";
      el.style.zIndex = zIndex;
      el.style.visibility = opacity <= 0.01 ? "hidden" : "visible";
      el.style.pointerEvents = opacity <= 0.2 ? "none" : "auto";
    });

    // Update active index in React state when closest integer changes
    const currentActiveExtended =
      ((Math.round(progress) % totalItems) + totalItems) % totalItems;
    setActiveIndex((prev) =>
      prev !== currentActiveExtended ? currentActiveExtended : prev
    );
  }, [getSpatialParams, prefersReducedMotion, displayList]);

  // Main physics loop (inertia + spring snapping)
  useEffect(() => {
    let lastStamp = performance.now();

    const loop = (now) => {
      const delta = Math.min(32, now - lastStamp);
      lastStamp = now;

      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.0008) {
          progressRef.current += velocityRef.current;
          velocityRef.current *= 0.92; // smooth friction
        } else {
          velocityRef.current = 0;
          // Smooth snap to nearest integer index
          const nearest = Math.round(progressRef.current);
          const snapDiff = nearest - progressRef.current;
          if (Math.abs(snapDiff) > 0.0005) {
            progressRef.current += snapDiff * 0.12;
          } else {
            progressRef.current = nearest;
          }
        }
      }

      updateTransforms();
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [updateTransforms]);

  // Cinematic entry animation via GSAP
  useEffect(() => {
    if (hasAnimatedEntryRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedEntryRef.current) {
          hasAnimatedEntryRef.current = true;

          if (prefersReducedMotion) return;

          const tl = gsap.timeline();

          // Astrolabe & background rings appear
          tl.fromTo(
            ".dna-celestial-canvas",
            { opacity: 0, scale: 0.88, rotate: -25 },
            {
              opacity: 1,
              scale: 1,
              rotate: 0,
              duration: 1.4,
              ease: "power2.out",
            },
            0
          );

          // 3D Viewport assemble smoothly
          tl.fromTo(
            ".dna-viewport-3d",
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 1.0, ease: "power2.out" },
            0.2
          );
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Dragging Handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const dx = e.clientX - lastXRef.current;

    const { dragSens } = getSpatialParams();
    progressRef.current -= dx * dragSens;

    velocityRef.current = -(dx / dt) * (dragSens * 16);
    lastXRef.current = e.clientX;
    lastTimeRef.current = now;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Direct card click: smoothly rotates to bring clicked card to center
  const handleCardClick = (targetIndex) => {
    const totalItems = displayList.length;
    if (totalItems === 0) return;
    const currentProgress = progressRef.current;
    let diff = targetIndex - currentProgress;
    let wrapped = ((diff % totalItems) + totalItems) % totalItems;
    if (wrapped > totalItems / 2) wrapped -= totalItems;

    const destination = currentProgress + wrapped;
    gsap.to(progressRef, {
      current: destination,
      duration: prefersReducedMotion ? 0.01 : 0.75,
      ease: "power2.out",
    });
  };

  // Navigation Arrows
  const handlePrev = () => {
    const target = Math.round(progressRef.current) - 1;
    gsap.to(progressRef, {
      current: target,
      duration: prefersReducedMotion ? 0.01 : 0.65,
      ease: "power2.out",
    });
  };

  const handleNext = () => {
    const target = Math.round(progressRef.current) + 1;
    gsap.to(progressRef, {
      current: target,
      duration: prefersReducedMotion ? 0.01 : 0.65,
      ease: "power2.out",
    });
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <section
      ref={sectionRef}
      className="gallery-dna-section"
      aria-label="Celestial DNA Photo Gallery"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Subtle top hairline divider bridging hero */}
      <div className="dna-top-divider" aria-hidden="true" />

      {/* Section Header */}
      <div className="dna-header">
        <div className="dna-header-text">
          <p className="dna-eyebrow">
            <span className="dna-eyebrow-glyph">✦</span> ARCHIVE / VISUAL RECORDS
          </p>
          <h2 className="dna-heading">Fragments of the journey.</h2>
        </div>

        {/* Minimal Navigation Controls */}
        <div className="dna-controls" aria-label="Carousel navigation">
          <button
            type="button"
            className="dna-ctrl-btn"
            onClick={handlePrev}
            aria-label="Previous photograph"
          >
            <span className="ctrl-arrow">←</span>
          </button>
          <button
            type="button"
            className="dna-ctrl-btn"
            onClick={handleNext}
            aria-label="Next photograph"
          >
            <span className="ctrl-arrow">→</span>
          </button>
        </div>
      </div>

      {/* 3D Helix Spatial Stage */}
      <div
        ref={stageRef}
        className="dna-stage"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="region"
        aria-label="DNA Helix 3D Carousel"
      >
        {/* Background Celestial Astrolabe Rings */}
        <div className="dna-celestial-canvas" aria-hidden="true">
          <svg className="astrolabe-svg" viewBox="0 0 800 800" fill="none">
            <circle cx="400" cy="400" r="380" stroke="rgba(214, 175, 102, 0.08)" strokeWidth="1" />
            <circle cx="400" cy="400" r="340" stroke="rgba(214, 175, 102, 0.12)" strokeWidth="1" strokeDasharray="3 6" />
            <circle cx="400" cy="400" r="260" stroke="rgba(75, 156, 153, 0.1)" strokeWidth="0.8" />
            <circle cx="400" cy="400" r="180" stroke="rgba(214, 175, 102, 0.15)" strokeWidth="1" strokeDasharray="4 8" />
            <circle cx="400" cy="400" r="90" stroke="rgba(214, 175, 102, 0.08)" strokeWidth="0.8" />

            <line x1="20" y1="400" x2="780" y2="400" stroke="rgba(214, 175, 102, 0.09)" strokeWidth="0.8" />
            <line x1="400" y1="20" x2="400" y2="780" stroke="rgba(214, 175, 102, 0.09)" strokeWidth="0.8" />

            {Array.from({ length: 24 }).map((_, idx) => {
              const ang = (idx * 15 * Math.PI) / 180;
              const x1 = 400 + 370 * Math.cos(ang);
              const y1 = 400 + 370 * Math.sin(ang);
              const x2 = 400 + 380 * Math.cos(ang);
              const y2 = 400 + 380 * Math.sin(ang);
              return (
                <line
                  key={`tick-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(214, 175, 102, 0.2)"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </div>

        {/* Ambient Halo Behind Central Hero */}
        <div className="dna-center-aura" aria-hidden="true" />

        {/* 3D Viewport Root */}
        <div className="dna-viewport-3d">
          {displayList.map((item, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={item.uniqueKey}
                ref={(el) => (cardRefs.current[i] = el)}
                className={`dna-artifact-node ${isActive ? "active-hero" : "inactive-node"}`}
                onClick={() => handleCardClick(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(i);
                  }
                }}
                aria-label={`Photo ${item.num}: ${item.title}`}
                aria-selected={isActive}
              >
                {/* Clean Frameless Photo Card */}
                <div className="dna-photo-card">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="dna-photo-img"
                    loading="lazy"
                    draggable="false"
                  />
                  <div className="dna-photo-glare" aria-hidden="true" />
                  <div className="dna-photo-border" aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle bottom divider leading into OrdersSection */}
      <div className="dna-bottom-divider" aria-hidden="true" />
    </section>
  );
}
