import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";

import gsap from "gsap";

import "./GallerySectionDNA.css";

import { getHomepageGallery } from "../../services/galleryService";

/*
 * IMPORTANT:
 * There are NO hardcoded/fallback gallery images anymore.
 *
 * The gallery is completely driven by Supabase.
 *
 * If Supabase has:
 *   2 images  -> those 2 images are repeated
 *   6 images  -> those 6 images are repeated
 *   20 images -> those 20 images are repeated
 *   0 images  -> nothing is rendered
 */

// -----------------------------------------------------------------------------
// COMPONENT
// -----------------------------------------------------------------------------

export default function GallerySectionDNA() {
  /*
   * Start EMPTY.
   *
   * Previously this was:
   *
   * useState(DNA_ITEMS)
   *
   * which caused the stock Unsplash images to appear before/when Supabase
   * wasn't available.
   *
   * Now the only source is Supabase.
   */
  const [galleryList, setGalleryList] = useState([]);

  const [activeIndex, setActiveIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // LOAD GALLERY FROM SUPABASE
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    async function loadGallery() {
      try {
        setIsLoading(true);

        const { data, error } = await getHomepageGallery();

        if (error) {
          console.error(
            "[Homepage Gallery] Failed to load Supabase gallery:",
            error,
          );

          if (isMounted) {
            setGalleryList([]);
            setActiveIndex(0);
          }

          return;
        }

        /*
         * Only accept records that actually contain an image URL.
         *
         * This prevents blank cards caused by:
         * - null image_url
         * - empty image_url
         * - malformed records
         */
        const validImages = (data || []).filter((item) => {
          return (
            item &&
            typeof item.image_url === "string" &&
            item.image_url.trim().length > 0
          );
        });

        if (validImages.length === 0) {
          console.warn(
            "[Homepage Gallery] Supabase returned no valid gallery images.",
          );

          if (isMounted) {
            setGalleryList([]);
            setActiveIndex(0);
          }

          return;
        }

        /*
         * Convert Supabase records into the format used by the carousel.
         *
         * IMPORTANT:
         * We do NOT create fallback records here.
         */
        const mapped = validImages.map((item, i) => ({
          id: item.id || item.storage_path || `supabase-gallery-${i}`,

          num: String(i + 1).padStart(2, "0"),

          title:
            item.title?.trim() ||
            item.event_name?.trim() ||
            `Trinity Gallery ${i + 1}`,

          image: item.image_url,

          strand: i % 2 === 0 ? "A" : "B",

          storagePath: item.storage_path || null,

          eventName: item.event_name || null,
        }));

        console.log(
          `[Homepage Gallery] Loaded ${mapped.length} real image(s) from Supabase.`,
        );

        if (isMounted) {
          setGalleryList(mapped);

          /*
           * Always begin at the first real image.
           */
          setActiveIndex(0);

          progressRef.current = 0;
          velocityRef.current = 0;
        }
      } catch (err) {
        console.error(
          "[Homepage Gallery] Unexpected gallery loading error:",
          err,
        );

        if (isMounted) {
          setGalleryList([]);
          setActiveIndex(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // REPEAT ONLY THE REAL SUPABASE IMAGES
  // ---------------------------------------------------------------------------

  /*
   * The carousel needs enough cards around the viewport to look continuous.
   *
   * IMPORTANT:
   * We repeat galleryList itself.
   *
   * Example:
   *
   * Supabase:
   *   A
   *   B
   *
   * displayList:
   *   A B A B A B A B A B ...
   *
   * There are NEVER blank/fallback cards.
   */
  const displayList = useMemo(() => {
    if (!galleryList || galleryList.length === 0) {
      return [];
    }

    /*
     * Enough copies to keep the carousel visually populated.
     *
     * This does NOT create additional unique images.
     * It only repeats the images that actually exist.
     */
    const minItems = 20;

    const repeatCount = Math.max(1, Math.ceil(minItems / galleryList.length));

    const items = [];

    for (let r = 0; r < repeatCount; r++) {
      galleryList.forEach((item, originalIndex) => {
        items.push({
          ...item,

          uniqueKey: `${item.id}-slot-${r}`,

          originalIndex,
        });
      });
    }

    return items;
  }, [galleryList]);

  // ---------------------------------------------------------------------------
  // REFS
  // ---------------------------------------------------------------------------

  const sectionRef = useRef(null);

  const stageRef = useRef(null);

  const cardRefs = useRef([]);

  /*
   * These are declared before the Supabase loading effect uses them.
   */
  const progressRef = useRef(0);

  const velocityRef = useRef(0);

  const isDraggingRef = useRef(false);

  const startXRef = useRef(0);

  const lastXRef = useRef(0);

  const lastTimeRef = useRef(0);

  const rafIdRef = useRef(null);

  const hasAnimatedEntryRef = useRef(false);

  // ---------------------------------------------------------------------------
  // KEEP CARD REFS IN SYNC
  // ---------------------------------------------------------------------------

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, displayList.length);
  }, [displayList.length]);

  // ---------------------------------------------------------------------------
  // REDUCED MOTION
  // ---------------------------------------------------------------------------

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------------------
  // RESPONSIVE SPATIAL PARAMETERS
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // UPDATE 3D TRANSFORMS
  // ---------------------------------------------------------------------------

  const updateTransforms = useCallback(() => {
    const { isMobile, isTablet, xSpacing, zScale, zMax, baseScale } =
      getSpatialParams();

    const progress = progressRef.current;

    const time = performance.now() * 0.001;

    const idleY = prefersReducedMotion ? 0 : Math.sin(time * 1.4) * 6;

    const idleRot = prefersReducedMotion ? 0 : Math.cos(time * 0.8) * 1.5;

    const totalItems = displayList.length;

    /*
     * Nothing to animate if there are no Supabase images.
     */
    if (totalItems === 0) {
      return;
    }

    displayList.forEach((_, i) => {
      const el = cardRefs.current[i];

      if (!el) {
        return;
      }

      /*
       * Wrap offset into:
       *
       * [-totalItems / 2, totalItems / 2]
       *
       * This gives the infinite looping effect.
       */
      let diff = i - progress;

      let wrapped = ((diff % totalItems) + totalItems) % totalItems;

      if (wrapped > totalItems / 2) {
        wrapped -= totalItems;
      }

      const d = wrapped;

      const absD = Math.abs(d);

      // ---------------------------------------------------------------
      // POSITION
      // ---------------------------------------------------------------

      const x = d * xSpacing;

      const y = absD < 0.5 ? idleY : 0;

      // ---------------------------------------------------------------
      // DEPTH
      // ---------------------------------------------------------------

      const centerFactor = Math.max(0, 1 - absD);

      const z = centerFactor * zMax - Math.pow(absD, 1.2) * zScale;

      // ---------------------------------------------------------------
      // SCALE
      // ---------------------------------------------------------------

      const scale = baseScale * Math.exp(-absD * 0.18);

      // ---------------------------------------------------------------
      // OPACITY
      // ---------------------------------------------------------------

      const fadeLimit = isMobile ? 2.6 : isTablet ? 3.8 : 5.0;

      const normD = Math.min(1, absD / fadeLimit);

      const opacity =
        absD > fadeLimit ? 0 : Math.max(0, 1 - Math.pow(normD, 1.8));

      // ---------------------------------------------------------------
      // BLUR
      // ---------------------------------------------------------------

      const blur = prefersReducedMotion
        ? 0
        : absD <= 1.2
          ? 0
          : Math.min(4, Math.pow(absD - 0.8, 1.1) * 1.2);

      // ---------------------------------------------------------------
      // ROTATION
      // ---------------------------------------------------------------

      const rotY = -Math.sign(d) * Math.min(22, Math.pow(absD, 0.85) * 11);

      const rotZ = absD < 0.5 ? idleRot : 0;

      // ---------------------------------------------------------------
      // Z INDEX
      // ---------------------------------------------------------------

      const zIndex = Math.round(100 - absD * 10);

      // ---------------------------------------------------------------
      // APPLY GPU TRANSFORMS
      // ---------------------------------------------------------------

      el.style.transform = `
        translate3d(
          ${x.toFixed(1)}px,
          ${y.toFixed(1)}px,
          ${z.toFixed(1)}px
        )
        rotateX(0deg)
        rotateY(${rotY.toFixed(1)}deg)
        rotateZ(${rotZ.toFixed(1)}deg)
        scale(${scale.toFixed(3)})
      `;

      el.style.opacity = opacity.toFixed(3);

      el.style.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : "none";

      el.style.zIndex = zIndex;

      /*
       * Completely hide cards outside the visible range.
       */
      el.style.visibility = opacity <= 0.01 ? "hidden" : "visible";

      el.style.pointerEvents = opacity <= 0.2 ? "none" : "auto";
    });

    // ---------------------------------------------------------------
    // UPDATE ACTIVE INDEX
    // ---------------------------------------------------------------

    const currentActiveExtended =
      ((Math.round(progress) % totalItems) + totalItems) % totalItems;

    setActiveIndex((prev) =>
      prev !== currentActiveExtended ? currentActiveExtended : prev,
    );
  }, [getSpatialParams, prefersReducedMotion, displayList]);

  // ---------------------------------------------------------------------------
  // MAIN PHYSICS LOOP
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let lastStamp = performance.now();

    const loop = (now) => {
      const delta = Math.min(32, now - lastStamp);

      lastStamp = now;

      /*
       * delta is intentionally calculated for frame consistency.
       */
      void delta;

      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.0008) {
          progressRef.current += velocityRef.current;

          velocityRef.current *= 0.92;
        } else {
          velocityRef.current = 0;

          /*
           * Smooth snap to nearest integer.
           */
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
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [updateTransforms]);

  // ---------------------------------------------------------------------------
  // CINEMATIC ENTRY ANIMATION
  // ---------------------------------------------------------------------------

  useEffect(() => {
    /*
     * Don't run the entry animation repeatedly.
     */
    if (hasAnimatedEntryRef.current) {
      return;
    }

    /*
     * If there are no images yet, wait until Supabase data arrives.
     */
    if (galleryList.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedEntryRef.current) {
          hasAnimatedEntryRef.current = true;

          if (prefersReducedMotion) {
            return;
          }

          const tl = gsap.timeline();

          // Astrolabe background
          tl.fromTo(
            ".dna-celestial-canvas",
            {
              opacity: 0,
              scale: 0.88,
              rotate: -25,
            },
            {
              opacity: 1,
              scale: 1,
              rotate: 0,
              duration: 1.4,
              ease: "power2.out",
            },
            0,
          );

          // Photo carousel
          tl.fromTo(
            ".dna-viewport-3d",
            {
              opacity: 0,
              scale: 0.85,
            },
            {
              opacity: 1,
              scale: 1,
              duration: 1.0,
              ease: "power2.out",
            },
            0.2,
          );
        }
      },
      {
        threshold: 0.2,
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [galleryList.length, prefersReducedMotion]);

  // ---------------------------------------------------------------------------
  // IMAGE ERROR HANDLING
  // ---------------------------------------------------------------------------

  /*
   * If a Supabase URL somehow points to a deleted/missing file,
   * remove it from the currently displayed list.
   *
   * This guarantees a broken image never leaves a blank card behind.
   */
  const handleImageError = useCallback((failedItem) => {
    console.warn(
      "[Homepage Gallery] Removing broken image:",
      failedItem?.image,
    );

    setGalleryList((current) =>
      current.filter((item) => item.id !== failedItem.id),
    );
  }, []);

  // ---------------------------------------------------------------------------
  // DRAGGING
  // ---------------------------------------------------------------------------

  const handlePointerDown = (e) => {
    if (displayList.length === 0) {
      return;
    }

    isDraggingRef.current = true;

    startXRef.current = e.clientX;

    lastXRef.current = e.clientX;

    lastTimeRef.current = performance.now();

    velocityRef.current = 0;

    /*
     * Capture pointer so dragging continues even if
     * cursor leaves the stage.
     */
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore unsupported pointer capture.
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || displayList.length === 0) {
      return;
    }

    const now = performance.now();

    const dt = Math.max(1, now - lastTimeRef.current);

    const dx = e.clientX - lastXRef.current;

    const { dragSens } = getSpatialParams();

    progressRef.current -= dx * dragSens;

    velocityRef.current = -(dx / dt) * (dragSens * 16);

    lastXRef.current = e.clientX;

    lastTimeRef.current = now;
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore unsupported pointer capture.
    }
  };

  // ---------------------------------------------------------------------------
  // CARD CLICK
  // ---------------------------------------------------------------------------

  const handleCardClick = (targetIndex) => {
    const totalItems = displayList.length;

    if (totalItems === 0) {
      return;
    }

    const currentProgress = progressRef.current;

    let diff = targetIndex - currentProgress;

    let wrapped = ((diff % totalItems) + totalItems) % totalItems;

    if (wrapped > totalItems / 2) {
      wrapped -= totalItems;
    }

    const destination = currentProgress + wrapped;

    gsap.to(progressRef, {
      current: destination,

      duration: prefersReducedMotion ? 0.01 : 0.75,

      ease: "power2.out",
    });
  };

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------

  const handlePrev = () => {
    if (displayList.length === 0) {
      return;
    }

    const target = Math.round(progressRef.current) - 1;

    gsap.to(progressRef, {
      current: target,

      duration: prefersReducedMotion ? 0.01 : 0.65,

      ease: "power2.out",
    });
  };

  const handleNext = () => {
    if (displayList.length === 0) {
      return;
    }

    const target = Math.round(progressRef.current) + 1;

    gsap.to(progressRef, {
      current: target,

      duration: prefersReducedMotion ? 0.01 : 0.65,

      ease: "power2.out",
    });
  };

  // ---------------------------------------------------------------------------
  // KEYBOARD NAVIGATION
  // ---------------------------------------------------------------------------

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();

      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();

      handleNext();
    }
  };

  // ---------------------------------------------------------------------------
  // NOTHING TO SHOW
  // ---------------------------------------------------------------------------

  /*
   * If Supabase has no homepage gallery images, don't render
   * empty cards.
   *
   * We still render the section itself with its background/header,
   * but the photo cards are completely absent.
   */
  const hasImages = displayList.length > 0;

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <section
      ref={sectionRef}
      className="gallery-dna-section"
      aria-label="Celestial DNA Photo Gallery"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Top divider */}
      <div className="dna-top-divider" aria-hidden="true" />

      {/* Header */}
      <div className="dna-header">
        <div className="dna-header-text">
          <p className="dna-eyebrow">
            <span className="dna-eyebrow-glyph">✦</span>
            ARCHIVE / VISUAL RECORDS
          </p>

          <h2 className="dna-heading">Fragments of the journey.</h2>
        </div>

        {/* Navigation */}
        {hasImages && (
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
        )}
      </div>

      {/* 3D Gallery Stage */}
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
        {/* Background celestial astrolabe */}
        <div className="dna-celestial-canvas" aria-hidden="true">
          <svg className="astrolabe-svg" viewBox="0 0 800 800" fill="none">
            <circle
              cx="400"
              cy="400"
              r="380"
              stroke="rgba(214, 175, 102, 0.08)"
              strokeWidth="1"
            />

            <circle
              cx="400"
              cy="400"
              r="340"
              stroke="rgba(214, 175, 102, 0.12)"
              strokeWidth="1"
              strokeDasharray="3 6"
            />

            <circle
              cx="400"
              cy="400"
              r="260"
              stroke="rgba(75, 156, 153, 0.1)"
              strokeWidth="0.8"
            />

            <circle
              cx="400"
              cy="400"
              r="180"
              stroke="rgba(214, 175, 102, 0.15)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />

            <circle
              cx="400"
              cy="400"
              r="90"
              stroke="rgba(214, 175, 102, 0.08)"
              strokeWidth="0.8"
            />

            <line
              x1="20"
              y1="400"
              x2="780"
              y2="400"
              stroke="rgba(214, 175, 102, 0.09)"
              strokeWidth="0.8"
            />

            <line
              x1="400"
              y1="20"
              x2="400"
              y2="780"
              stroke="rgba(214, 175, 102, 0.09)"
              strokeWidth="0.8"
            />

            {Array.from({
              length: 24,
            }).map((_, idx) => {
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

        {/* Center aura */}
        <div className="dna-center-aura" aria-hidden="true" />

        {/* Only render the viewport if there are real images */}
        {hasImages && (
          <div className="dna-viewport-3d">
            {displayList.map((item, i) => {
              const isActive = i === activeIndex;

              return (
                <div
                  key={item.uniqueKey}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className={`dna-artifact-node ${
                    isActive ? "active-hero" : "inactive-node"
                  }`}
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
                  <div className="dna-photo-card">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="dna-photo-img"
                      loading={isActive ? "eager" : "lazy"}
                      draggable="false"
                      onError={() => handleImageError(item)}
                    />

                    <div className="dna-photo-glare" aria-hidden="true" />

                    <div className="dna-photo-border" aria-hidden="true" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Optional loading state */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Bottom divider */}
      <div className="dna-bottom-divider" aria-hidden="true" />
    </section>
  );
}
