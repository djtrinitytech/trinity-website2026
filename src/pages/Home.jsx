import React, { useState } from "react";
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

const orders = [
  {
    name: "Sindhu",
    artifact: "Sindhu",
    dept: "Comps",
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
    dept: "IT",
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
    dept: "Cseds",
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
    dept: "Allied",
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
    dept: "Extc",
    cue: "AS AAROHAN",
    color: "#5f86a6",
    glyph: "✧",
    className: "aarohan",
    image: aarohanImg,
    blurb: "We explore beyond the known.",
  },
  {
    name: "Kshatra",
    artifact: "Kshatra",
    dept: "Mech",
    cue: "AS KSHATRA",
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
    const ordersEl = document.getElementById("orders");
    if (ordersEl) {
      ordersEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
