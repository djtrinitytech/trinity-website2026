import React from "react";
import TeamLogo from "./TeamLogo";
import ScoreBreakdown from "./ScoreBreakdown";

const RankBadge = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#ffd700] via-[#dc9d4a] to-[#996515] text-[#050b18] font-black text-sm sm:text-base shadow-[0_0_12px_rgba(255,215,0,0.6)] border border-[#fff5c0] shrink-0">
        <span>1</span>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#e2e8f0] via-[#94a3b8] to-[#475569] text-[#050b18] font-black text-xs sm:text-sm shadow-[0_0_10px_rgba(148,163,184,0.4)] border border-slate-200 shrink-0">
        <span>2</span>
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#f97316] via-[#c2410c] to-[#7c2d12] text-amber-100 font-black text-xs sm:text-sm shadow-[0_0_10px_rgba(249,115,22,0.4)] border border-amber-400 shrink-0">
        <span>3</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#120e09] text-[#dc9d4a] font-bold text-xs sm:text-sm border border-[#dc9d4a]/40 shrink-0">
      <span>{rank}</span>
    </div>
  );
};

const LeaderboardCard = ({ team, isExpanded, onToggleExpand }) => {
  const primaryColor = team.theme.primary;
  const total = team.totalPoints;

  return (
    <div
      id={`team-card-${team.id}`}
      className={`relative w-full rounded-xl sm:rounded-2xl transition-all duration-300 overflow-hidden border backdrop-blur-md group ${
        isExpanded
          ? "bg-[#1a140d]/92 border-[#dc9d4a]/70 shadow-[0_8px_25px_rgba(0,0,0,0.7)]"
          : "bg-[#130f0a]/82 border-[#dc9d4a]/25 hover:border-[#dc9d4a]/50 hover:bg-[#1a140d]/90 shadow-md"
      }`}
      style={{
        boxShadow: isExpanded ? `0 0 20px ${team.theme.glow}` : undefined,
      }}
    >
      {/* Background Team Atmosphere Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${team.theme.atmosphere} opacity-30 pointer-events-none transition-opacity duration-300 group-hover:opacity-50`}
      />

      {/* Ornate Gold Corner Details */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#dc9d4a]/60 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#dc9d4a]/60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#dc9d4a]/60 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#dc9d4a]/60 pointer-events-none" />

      {/* Main Card Header (Compact Padding) */}
      <div
        onClick={onToggleExpand}
        className="relative z-10 flex items-center justify-between p-2.5 sm:p-3.5 cursor-pointer select-none gap-2 sm:gap-4"
      >
        {/* Left Section: [ RANK ] + [ TEAM LOGO ] + [ TEAM NAME ] */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <RankBadge rank={team.rank} />

          <TeamLogo team={team} className="w-8 h-8 sm:w-11 sm:h-11 shrink-0" />

          <div className="flex flex-col min-w-0">
            <h3
              className="text-base sm:text-xl font-extrabold tracking-wider truncate uppercase transition-colors duration-200"
              style={{
                color: isExpanded ? primaryColor : "#f3f4f6",
                textShadow: isExpanded ? `0 0 10px ${primaryColor}` : "none",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {team.name}
            </h3>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium truncate hidden sm:inline-block">
              {team.tagline}
            </span>
          </div>
        </div>

        {/* Right Section: [ TOTAL PTS ] + [ CHEVRON ] */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1">
              <span
                className="text-lg sm:text-2xl font-black tracking-tight text-[#fde047] drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {total}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-[#dc9d4a] uppercase tracking-wider">
                PTS
              </span>
            </div>
          </div>

          <div className="p-1 sm:p-1.5 rounded-full bg-[#0c0a07]/60 border border-[#dc9d4a]/30 text-[#dc9d4a] transition-transform duration-300 group-hover:scale-110">
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            >
              <path d="M4 6.5 8 10.5 12 6.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown (Rendered when expanded) */}
      {isExpanded && <ScoreBreakdown team={team} />}
    </div>
  );
};

export default LeaderboardCard;
