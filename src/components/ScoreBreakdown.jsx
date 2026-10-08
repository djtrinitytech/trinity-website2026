import React from "react";

// Order matters: Technical, Cultural, Sports
const CATEGORIES = [
  { key: "technicalPoints", label: "Technical" },
  { key: "culturalPoints", label: "Cultural" },
  { key: "sportsPoints", label: "Sports" },
];

const ScoreBreakdown = ({ team }) => {
  return (
    <div className="w-full pt-2.5 pb-1.5 px-2 sm:px-4 border-t border-[#dc9d4a]/20 transition-all duration-500 ease-out">
      <div className="grid grid-cols-3 divide-x divide-[#dc9d4a]/20 items-center text-center py-2.5 sm:py-4 bg-[#0c0a07]/60 rounded-lg border border-[#dc9d4a]/15 backdrop-blur-sm">
        {CATEGORIES.map(({ key, label }) => (
          <div key={key} className="px-1.5 sm:px-3 flex flex-col items-center">
            <span
              className="text-[9px] sm:text-[11px] tracking-[0.28em] uppercase text-[#d9b47a]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {label}
            </span>
            <span aria-hidden="true" className="block w-6 h-px my-1.5 sm:my-2 bg-gradient-to-r from-transparent via-[#dc9d4a]/70 to-transparent" />
            <div
              className="text-lg sm:text-3xl tracking-tight text-[#f3e6cc]"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {team[key] || 0}
            </div>
            <span
              className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#a8957a] uppercase mt-0.5"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
