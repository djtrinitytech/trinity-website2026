import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { contacts } from "../data/contacts";
import { TeamHero } from "../components/order/OrderSections";
import "./Teams.css";
import "./Contact.css";

const EASE = [0.2, 0.8, 0.2, 1];

// Constellation geometry in the scene's 1000 × 480 space. `links` = contacts a path belongs to
// (it brightens when either is hovered).
const PATHS = [
  { d: "M 342 99 C 410 103 456 120 500 142", links: ["dhruv", "prath"] },
  { d: "M 658 99 C 590 103 544 120 500 142", links: ["aadi", "prath"] },
  { d: "M 500 142 L 500 190", links: ["prath", "dhruv", "aadi"] },
  { d: "M 376 302 C 340 327 312 346 302 370", links: ["prath", "nandish"] },
  { d: "M 624 302 C 660 327 688 346 698 370", links: ["prath", "aditya"] },
  { d: "M 428 434 Q 500 458 572 434", links: ["nandish", "aditya"] },
];

const NODES = [
  [342, 99],
  [658, 99],
  [376, 302],
  [624, 302],
  [302, 370],
  [698, 370],
];

function starPath(cx, cy, r) {
  const i = r * 0.28;
  return `M${cx} ${cy - r} L${cx + i} ${cy - i} L${cx + r} ${cy} L${cx + i} ${cy + i} L${cx} ${cy + r} L${cx - i} ${cy + i} L${cx - r} ${cy} L${cx - i} ${cy - i} Z`;
}

function Constellation({ active, reduce }) {
  const draw = (i) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { pathLength: { duration: 1.2, ease: EASE, delay: 1.45 + i * 0.12 }, opacity: { duration: 0.3, delay: 1.45 + i * 0.12 } },
        };
  const fade = (delay) =>
    reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1.4, delay } };

  return (
    <svg className="ct-geometry" viewBox="0 0 1000 480" aria-hidden="true">
      {/* outer orbits encircling the whole council */}
      <motion.g {...fade(0.6)}>
        <ellipse cx="500" cy="250" rx="380" ry="211" className="ct-orbit" />
        <ellipse cx="500" cy="250" rx="270" ry="139" className="ct-orbit faint" />
        <circle cx="500" cy="142" r="16" className="ct-orbit faint" />
      </motion.g>

      {PATHS.map((p, i) => (
        <motion.path
          key={p.d}
          d={p.d}
          className={`ct-link ${active && p.links.includes(active) ? "is-active" : ""}`}
          {...draw(i)}
        />
      ))}

      <motion.g {...fade(1.9)}>
        {NODES.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" className="ct-node" />
        ))}
      </motion.g>

      {/* the central star between the upper pair and the chairperson */}
      <motion.path
        d={starPath(500, 142, 9)}
        className={`ct-star ${active ? "is-active" : ""}`}
        initial={reduce ? false : { opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
    </svg>
  );
}

const ENTRY = {
  center: { opacity: 0, scale: 0.97 },
  left: { opacity: 0, x: -36 },
  right: { opacity: 0, x: 36 },
  below: { opacity: 0, y: 30 },
};

function Plaque({ c, index, onHover, reduce }) {
  const delay = c.primary ? 0.6 : c.from === "below" ? 1.15 : 0.9;
  return (
    <div
      className={`ct-slot ${c.primary ? "is-primary" : ""}`}
      style={{ "--x": `${c.x / 10}%`, "--y": `${(c.y / 480) * 100}%`, "--order": index }}
    >
      <motion.div
        initial={reduce ? false : ENTRY[c.primary ? "center" : c.from]}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: EASE, delay }}
      >
        <a
          href={c.tel}
          className="ct-plaque"
          aria-label={`Call ${c.name}, ${c.designation}, ${c.phone}`}
          onMouseEnter={() => onHover(c.id)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(c.id)}
          onBlur={() => onHover(null)}
        >
          <span className="ct-corner tl" aria-hidden="true" />
          <span className="ct-corner tr" aria-hidden="true" />
          <span className="ct-corner bl" aria-hidden="true" />
          <span className="ct-corner br" aria-hidden="true" />
          <svg className="ct-plaque-star" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 0 L12.3 7.7 L20 10 L12.3 12.3 L10 20 L7.7 12.3 L0 10 L7.7 7.7 Z" />
          </svg>
          <span className="ct-role">{c.designation}</span>
          <span className="ct-name">{c.name}</span>
          <span className="ct-phone">{c.phone}</span>
          <span className="ct-call" aria-hidden="true">
            Call <span>→</span>
          </span>
        </a>
      </motion.div>
    </div>
  );
}

const Contact = () => {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(null);

  return (
    <div className="ct-page">
      <TeamHero sanskrit="संपर्क" title="Contact the Team" tagline="The line remains open" className="ct-hero" />

      <section className="ct-stage" aria-label="Council contacts">
        <Constellation active={active} reduce={reduce} />
        {contacts.map((c, i) => (
          <Plaque key={c.id} c={c} index={i} onHover={setActive} reduce={reduce} />
        ))}
      </section>
    </div>
  );
};

export default Contact;
