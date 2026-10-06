import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ordersData } from "../../data/ordersData";
import "./OrdersSection.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function OrdersSection({ selectedOrderIndex, onSelectOrder }) {
  const [selectedIndex, setSelectedIndex] = useState(
    typeof selectedOrderIndex === "number" ? selectedOrderIndex : 0
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const stageRef = useRef(null);
  const astrolabeOuterRef = useRef(null);
  const astrolabeInnerRef = useRef(null);
  const currentImgRef = useRef(null);
  const mobileImgRef = useRef(null);
  const auraRef = useRef(null);
  const detailsContentRef = useRef(null);
  const navRailRef = useRef(null);

  const currentOrder = ordersData[selectedIndex];

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fast, lag-free transition with single-image lifecycle (no overlapping artifacts)
  const handleSelectOrder = useCallback(
    (newIndex) => {
      if (newIndex === selectedIndex || isTransitioning) return;

      if (prefersReducedMotion) {
        setSelectedIndex(newIndex);
        if (onSelectOrder) {
          onSelectOrder(newIndex);
        }
        return;
      }

      setIsTransitioning(true);

      const isForward = newIndex > selectedIndex;
      const targetOrder = ordersData[newIndex];

      const tl = gsap.timeline({
        onComplete: () => {
          setIsTransitioning(false);
        },
      });

      const artifactTargets = [currentImgRef.current, mobileImgRef.current].filter(Boolean);

      // 1. Quick, smooth fade-out of current artifact (0.14s)
      if (artifactTargets.length > 0) {
        tl.to(artifactTargets, {
          opacity: 0,
          scale: 0.94,
          y: isForward ? -6 : 6,
          duration: 0.14,
          ease: "power2.in",
        });
      }

      // 2. Immediate clean state swap at midpoint
      tl.add(() => {
        setSelectedIndex(newIndex);
        if (onSelectOrder) {
          onSelectOrder(newIndex);
        }
      });

      // 3. Crisp, snappy entrance of new artifact (0.24s)
      if (artifactTargets.length > 0) {
        tl.fromTo(
          artifactTargets,
          {
            opacity: 0,
            scale: 1.06,
            y: isForward ? 8 : -8,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.24,
            ease: "power2.out",
          }
        );
      }

      // 4. Astrolabe subtle rotation
      if (astrolabeOuterRef.current) {
        tl.to(
          astrolabeOuterRef.current,
          {
            rotation: `+=${isForward ? 22 : -22}`,
            duration: 0.45,
            ease: "power2.out",
          },
          0
        );
      }

      // 5. Text fade-and-rise transition
      if (detailsContentRef.current) {
        tl.fromTo(
          detailsContentRef.current,
          {
            opacity: 0.35,
            y: 6,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.24,
            ease: "power2.out",
          },
          0.12
        );
      }
    },
    [selectedIndex, isTransitioning, prefersReducedMotion]
  );

  const handlePrev = () => {
    const nextIdx = (selectedIndex - 1 + ordersData.length) % ordersData.length;
    handleSelectOrder(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (selectedIndex + 1) % ordersData.length;
    handleSelectOrder(nextIdx);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      handleNext();
    }
  };

  // Touch swipe support
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStart(null);
  };

  // Scroll entrance animation
  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none none",
        },
      });

      scrollTl
        .from(headerRef.current, {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
        })
        .from(
          stageRef.current,
          {
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
          },
          "-=0.3"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Ensure active mobile chip scrolls into view smoothly
  useEffect(() => {
    if (!navRailRef.current) return;
    const activeChip = navRailRef.current.querySelector(
      `.mobile-rail-item.active`
    );
    if (activeChip) {
      activeChip.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  // Synchronize when controlled externally from homepage hero artifacts
  useEffect(() => {
    if (
      typeof selectedOrderIndex === "number" &&
      selectedOrderIndex >= 0 &&
      selectedOrderIndex < ordersData.length &&
      selectedOrderIndex !== selectedIndex
    ) {
      if (isTransitioning) {
        setSelectedIndex(selectedOrderIndex);
        setIsTransitioning(false);
        if (onSelectOrder) {
          onSelectOrder(selectedOrderIndex);
        }
      } else {
        handleSelectOrder(selectedOrderIndex);
      }
    }
  }, [selectedOrderIndex, selectedIndex, isTransitioning, handleSelectOrder, onSelectOrder]);

  return (
    <section
      id="orders"
      className="orders-exhibition-section"
      ref={sectionRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        "--house-accent": currentOrder.color,
      }}
      aria-label="The Six Orders - Interactive Civilization Archive"
    >
      {/* Background ambient lighting and faint celestial grid */}
      <div className="exhibition-ambient-glow" aria-hidden="true" />
      <div className="exhibition-celestial-lines" aria-hidden="true" />

      {/* Editorial Section Header */}
      <div className="exhibition-header" ref={headerRef}>
        <div className="exhibition-eyebrow-row">
          <p className="exhibition-eyebrow">THE SIX ORDERS</p>
        </div>

        <h2 className="exhibition-title">
          One story, six ways of seeing.
        </h2>

        <p className="exhibition-subline">
          Six orders. Six perspectives. One living civilization.
        </p>

        <div className="exhibition-hairline-sep" aria-hidden="true">
          <span className="sep-line" />
        </div>
      </div>

      {/* Asymmetric Exhibition Canvas */}
      <div
        className="exhibition-canvas"
        ref={stageRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ==============================================================
            LEFT: Vertical Editorial Order Index (Clean typography, no symbols/underlines)
            ============================================================== */}
        <nav
          className="editorial-order-index"
          aria-label="Six Orders Navigation"
        >
          <div className="index-label-heading">
            <span className="index-count">
              {currentOrder.num} / 0{ordersData.length}
            </span>
          </div>

          <div className="index-list-wrapper">
            {ordersData.map((order, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <button
                  key={order.name}
                  type="button"
                  className={`index-item-btn ${isActive ? "active" : ""}`}
                  style={{
                    "--item-accent": order.color,
                  }}
                  onClick={() => handleSelectOrder(idx)}
                  aria-label={`Select Order ${order.num} ${order.name}: ${order.cue}`}
                  aria-pressed={isActive}
                >
                  <div className="index-item-marker" aria-hidden="true">
                    <span className="marker-dot" />
                  </div>

                  <div className="index-item-content">
                    <div className="index-item-header">
                      <span className="index-item-num">{order.num}</span>
                      <span className="index-item-name">{order.name}</span>
                    </div>
                    <span className="index-item-cue">{order.dept}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ==============================================================
            CENTER (Desktop) / BACKGROUND LAYER (Mobile): Hero Artifact & Astrolabe
            ============================================================== */}
        <div className="exhibition-hero-stage">
          {/* Ambient Per-House Glow Halo */}
          <div
            className="stage-aura-halo"
            ref={auraRef}
            style={{
              background: `radial-gradient(circle, ${currentOrder.color}38 0%, rgba(214, 175, 102, 0.05) 50%, transparent 72%)`,
            }}
            aria-hidden="true"
          />

          {/* Subtle Astronomical Astrolabe Frame */}
          <div className="stage-astrolabe-svg-wrapper" aria-hidden="true">
            <svg
              className="stage-astrolabe-svg"
              viewBox="0 0 680 680"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Graduation Ring */}
              <g
                className="astrolabe-outer-ring"
                ref={astrolabeOuterRef}
                style={{ transformOrigin: "340px 340px" }}
              >
                <circle
                  cx="340"
                  cy="340"
                  r="310"
                  stroke="rgba(214, 175, 102, 0.22)"
                  strokeWidth="1.2"
                />
                <circle
                  cx="340"
                  cy="340"
                  r="298"
                  stroke="rgba(214, 175, 102, 0.1)"
                  strokeWidth="0.8"
                />
                <circle
                  cx="340"
                  cy="340"
                  r="260"
                  stroke="rgba(214, 175, 102, 0.18)"
                  strokeWidth="0.8"
                  strokeDasharray="2 6"
                />

                {/* 48 Engraved Astrolabe Ticks */}
                {Array.from({ length: 48 }).map((_, i) => {
                  const deg = i * 7.5;
                  const isMajor = i % 6 === 0;
                  const tickLength = isMajor ? 12 : 5;
                  return (
                    <line
                      key={`tick-${deg}`}
                      x1="340"
                      y1={340 - 310}
                      x2={340}
                      y2={340 - 310 + tickLength}
                      transform={`rotate(${deg} 340 340)`}
                      stroke="rgba(214, 175, 102, 0.38)"
                      strokeWidth={isMajor ? 1.4 : 0.75}
                    />
                  );
                })}

                {/* Cardinal Points */}
                {[
                  { deg: 0, label: "000° · N" },
                  { deg: 90, label: "090° · E" },
                  { deg: 180, label: "180° · S" },
                  { deg: 270, label: "270° · W" },
                ].map(({ deg, label }) => (
                  <text
                    key={`coord-${deg}`}
                    x="340"
                    y="48"
                    transform={`rotate(${deg} 340 340)`}
                    fill="rgba(214, 175, 102, 0.55)"
                    fontSize="9"
                    fontFamily="'DM Mono', monospace"
                    textAnchor="middle"
                    letterSpacing="0.1em"
                  >
                    {label}
                  </text>
                ))}
              </g>

              {/* Inner Counter-Rotating Instrument Ring */}
              <g
                className="astrolabe-inner-ring"
                ref={astrolabeInnerRef}
                style={{ transformOrigin: "340px 340px" }}
              >
                <circle
                  cx="340"
                  cy="340"
                  r="234"
                  stroke="rgba(214, 175, 102, 0.32)"
                  strokeWidth="1.2"
                />
                <circle
                  cx="340"
                  cy="340"
                  r="234"
                  stroke="rgba(214, 175, 102, 0.2)"
                  strokeWidth="0.8"
                  strokeDasharray="4 8"
                />
                <circle
                  cx="340"
                  cy="340"
                  r="165"
                  stroke="rgba(214, 175, 102, 0.14)"
                  strokeWidth="0.8"
                />
              </g>

              {/* Static Crosshair Geometry */}
              <g className="astrolabe-static-axes">
                <line
                  x1="50"
                  y1="340"
                  x2="630"
                  y2="340"
                  stroke="rgba(214, 175, 102, 0.14)"
                  strokeWidth="0.8"
                />
                <line
                  x1="340"
                  y1="50"
                  x2="340"
                  y2="630"
                  stroke="rgba(214, 175, 102, 0.14)"
                  strokeWidth="0.8"
                />
              </g>
            </svg>
          </div>

          {/* Single Artifact Image Container (Guarantees zero ghost/double overlap) */}
          <div className="hero-artifact-container">
            <img
              ref={currentImgRef}
              src={currentOrder.image}
              alt={`${currentOrder.name} Artifact - ${currentOrder.cue}`}
              className="hero-artifact-artwork"
              draggable="false"
            />
          </div>
        </div>

        {/* ==============================================================
            RIGHT (Desktop) / FOREGROUND LAYER (Mobile): Clean Editorial Details
            ============================================================== */}
        <div className="editorial-archive-details">
          <div className="details-content-wrapper" ref={detailsContentRef}>
            {/* Fine Header Annotation */}
            <div className="details-codex-line">
              <span className="details-codex-id">{currentOrder.codex}</span>
              <span className="details-dot-sep">·</span>
              <span className="details-coords">{currentOrder.coordinates}</span>
            </div>

            {/* Clean Title Lockup with adjacent mobile artifact */}
            <div className="details-title-lockup">
              <div className="mobile-artifact-emblem" aria-hidden="true">
                <img
                  ref={mobileImgRef}
                  src={currentOrder.image}
                  alt={`${currentOrder.name} Artifact`}
                  className="mobile-artifact-artwork"
                  draggable="false"
                />
              </div>

              <div className="details-title-text-group">
                <div className="details-main-heading">
                  <div className="details-order-heading-row">
                    <span className="details-order-num">{currentOrder.num}</span>
                    <h3 className="details-order-name">{currentOrder.dept}</h3>
                  </div>
                  <p className="details-order-cue">AS {currentOrder.artifact ? currentOrder.artifact.toUpperCase() : currentOrder.name.toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Inscription Quote */}
            <div className="details-quote-block">
              <p className="details-quote-text">
                “{currentOrder.blurb}”
              </p>
            </div>

            {/* Lore Narrative Description */}
            <p className="details-lore-text">{currentOrder.description}</p>

            {/* Thin Hairline Divider */}
            <div className="details-thin-divider" aria-hidden="true" />

            {/* Clean Editorial Metadata (No emojis or bullet icons) */}
            <div className="details-facets-list">
              <div className="details-facet-row">
                <span className="facet-key">DOMAIN</span>
                <span className="facet-val">{currentOrder.domain}</span>
              </div>

              <div className="details-facet-row">
                <span className="facet-key">ALIGNMENT</span>
                <span className="facet-val">{currentOrder.element}</span>
              </div>

              <div className="details-facet-row">
                <span className="facet-key">HORIZON</span>
                <span className="facet-val">{currentOrder.cardinal}</span>
              </div>
            </div>

            {/* Directional Step Controls */}
            <div className="details-actions-bar">
              <button
                type="button"
                className="step-nav-btn prev"
                onClick={handlePrev}
                aria-label="View previous order"
              >
                <span className="step-arrow">←</span>
                <span>PREV</span>
              </button>

              <div className="step-order-indicator" aria-hidden="true">
                <span className="step-active-num">{currentOrder.num}</span>
                <span className="step-total-sep">/</span>
                <span className="step-total-num">06</span>
              </div>

              <button
                type="button"
                className="step-nav-btn next"
                onClick={handleNext}
                aria-label="View next order"
              >
                <span>NEXT</span>
                <span className="step-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================
          MOBILE: Compact Horizontal Navigation Rail (<880px)
          ============================================================== */}
      <div className="mobile-exhibition-rail-container" aria-label="Mobile Orders Rail">
        <div className="mobile-rail-header">
          <span className="rail-eyebrow">EXPLORE ORDERS</span>
          <span className="rail-counter">
            {currentOrder.num} / 06 · {currentOrder.name.toUpperCase()}
          </span>
        </div>

        <div className="mobile-rail-track" ref={navRailRef}>
          {ordersData.map((order, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <button
                key={`mobile-rail-${order.name}`}
                type="button"
                className={`mobile-rail-item ${isActive ? "active" : ""}`}
                style={{
                  "--rail-accent": order.color,
                }}
                onClick={() => handleSelectOrder(idx)}
                aria-label={`Select ${order.name}`}
                aria-pressed={isActive}
              >
                <span className="rail-item-num">{order.num}</span>
                <span className="rail-item-name">{order.name}</span>
                {isActive && <span className="rail-item-active-bar" />}
              </button>
            );
          })}
        </div>

        <p className="mobile-swipe-hint">← swipe or tap to explore →</p>
      </div>
    </section>
  );
}
