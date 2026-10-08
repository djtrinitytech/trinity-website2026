import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import OrderMember from "./OrderMember";

const EASE = [0.2, 0.8, 0.2, 1];

function useFade(delay, extra = {}) {
  const reduce = useReducedMotion();
  if (reduce) return { initial: false };
  return {
    initial: { opacity: 0, y: 16, ...extra.from },
    animate: { opacity: 1, y: 0, ...extra.to },
    transition: { duration: 0.9, ease: EASE, delay },
  };
}

function Star({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" className={`om-tiny-star ${className}`} aria-hidden="true">
      <path d="M10 0 L12.3 7.7 L20 10 L12.3 12.3 L10 20 L7.7 12.3 L0 10 L7.7 7.7 Z" />
    </svg>
  );
}

// Shared editorial heading (Teams, Contact). Defaults are the Teams page copy.
export function TeamHero({
  sanskrit = "समूहः शक्तिः",
  title = "The Order",
  tagline = "People behind the possibilities",
  className = "",
}) {
  const reduce = useReducedMotion();
  return (
    <header className={`om-hero ${className}`}>
      <motion.p className="om-sanskrit" lang="sa" {...useFade(0.05)}>
        {sanskrit}
      </motion.p>
      <motion.h1 className="om-title" {...useFade(0.18)}>
        {title}
      </motion.h1>
      <motion.p className="om-tagline" {...useFade(0.3)}>
        {tagline}
      </motion.p>
      <div className="om-divider" aria-hidden="true">
        <motion.span
          className="om-divider-line left"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.45 }}
        />
        <motion.span
          initial={reduce ? false : { opacity: 0, scale: 0.4, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
          className="om-divider-star"
        >
          <Star />
        </motion.span>
        <motion.span
          className="om-divider-line right"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.45 }}
        />
      </div>
    </header>
  );
}

export function ChairpersonFeature({ member }) {
  const reduce = useReducedMotion();
  return (
    <section className="om-chair" aria-label="Chairperson">
      <div className="om-chair-portrait">
        <OrderMember member={member} size="lg" delay={0.7} eager showLabel={false} inView />
        <motion.div className="om-chair-label" {...useFade(1.45)}>
          <span className="om-rule" aria-hidden="true" />
          <div>
            <p className="om-chair-name">{member.name}</p>
            <p className="om-role">{member.designation}</p>
          </div>
          <span className="om-rule" aria-hidden="true" />
        </motion.div>
      </div>

      <motion.aside
        className="om-panel"
        initial={reduce ? false : { opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 1.25 }}
      >
        <Star className="om-panel-star tl" />
        <Star className="om-panel-star br" />
        <p className="om-panel-kicker">{member.designation}</p>
        <span className="om-panel-rule" aria-hidden="true" />
        <p className="om-panel-quote">“{member.blurb}”</p>
        <p className="om-panel-foot">
          <span>I</span> The first star of the order
        </p>
      </motion.aside>
    </section>
  );
}

// A thin vertical constellation thread joining one tier to the next, with the tier's title.
export function TierHeading({ title }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="om-tier-heading"
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.9 }}
    >
      <span className="om-spine" aria-hidden="true" />
      <Star />
      <h2>{title}</h2>
    </motion.div>
  );
}

export function OrderRow({ tier }) {
  const { members, offsets, size } = tier;
  const n = members.length;
  const starY = 6;
  const height = Math.max(...offsets) + starY + 6;
  const pts = members.map((_, i) => [((i + 0.5) / n) * 1000, (offsets[i] || 0) + starY]);
  // gentle arcs between neighbouring top-stars — sits above the frames, never across faces
  const d = pts
    .slice(1)
    .map(([x, y], i) => {
      const [px, py] = pts[i];
      return `${i === 0 ? `M${px} ${py} ` : ""}Q${(px + x) / 2} ${Math.min(py, y) - 4} ${x} ${y}`;
    })
    .join(" ");

  return (
    <section className={`om-row om-row-${n}`} aria-label={tier.title}>
      {n > 1 && (
        <svg className="om-links" viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" style={{ height }} aria-hidden="true">
          <path d={d} vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {members.map((m, i) => (
        <div key={m.name} className="om-cell" style={{ "--om-offset": `${offsets[i] || 0}px` }}>
          <OrderMember member={m} size={size} delay={i * 0.18} inView={false} />
        </div>
      ))}
    </section>
  );
}

export function ConstellationDecoration() {
  return (
    <div className="om-deco" aria-hidden="true">
      <ul className="om-deco-col left" lang="hi">
        <li>विचार</li>
        <li>निर्माण</li>
        <li>समूह</li>
        <li>उत्कर्ष</li>
      </ul>
      <ul className="om-deco-col right">
        <li>People</li>
        <li>Ideas</li>
        <li>Events</li>
        <li>Impact</li>
      </ul>
    </div>
  );
}

export function ScrollIndicator() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`om-scroll ${visible ? "" : "is-hidden"}`} aria-hidden="true">
      <span className="om-scroll-line" />
      <span className="om-scroll-arrow">↓</span>
      <span className="om-scroll-label">Scroll</span>
    </div>
  );
}
