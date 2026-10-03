import React, { useState } from "react";
import { Link } from "react-router-dom";

// Artifact images from assets
import sindhuImg from "../assets/sindhu.png";
import aakarImg from "../assets/aakar.png";
import pragyaImg from "../assets/pragya.png";
import kshatraImg from "../assets/kshatra.png";
import aarohanImg from "../assets/aarohan.png";
import utkarshImg from "../assets/utkarsh.png";

const orders = [
  {
    name: "Sindhu",
    cue: "Rivers · oceans · trade",
    color: "#4b9c99",
    glyph: "≈",
    className: "sindhu",
    image: sindhuImg,
    blurb: "We are the flow that connects worlds.",
  },
  {
    name: "Aakar",
    cue: "Architecture · creation",
    color: "#b48b59",
    glyph: "⌂",
    className: "aakar",
    image: aakarImg,
    blurb: "We build what the world dreams of.",
  },
  {
    name: "Pragya",
    cue: "Knowledge · ideas",
    color: "#829a6c",
    glyph: "✦",
    className: "pragya",
    image: pragyaImg,
    blurb: "We seek, we learn, we illuminate.",
  },
  {
    name: "Utkarsh",
    cue: "Craft · prosperity",
    color: "#996b90",
    glyph: "▧",
    className: "utkarsh",
    image: utkarshImg,
    blurb: "We create abundance and beauty.",
  },
  {
    name: "Aarohan",
    cue: "Exploration · discovery",
    color: "#5f86a6",
    glyph: "✧",
    className: "aarohan",
    image: aarohanImg,
    blurb: "We explore beyond the known.",
  },
  {
    name: "Kshatra",
    cue: "Courage · protection",
    color: "#a65e57",
    glyph: "◈",
    className: "kshatra",
    image: kshatraImg,
    blurb: "We stand guard so others can thrive.",
  },
];

function Artifact({ order, scrollToOrders, onHoverChange }) {
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
          scrollToOrders();
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

  const scrollToOrders = () => {
    document.getElementById("orders")?.scrollIntoView({ behavior: "smooth" });
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
              scrollToOrders={scrollToOrders}
              onHoverChange={setIsPaused}
            />
          ))}
        </div>
      </main>

      <section id="orders" className="orders-section">
        <div className="section-intro">
          <div>
            <p className="kicker">The six orders</p>
            <h2>One story, told through six ways of seeing.</h2>
          </div>
          <p>
            Each order holds a distinct part of civilization in motion: currents,
            structures, ideas, courage, exploration, and craft.
          </p>
        </div>

        <div className="order-list">
          {orders.map((o, i) => (
            <article
              className="order-row"
              key={o.name}
              style={{ "--accent": o.color }}
            >
              <span className="order-num">0{i + 1}</span>
              <div className="row-glyph">{o.glyph}</div>
              <div className="order-main-info">
                <h3>{o.name}</h3>
                <p>{o.cue}</p>
              </div>
              <p className="order-blurb">{o.blurb}</p>
              <button
                type="button"
                onClick={scrollToOrders}
                aria-label={`Learn about ${o.name}`}
              >
                ↗
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="continuation">
        <div className="continuation-art">✣</div>
        <p className="kicker">The journey continues</p>
        <h2>
          Past, interpreted.
          <br />
          Future, imagined.
        </h2>
        <Link to="/announcements" className="continuation-link">
          View announcements <span className="arrow-icon">→</span>
        </Link>
      </section>
    </div>
  );
}
