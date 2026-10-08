import bgImage from "../assets/homepage/bg.png";
import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import DiscCascadeCarousel from "../components/disc-cascade-carousel.jsx";
import AdminPanel from "../components/admin-panel.jsx";
import { ChevronLeft, ChevronRight, X, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Group gallery2 rows by event_id.
// One unique event_id = one disc.
// Multiple photos belonging to the same event are shown inside that disc.
// ─────────────────────────────────────────────────────────────────────────────

function groupGallery2ByEvent(rows) {
  if (!rows || rows.length === 0) return [];

  const eventMap = new Map();

  for (const row of rows) {
    const eventId = String(row.event_id || "default-event");

    let eventGroup = eventMap.get(eventId);

    if (!eventGroup) {
      // Parse palette if it arrives as JSON from Supabase
      let parsedPalette = ["#1b1d1f", "#e8572b", "#f0c94c"];

      if (Array.isArray(row.event_palette) && row.event_palette.length === 3) {
        parsedPalette = row.event_palette;
      } else if (typeof row.event_palette === "string") {
        try {
          const parsed = JSON.parse(row.event_palette);

          if (Array.isArray(parsed) && parsed.length === 3) {
            parsedPalette = parsed;
          }
        } catch {
          // Keep default palette
        }
      }

      eventGroup = {
        id: eventId,

        // These values now come ONLY from Supabase.
        title: row.event_title || row.photo_title || "Gallery Event",

        subtitle: row.event_subtitle || "Trinity Gallery Collection",

        year:
          row.event_year ||
          (row.created_at
            ? new Date(row.created_at).getFullYear().toString()
            : new Date().getFullYear().toString()),

        pattern: row.event_pattern || "sunburst",

        palette: parsedPalette,

        // Disc image comes from Supabase.
        // No stock/fallback image.
        coverImage: row.event_cover_image || row.photo_url || "",

        photos: [],
      };

      eventMap.set(eventId, eventGroup);
    } else {
      // If the first row didn't have a cover image,
      // use one from another row belonging to the same event.
      if (!eventGroup.coverImage && (row.event_cover_image || row.photo_url)) {
        eventGroup.coverImage = row.event_cover_image || row.photo_url;
      }
    }

    // Add the photo to this event.
    const photoUrl = row.photo_url || row.event_cover_image;

    if (photoUrl) {
      eventGroup.photos.push({
        id: row.id || `${eventId}-photo-${eventGroup.photos.length}`,

        src: photoUrl,

        title:
          row.photo_title ||
          row.event_title ||
          `Photo ${eventGroup.photos.length + 1}`,

        date:
          row.photo_date ||
          (row.created_at
            ? new Date(row.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
            : ""),

        location: row.photo_location || "Gallery Trinity",

        eventId,

        eventName: row.event_title || eventGroup.title,

        frameStyle: row.frame_style || "baroque-gold",
      });
    }
  }

  return Array.from(eventMap.values());
}

// ─────────────────────────────────────────────────────────────────────────────
// Photo Gallery Modal
// ─────────────────────────────────────────────────────────────────────────────

function PhotoGalleryModal({ event, onClose }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const currentPhoto = lightboxIdx !== null ? event.photos[lightboxIdx] : null;

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
  };

  const closeLightbox = () => {
    setLightboxIdx(null);
  };

  const prev = () => {
    setLightboxIdx((i) =>
      i != null && i > 0 ? i - 1 : event.photos.length - 1,
    );
  };

  const next = () => {
    setLightboxIdx((i) =>
      i != null && i < event.photos.length - 1 ? i + 1 : 0,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[#080b12]/95 backdrop-blur-xl flex flex-col overflow-hidden"
      style={{
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-amber-500/15 flex-shrink-0 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-all cursor-pointer font-mono text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.15)] flex-shrink-0"
            title="Return to Gallery Discs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Discs</span>
          </button>

          <div className="min-w-0">
            <h2
              className="text-xl font-bold tracking-widest uppercase text-amber-100 truncate"
              style={{
                fontFamily: "'Cinzel', serif",
              }}
            >
              {event.title}
            </h2>

            <p className="text-[10px] text-amber-400/60 font-mono uppercase tracking-[0.3em] mt-0.5 truncate">
              {event.subtitle} · {event.year} · {event.photos.length} Photos
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer flex-shrink-0"
          title="Close and return to gallery"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Photo Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {event.photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <span className="text-4xl">📀</span>
            </div>

            <p className="text-slate-400 font-mono text-sm">
              No photos in this event yet.
            </p>

            <p className="text-slate-600 text-xs">
              Ask an admin to add some photos!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {event.photos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: idx * 0.03,
                }}
                className="group relative cursor-pointer aspect-square rounded-lg overflow-hidden border border-slate-700/50 hover:border-amber-500/40 transition-all shadow-md"
                onClick={() => openLightbox(idx)}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6"
            style={{
              background:
                "radial-gradient(ellipse at center, #1a0e04cc 0%, #000000f0 100%)",
              backdropFilter: "blur(18px)",
            }}
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700 cursor-pointer z-20"
              onClick={closeLightbox}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Previous */}
            <button
              className="absolute left-3 sm:left-6 p-3 rounded-full bg-slate-900/70 text-amber-300 hover:bg-amber-900/50 border border-amber-700/40 cursor-pointer z-20 transition-all hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIdx}
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -16,
                scale: 0.98,
              }}
              transition={{
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col items-center w-full"
              style={{
                maxWidth: "min(90vw, 800px)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full bg-[#030712] rounded-xl overflow-hidden shadow-2xl border border-slate-800/80">
                <div
                  className="relative w-full bg-black flex items-center justify-center"
                  style={{
                    maxHeight: "75vh",
                  }}
                >
                  <img
                    src={currentPhoto.src}
                    alt={currentPhoto.title}
                    className="w-auto h-auto max-w-full max-h-[75vh] object-contain"
                  />
                </div>

                {/* Info Bar */}
                <div className="w-full px-6 py-4 bg-[#0a0f1c] flex items-center justify-between gap-4 border-t border-slate-800/80">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-lg font-medium truncate text-amber-50"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      {currentPhoto.title}
                    </h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {currentPhoto.date && (
                        <span className="text-xs text-slate-400 font-mono tracking-wide">
                          {currentPhoto.date}
                        </span>
                      )}

                      {currentPhoto.location && (
                        <span className="text-xs text-slate-400 font-mono tracking-wide">
                          · {currentPhoto.location}
                        </span>
                      )}

                      <span className="text-xs text-slate-500 font-mono tracking-wide ml-auto">
                        {event.title}
                      </span>
                    </div>
                  </div>

                  {/* Counter */}
                  <div className="flex-shrink-0 text-right">
                    <div
                      className="text-xl font-light text-amber-500/80"
                      style={{
                        fontFamily: "'Cinzel', serif",
                      }}
                    >
                      {lightboxIdx + 1}
                      <span className="text-sm text-slate-600 ml-1">
                        / {event.photos.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Next */}
            <button
              className="absolute right-3 sm:right-6 p-3 rounded-full bg-slate-900/70 text-amber-300 hover:bg-amber-900/50 border border-amber-700/40 cursor-pointer z-20 transition-all hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Gallery Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Gallery() {
  // IMPORTANT:
  // Start with an empty array.
  // There are NO hardcoded/stock gallery events anymore.
  const [eventsData, setEventsData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [openEventId, setOpenEventId] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // Open admin panel if ?admin=true is in URL
  useEffect(() => {
    if (searchParams.get("admin") === "true") {
      setIsAdminOpen(true);

      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch ONLY from Supabase
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true;

    async function fetchGalleryData() {
      try {
        setLoading(true);

        const { data, error: supabaseError } = await supabase
          .from("gallery2")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

        if (supabaseError) {
          throw supabaseError;
        }

        if (!isMounted) return;

        if (data && data.length > 0) {
          const grouped = groupGallery2ByEvent(data);

          setEventsData(grouped);
        } else {
          // No Supabase data = no discs.
          setEventsData([]);
        }
      } catch (err) {
        console.error("Error fetching from Supabase gallery2:", err);

        // IMPORTANT:
        // Never fall back to stock/demo images.
        setEventsData([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchGalleryData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateEvents = useCallback((updated) => {
    setEventsData(updated);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Convert Supabase events into carousel discs
  // ─────────────────────────────────────────────────────────────────────────

  const uniqueDiscCascadeItems = eventsData.map((ev) => ({
    title: ev.title,

    pattern: ev.pattern,

    palette: ev.palette,

    eventId: ev.id,

    // This is the actual Supabase image.
    src: ev.coverImage,

    credits: [
      {
        label: "EVENT YEAR",
        value: ev.year,
      },
      {
        label: "COLLECTION",
        value: ev.subtitle,
      },
      {
        label: "PHOTOS",
        value: `${ev.photos.length} Captured Shots`,
      },
    ],

    reviews: [
      {
        source: "TRINITY ARCHIVES",
        quote: `Relive ${ev.title} memories in full high-definition.`,
      },
    ],
  }));

  // ─────────────────────────────────────────────────────────────────────────
  // Repeat ONLY the discs that actually exist in Supabase.
  //
  // Example:
  //
  // Supabase has:
  // A, B
  //
  // Carousel visually becomes:
  // A, B, A, B, A, B
  //
  // It does NOT create new/stock discs.
  // ─────────────────────────────────────────────────────────────────────────

  let discCascadeItems = [];

  if (uniqueDiscCascadeItems.length > 0) {
    if (uniqueDiscCascadeItems.length >= 6) {
      discCascadeItems = uniqueDiscCascadeItems;
    } else {
      const minVisualCount = 6;

      while (discCascadeItems.length < minVisualCount) {
        discCascadeItems = [...discCascadeItems, ...uniqueDiscCascadeItems];
      }
    }
  }

  const openEventForId = eventsData.find((e) => e.id === openEventId) ?? null;

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url('/bg-map.jpg')",
          }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col w-full h-full overflow-hidden">
        {/* DISCS CAROUSEL */}
        <div className="flex-1 w-full relative overflow-hidden flex flex-col justify-center">
          <DiscCascadeCarousel
            items={discCascadeItems}
            height="100vh"
            discSize="clamp(190px, min(48vmin, 36vw), 380px)"
            spacing={1.05}
            rise={0.22}
            depth={0.45}
            yaw={24}
            fan={-12}
            tilt={-5}
            roll={110}
            spin={18}
            sheen={0.65}
            bounce={0.25}
            duration={0.85}
            loop={true}
            autoplay={4500}
            brand=""
            hint="DRAG OR SWIPE · CLICK ACTIVE DISC TO VIEW PHOTOS"
            background="transparent"
            color="#f59e0b"
            serif='"Cinzel", "Palatino Linotype", serif'
            sans='"Outfit", sans-serif'
            display='"Cinzel Decorative", "Palatino Linotype", serif'
            totalCount={uniqueDiscCascadeItems.length}
            onSelect={(item) => {
              const eventId = item?.eventId;

              if (eventId) {
                setOpenEventId(eventId);
              }
            }}
          />

          {/* Loading */}
          {loading && (
            <div className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-400 flex items-center gap-2 text-xs font-mono backdrop-blur-md">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Updating from Supabase...
            </div>
          )}
        </div>
      </div>

      {/* PHOTO GALLERY MODAL */}
      <AnimatePresence>
        {openEventId && openEventForId && (
          <PhotoGalleryModal
            event={openEventForId}
            onClose={() => setOpenEventId(null)}
          />
        )}
      </AnimatePresence>

      {/* ADMIN PANEL */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            events={eventsData}
            onUpdateEvents={handleUpdateEvents}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
