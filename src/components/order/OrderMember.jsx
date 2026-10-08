import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import AstronomicalFrame from "./AstronomicalFrame";

const EASE = [0.2, 0.8, 0.2, 1];

// One "star" of the constellation: glow + astrolabe frame + transparent portrait (+ optional label).
export default function OrderMember({ member, size = "md", delay = 0, eager = false, showLabel = true, inView = true }) {
  const reduce = useReducedMotion();
  const animateProp = inView ? "show" : undefined;
  const whileInView = inView ? undefined : "show";

  return (
    <motion.figure
      className={`om-member om-${size}`}
      initial={reduce ? false : "hidden"}
      animate={reduce ? undefined : animateProp}
      whileInView={reduce ? undefined : whileInView}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="om-stage">
        <motion.div
          className="om-glow"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1.4, delay: delay + 0.2 } } }}
        />
        <motion.div
          className="om-frame-wrap"
          variants={{
            hidden: { opacity: 0, scale: 0.97 },
            show: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE, delay } },
          }}
        >
          <AstronomicalFrame />
        </motion.div>
        <motion.div
          className="om-portrait-wrap"
          variants={{
            hidden: { opacity: 0, y: 40, scale: 0.96 },
            show: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.1, ease: EASE, delay: delay + 0.25 } },
          }}
        >
          <img
            src={member.image}
            alt={`${member.name} — ${member.designation}`}
            width="592"
            height="900"
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : undefined}
            decoding="async"
            className="om-portrait"
            draggable="false"
          />
        </motion.div>
      </div>

      {showLabel && (
        <motion.figcaption
          className="om-caption"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: delay + 0.55 } } }}
        >
          <span className="om-name">{member.name}</span>
          <span className="om-role">{member.designation}</span>
        </motion.figcaption>
      )}
    </motion.figure>
  );
}
