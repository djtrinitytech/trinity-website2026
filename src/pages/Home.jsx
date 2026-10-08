import React, { useEffect, useState } from "react";
import OrdersSection from "../components/homepage/OrdersSection";
import GallerySectionDNA from "../components/homepage/GallerySectionDNA";
import AboutSection from "../components/homepage/AboutSection";
import { ordersData } from "../data/ordersData";

// Artifact images from assets
import sindhuImg from "../assets/homepage/sindhu.png";
import aakarImg from "../assets/homepage/aakar.png";
import pragyaImg from "../assets/homepage/pragya.png";
import kshatraImg from "../assets/homepage/kshatra.png";
import aarohanImg from "../assets/homepage/aarohan.png";
import utkarshImg from "../assets/homepage/utkarsh.png";

const NAVBAR_H = 76;

// Scroll so the selected order's artifact sits at the viewport centre — the centre of the
// background's orbital rings — while keeping the section heading clear of the navbar.
function orderArtifactScrollTarget() {
  const ordersEl = document.getElementById("orders");
  const artifact = ordersEl?.querySelector(".hero-artifact-container");
  const header = ordersEl?.querySelector(".exhibition-header");
  const rect = artifact?.getBoundingClientRect();
  if (!rect || !rect.width || !header) return null; // mobile layout hides the large artifact stage
  const centred = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
  const headerLimit = window.scrollY + header.getBoundingClientRect().top - (NAVBAR_H + 12);
  return Math.round(Math.min(centred, headerLimit));
}

function scrollToOrderArtifact() {
  const ordersEl = document.getElementById("orders");
  if (!ordersEl) return;
  const target = orderArtifactScrollTarget();
  if (target === null) {
    ordersEl.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  window.scrollTo({ top: target, behavior: "smooth" });

  // Sections above can shift layout mid-scroll (scroll-driven animations), so re-measure
  // once the scroll settles and correct any small drift.
  let done = false;
  const correct = () => {
    if (done) return;
    done = true;
    window.removeEventListener("scrollend", correct);
    const next = orderArtifactScrollTarget();
    if (next !== null && Math.abs(next - window.scrollY) > 2) {
      window.scrollTo({ top: next, behavior: "smooth" });
    }
  };
  window.addEventListener("scrollend", correct, { once: true });
  setTimeout(correct, 1400); // browsers without scrollend
}

const orders = [
  {
    name: "Sindhu",
    artifact: "Sindhu",
    dept: "IT",
    cue: "AS SINDHU",
    color: "#4b9c99",
    glyph: "≈",
    className: "sindhu",
    image: sindhuImg,
    blurb: "We are the flow that connects worlds.",
  },
  {
    name: "Aakar",
    artifact: "Aakar",
    dept: "Comps",
    cue: "AS AAKAR",
    color: "#b48b59",
    glyph: "⌂",
    className: "aakar",
    image: aakarImg,
    blurb: "We build what the world dreams of.",
  },
  {
    name: "Pragya",
    artifact: "Pragya",
    dept: "Allied",
    cue: "AS PRAGYA",
    color: "#829a6c",
    glyph: "✦",
    className: "pragya",
    image: pragyaImg,
    blurb: "We seek, we learn, we illuminate.",
  },
  {
    name: "Utkarsh",
    artifact: "Utkarsh",
    dept: "EXTC",
    cue: "AS UTKARSH",
    color: "#996b90",
    glyph: "▧",
    className: "utkarsh",
    image: utkarshImg,
    blurb: "We create abundance and beauty.",
  },
  {
    name: "Aarohan",
    artifact: "Aarohan",
    dept: "DS",
    cue: "AS AAROHAN",
    color: "#5f86a6",
    glyph: "✧",
    className: "aarohan",
    image: aarohanImg,
    blurb: "We explore beyond the known.",
  },
  {
    name: "Shourya",
    artifact: "Shourya",
    dept: "Mech",
    cue: "AS SHOURYA",
    color: "#a65e57",
    glyph: "◈",
    className: "kshatra",
    image: kshatraImg,
    blurb: "We stand guard so others can thrive.",
  },
];

function Artifact({ order, onSelectArtifact, onHoverChange }) {
  return (
    <div
      className={`artifact-slot ${order.className}`}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <button
        type="button"
        className="artifact"
        style={{ "--accent": order.color }}
        onClick={(e) => {
          e.currentTarget.blur();
          onSelectArtifact(order.name);
        }}
        aria-label={`Explore ${order.name}: ${order.cue}`}
      >
        <span className="artifact-art">
          <img
            src={order.image}
            alt={`${order.name} Artifact`}
            className="artifact-img"
            draggable="false"
          />
        </span>
        <span className="artifact-label">{order.name}</span>
      </button>
    </div>
  );
}

export default function Home() {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);

  // Dim the fixed background as the visitor scrolls out of the hero (0 at top → 1 past the hero).
  // Drives .app-root:has(.homepage)::after in App.css.
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const heroH = document.querySelector(".homepage .hero")?.offsetHeight || window.innerHeight;
      const progress = Math.min(1, Math.max(0, (window.scrollY - heroH * 0.1) / (heroH * 0.6)));
      root.style.setProperty("--home-scroll-dim", progress.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.style.removeProperty("--home-scroll-dim");
    };
  }, []);

  const handleSelectArtifact = (orderName) => {
    const query = orderName.toLowerCase();
    const targetIdx = ordersData.findIndex(
      (o) =>
        o.name.toLowerCase() === query ||
        o.cue.toLowerCase() === query ||
        (o.artifact && o.artifact.toLowerCase() === query) ||
        (o.dept && o.dept.toLowerCase() === query)
    );
    if (targetIdx !== -1) {
      setSelectedOrderIndex(targetIdx);
    }
    scrollToOrderArtifact();
  };

  const scrollToOrders = () => {
    const ordersEl = document.getElementById("orders");
    if (ordersEl) {
      ordersEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="homepage">
      <main className="hero">
        <div className="hero-meta">
          <span>Six orders</span>
          <span>One civilization</span>
        </div>

        <p className="hero-count">Est. 2026'27 · 19° 04′ N</p>

        <section className="center-title">
          <p className="kicker">A living archive</p>
          <h1 lang="hi">अनुगाथा</h1>
          <div className="center-action">
            <p>
              A journey through
              <br />
              the pillars of civilization
            </p>
            <button
              type="button"
              className="explore"
              onClick={(e) => {
                e.currentTarget.blur();
                scrollToOrders();
              }}
            >
              Begin the passage <span className="arrow-icon">→</span>
            </button>
          </div>
        </section>

        <div className={`artifacts-orbit ${isPaused ? "paused" : ""}`}>
          {orders.map((o) => (
            <Artifact
              key={o.name}
              order={o}
              onSelectArtifact={handleSelectArtifact}
              onHoverChange={setIsPaused}
            />
          ))}
        </div>
      </main>

      {/* =================================================
          DNA CAROUSEL GALLERY ARCHIVE
      ================================================= */}
      <GallerySectionDNA />

      <OrdersSection
        selectedOrderIndex={selectedOrderIndex}
        onSelectOrder={setSelectedOrderIndex}
      />

      {/* =================================================
          ABOUT US — THE FINAL CHAPTER OF THE ARCHIVE
      ================================================= */}
      <AboutSection />
    </div>
  );
}
