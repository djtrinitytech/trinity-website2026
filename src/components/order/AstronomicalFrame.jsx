import React from "react";

// Reusable astrolabe-style frame drawn in a 300×420 box. The portrait sits inside the arch;
// all geometry stays outside the face area. Hover behaviour (ring rotation, travelling light,
// brightening) is driven from CSS on the parent .om-member.
const NODES = [200, 232, 308, 340]; // degrees on the outer orbit, clear of the arch top

function star(cx, cy, r) {
  const i = r * 0.28;
  return `M${cx} ${cy - r} L${cx + i} ${cy - i} L${cx + r} ${cy} L${cx + i} ${cy + i} L${cx} ${cy + r} L${cx - i} ${cy + i} L${cx - r} ${cy} L${cx - i} ${cy - i} Z`;
}

export default function AstronomicalFrame() {
  return (
    <svg className="om-frame" viewBox="0 0 300 420" aria-hidden="true">
      {/* outer orbit (rotates slowly on hover) */}
      <g className="om-orbit">
        <circle cx="150" cy="150" r="142" className="om-line faint" strokeDasharray="1 7" />
        {NODES.map((deg) => {
          const a = (deg * Math.PI) / 180;
          return <circle key={deg} cx={150 + Math.cos(a) * 142} cy={150 + Math.sin(a) * 142} r="2.2" className="om-node" />;
        })}
      </g>
      <circle cx="150" cy="150" r="132" className="om-line hair" />

      {/* travelling light around the orbit (visible on hover) */}
      <g className="om-light">
        <circle cx="150" cy="8" r="3" className="om-light-dot" />
      </g>

      {/* main arch + inner arch */}
      <path d="M30 404 V150 A120 120 0 0 1 270 150 V404" className="om-line main" />
      <path d="M42 398 V150 A108 108 0 0 1 258 150 V398" className="om-line hair" />

      {/* springing points of the arch */}
      <path d="M22 150 H38 M262 150 H278" className="om-line main" />
      <circle cx="30" cy="150" r="2.4" className="om-node" />
      <circle cx="270" cy="150" r="2.4" className="om-node" />

      {/* base */}
      <path d="M14 404 H126 M174 404 H286" className="om-line main" />
      <path d="M40 412 H118 M182 412 H260" className="om-line hair" />

      {/* stars */}
      <path d={star(150, 8, 8)} className="om-star" />
      <path d={star(150, 404, 9)} className="om-star" />
      <circle cx="150" cy="30" r="1.6" className="om-node" />
    </svg>
  );
}
