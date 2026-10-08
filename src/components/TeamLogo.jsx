import React, { useState } from "react";

// Royal SVG Emblem Fallbacks for the 6 Teams
const RoyalEmblem = ({ teamId, color }) => {
  switch (teamId) {
    case "sindhu":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(0,210,255,0.6)]">
          <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
          <path d="M50 15 L50 85 M35 30 C35 55 65 55 65 30 M25 45 C25 65 75 65 75 45" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="50,10 44,22 56,22" fill={color} />
          <polygon points="35,25 30,35 40,35" fill={color} />
          <polygon points="65,25 60,35 70,35" fill={color} />
        </svg>
      );

    case "aakar":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,159,28,0.6)]">
          <polygon points="50,12 88,40 88,88 12,88 12,40" fill="none" stroke={color} strokeWidth="2.5" />
          <path d="M25 88 A 25 25 0 0 1 75 88" fill="none" stroke={color} strokeWidth="3" />
          <circle cx="50" cy="45" r="14" fill="none" stroke={color} strokeWidth="2.5" />
          <polygon points="50,22 54,34 66,34 56,42 60,54 50,46 40,54 44,42 34,34 46,34" fill={color} />
        </svg>
      );

    case "pragya":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="2" />
          <path d="M50 20 L50 80 M20 50 L80 50" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
          <path d="M50 30 Q 30 50 50 70 Q 70 50 50 30 Z" fill="none" stroke={color} strokeWidth="3" />
          <path d="M30 50 Q 50 30 70 50 Q 50 70 30 50 Z" fill="none" stroke={color} strokeWidth="3" />
          <circle cx="50" cy="50" r="8" fill={color} />
        </svg>
      );

    case "kshatra":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">
          <path d="M50 10 L82 25 V55 C82 72 50 90 50 90 C50 90 18 72 18 55 V25 Z" fill="none" stroke={color} strokeWidth="3" />
          <path d="M30 30 L70 70 M70 30 L30 70" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="50,30 55,42 50,48 45,42" fill={color} />
        </svg>
      );

    case "aarohan":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(20,184,166,0.6)]">
          <polygon points="50,15 85,82 15,82" fill="none" stroke={color} strokeWidth="3" />
          <polygon points="50,35 72,75 28,75" fill="none" stroke={color} strokeWidth="2" strokeDasharray="3 2" />
          <path d="M50 15 L50 82" stroke={color} strokeWidth="2" />
          <circle cx="50" cy="45" r="6" fill={color} />
        </svg>
      );

    case "utkarsh":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]">
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="2.5" />
          <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M78 22 L22 78" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
          <polygon points="50,20 62,38 84,38 68,52 74,74 50,60 26,74 32,52 16,38 38,38" fill="none" stroke={color} strokeWidth="3" />
          <circle cx="50" cy="50" r="9" fill={color} />
        </svg>
      );

    default:
      return (
        <div className="w-full h-full rounded-full border border-amber-500/50 flex items-center justify-center text-amber-300 font-bold">
          {teamId?.substring(0, 2).toUpperCase()}
        </div>
      );
  }
};

const TeamLogo = ({ team, className = "w-10 h-10" }) => {
  const [imgError, setImgError] = useState(false);

  // Path resolution for existing team logos
  const logoPath = team?.logoUrl || `/teams/${team?.id}.png`;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {!imgError ? (
        <img
          src={logoPath}
          alt={`${team?.name || "Team"} Logo`}
          className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(220,157,74,0.4)] transition-transform duration-300 group-hover:scale-110"
          onError={() => setImgError(true)}
        />
      ) : (
        <RoyalEmblem teamId={team?.id} color={team?.theme?.primary || "#dc9d4a"} />
      )}
    </div>
  );
};

export default TeamLogo;
