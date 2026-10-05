import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DiscCascadeCarousel, { type DiscCascadeItem } from "../components/disc-cascade-carousel";
import AdminPanel from "../components/admin-panel";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type EventPhoto = {
  id: string;
  src: string;
  title: string;
  date: string;
  location: string;
  eventId: string;
  eventName: string;
  frameStyle?: "baroque-gold" | "burnt-mahogany" | "broken-victorian" | "chipped-wood";
};

export type EventCategory = {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  pattern: "sunburst" | "rings" | "halftone" | "horizon" | "stripes" | "eclipse" | "mosaic";
  palette: [string, string, string];
  coverImage?: string;
  photos: EventPhoto[];
};

// Event Categories Default Data
const DEFAULT_EVENTS_DATA: EventCategory[] = [
  {
    id: "freshers",
    title: "FRESHERS '25",
    subtitle: "The Genesis & Night of Lights",
    year: "2025",
    pattern: "sunburst",
    palette: ["#1b1d1f", "#e8572b", "#f0c94c"],
    coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop",
    photos: []
  },
  {
    id: "trinity",
    title: "TRINITY FEST",
    subtitle: "Annual Flagship Cultural Extravaganza",
    year: "2025",
    pattern: "eclipse",
    palette: ["#141414", "#e9e4da", "#c8a24a"],
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    photos: []
  },
  {
    id: "carnival",
    title: "CARNIVAL",
    subtitle: "Street Food, Games & Rides",
    year: "2025",
    pattern: "mosaic",
    palette: ["#f2e3c6", "#d2452b", "#2a5d8f"],
    coverImage: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=800&auto=format&fit=crop",
    photos: []
  },
  {
    id: "farewell",
    title: "FAREWELL NIGHT",
    subtitle: "A Nostalgic Toast to the Graduates",
    year: "2024",
    pattern: "horizon",
    palette: ["#2d3f7a", "#e8b4c8", "#f4efe6"],
    coverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop",
    photos: []
  },
  {
    id: "sports",
    title: "SPORTS MEET",
    subtitle: "Championship Glory & Athletics",
    year: "2024",
    pattern: "stripes",
    palette: ["#d9e3df", "#16443f", "#f08a5d"],
    coverImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop",
    photos: []
  },
  {
    id: "cultural",
    title: "CULTURAL EVE",
    subtitle: "Dances, Drama & Fashion Runway",
    year: "2024",
    pattern: "rings",
    palette: ["#e9e6df", "#1d1d1d", "#d84b3c"],
    coverImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
    photos: []
  }
];

// Persistence helpers
const EVENTS_STORAGE_KEY = "gallery_trinity_events";
function loadStoredEvents(): EventCategory[] {
  try {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return DEFAULT_EVENTS_DATA;
}

// ── Photo Gallery Modal ──────────────────────────────────────────────────────
function PhotoGalleryModal({
  event,
  onClose,
}: {
  event: EventCategory;
  onClose: () => void;
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const currentPhoto = lightboxIdx !== null ? event.photos[lightboxIdx] : null;

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prev = () => setLightboxIdx((i) => (i != null && i > 0 ? i - 1 : event.photos.length - 1));
  const next = () => setLightboxIdx((i) => (i != null && i < event.photos.length - 1 ? i + 1 : 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[#080b12]/95 backdrop-blur-xl flex flex-col overflow-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-amber-500/15 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-widest uppercase text-amber-100" style={{ fontFamily: "'Cinzel', serif" }}>
            {event.title}
          </h2>
          <p className="text-[10px] text-amber-400/60 font-mono uppercase tracking-[0.3em] mt-0.5">
            {event.subtitle} · {event.year} · {event.photos.length} Photos
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Photo Grid / Empty State */}
      <div className="flex-1 overflow-y-auto p-6">
        {event.photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <span className="text-4xl">📀</span>
            </div>
            <p className="text-slate-400 font-mono text-sm">No photos in this event yet.</p>
            <p className="text-slate-600 text-xs">Ask an admin to add some photos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {event.photos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="group relative cursor-pointer aspect-square rounded-lg overflow-hidden border border-slate-700/50 hover:border-amber-500/40 transition-all shadow-md"
                onClick={() => openLightbox(idx)}
              >
                <img src={photo.src} alt={photo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── PREMIUM FRAMED LIGHTBOX ──────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIdx !== null && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6"
            style={{ background: "radial-gradient(ellipse at center, #1a0e04cc 0%, #000000f0 100%)", backdropFilter: "blur(18px)" }}
            onClick={closeLightbox}
          >
            {/* Close */}
            <button className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700 cursor-pointer z-20" onClick={closeLightbox}>
              <X className="w-5 h-5" />
            </button>

            {/* Prev */}
            <button className="absolute left-3 sm:left-6 p-3 rounded-full bg-slate-900/70 text-amber-300 hover:bg-amber-900/50 border border-amber-700/40 cursor-pointer z-20 transition-all hover:scale-110" onClick={(e) => { e.stopPropagation(); prev(); }}>
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Framed image + info card */}
            <motion.div
              key={lightboxIdx}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center w-full"
              style={{ maxWidth: "min(90vw, 800px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Clean Gallery Frame */}
              <div className="w-full bg-[#030712] rounded-xl overflow-hidden shadow-2xl border border-slate-800/80">
                {/* Photo Area */}
                <div className="relative w-full bg-black flex items-center justify-center" style={{ maxHeight: "75vh" }}>
                  <img src={currentPhoto.src} alt={currentPhoto.title} className="w-auto h-auto max-w-full max-h-[75vh] object-contain" />
                </div>
                
                {/* Info Bar */}
                <div className="w-full px-6 py-4 bg-[#0a0f1c] flex items-center justify-between gap-4 border-t border-slate-800/80">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium truncate text-amber-50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {currentPhoto.title}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {currentPhoto.date && (
                        <span className="text-xs text-slate-400 font-mono tracking-wide">{currentPhoto.date}</span>
                      )}
                      {currentPhoto.location && (
                        <span className="text-xs text-slate-400 font-mono tracking-wide">· {currentPhoto.location}</span>
                      )}
                      <span className="text-xs text-slate-500 font-mono tracking-wide ml-auto">
                        {event.title}
                      </span>
                    </div>
                  </div>
                  {/* Counter */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xl font-light text-amber-500/80" style={{ fontFamily: "'Cinzel', serif" }}>
                      {lightboxIdx + 1}
                      <span className="text-sm text-slate-600 ml-1">/ {event.photos.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Next */}
            <button className="absolute right-3 sm:right-6 p-3 rounded-full bg-slate-900/70 text-amber-300 hover:bg-amber-900/50 border border-amber-700/40 cursor-pointer z-20 transition-all hover:scale-110" onClick={(e) => { e.stopPropagation(); next(); }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


// ── Main Gallery Page ─────────────────────────────────────────────────────────────────
export default function Gallery() {
  const [eventsData, setEventsData] = useState<EventCategory[]>(loadStoredEvents);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [openEventId, setOpenEventId] = useState<string | null>(null);

  // Persist events on change
  const handleUpdateEvents = useCallback((updated: EventCategory[]) => {
    setEventsData(updated);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
  }, []);

  // Map eventsData to DiscCascadeItem format
  const discCascadeItems: DiscCascadeItem[] = eventsData.map((ev) => ({
    title: ev.title,
    pattern: ev.pattern,
    palette: ev.palette,
    eventId: ev.id,
    src: ev.coverImage,
    credits: [
      { label: "EVENT YEAR", value: ev.year },
      { label: "COLLECTION", value: ev.subtitle },
      { label: "PHOTOS", value: `${ev.photos.length} Captured Shots` }
    ],
    reviews: [
      { source: "TRINITY ARCHIVES", quote: `Relive ${ev.title} memories in full high-definition.` }
    ]
  }));

  const openEventForId = eventsData.find((e) => e.id === openEventId) ?? null;

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      
      {/* FLOATING ADMIN BUTTON */}
      <button 
        onClick={() => setIsAdminOpen(true)}
        className="fixed top-24 right-6 z-40 px-4 py-2 bg-[#0a1226]/80 backdrop-blur-md border border-[#dc9d4a]/30 text-[#dc9d4a] rounded-xl hover:bg-[#dc9d4a]/20 transition-all duration-300 shadow-[0_0_15px_rgba(220,157,74,0.15)]"
        style={{ fontFamily: "'Reggae One', cursive" }}
      >
        Admin
      </button>

      {/* ── BACKGROUND IMAGE ─────────────────────────── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: "url('/bg-map.jpg')" }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col w-full h-full overflow-hidden">
        {/* DISCS CAROUSEL VIEW */}
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
            onSelect={(item) => {
              const eventId = (item as DiscCascadeItem & { eventId?: string }).eventId;
              if (eventId) setOpenEventId(eventId);
            }}
          />
        </div>
      </div>

      {/* ── PHOTO GALLERY MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {openEventId && openEventForId && (
          <PhotoGalleryModal
            event={openEventForId}
            onClose={() => setOpenEventId(null)}
          />
        )}
      </AnimatePresence>

      {/* ── ADMIN PANEL FULL-SCREEN ────────────────────────────────────── */}
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
