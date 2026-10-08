// DJSCE Trinity 2026 Leaderboard Data Layer
// Data structured to allow seamless integration with Supabase or external APIs.

export const initialTeams = [
  {
    id: "sindhu",
    name: "SINDHU",
    tagline: "The Ocean of Might & Valor",
    theme: {
      primary: "#00d2ff",
      secondary: "#0077b6",
      glow: "rgba(0, 210, 255, 0.25)",
      border: "rgba(0, 210, 255, 0.4)",
      badgeBg: "linear-gradient(135deg, #005f73 0%, #0a9396 100%)",
      atmosphere: "from-cyan-950/40 via-blue-950/20 to-transparent",
    },
    sportsPoints: 0,
    culturalPoints: 0,
    technicalPoints: 0,
    logoUrl: "/teams/sindhu.png",
  },
  {
    id: "aakar",
    name: "AAKAR",
    tagline: "Architects of Supreme Glory",
    theme: {
      primary: "#ff9f1c",
      secondary: "#ffbf69",
      glow: "rgba(255, 159, 28, 0.25)",
      border: "rgba(255, 159, 28, 0.4)",
      badgeBg: "linear-gradient(135deg, #9a031e 0%, #fb8500 100%)",
      atmosphere: "from-amber-950/40 via-orange-950/20 to-transparent",
    },
    sportsPoints: 0,
    culturalPoints: 0,
    technicalPoints: 0,
    logoUrl: "/teams/aakar.png",
  },
  {
    id: "pragya",
    name: "PRAGYA",
    tagline: "The Essence of Wisdom & Art",
    theme: {
      primary: "#a855f7",
      secondary: "#c084fc",
      glow: "rgba(168, 85, 247, 0.25)",
      border: "rgba(168, 85, 247, 0.4)",
      badgeBg: "linear-gradient(135deg, #581c87 0%, #7e22ce 100%)",
      atmosphere: "from-purple-950/40 via-fuchsia-950/20 to-transparent",
    },
    sportsPoints: 0,
    culturalPoints: 0,
    technicalPoints: 0,
    logoUrl: "/teams/pragya.png",
  },
  {
    id: "kshatra",
    name: "KSHATRA",
    tagline: "The Unyielding Warrior Clan",
    theme: {
      primary: "#ef4444",
      secondary: "#f87171",
      glow: "rgba(239, 68, 68, 0.25)",
      border: "rgba(239, 68, 68, 0.4)",
      badgeBg: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)",
      atmosphere: "from-rose-950/40 via-red-950/20 to-transparent",
    },
    sportsPoints: 0,
    culturalPoints: 0,
    technicalPoints: 0,
    logoUrl: "/teams/kshatra.png",
  },
  {
    id: "aarohan",
    name: "AAROHAN",
    tagline: "Rising Beyond Boundaries",
    theme: {
      primary: "#14b8a6",
      secondary: "#2dd4bf",
      glow: "rgba(20, 184, 166, 0.25)",
      border: "rgba(20, 184, 166, 0.4)",
      badgeBg: "linear-gradient(135deg, #134e4a 0%, #0f766e 100%)",
      atmosphere: "from-teal-950/40 via-emerald-950/20 to-transparent",
    },
    sportsPoints: 0,
    culturalPoints: 0,
    technicalPoints: 0,
    logoUrl: "/teams/aarohan.png",
  },
  {
    id: "utkarsh",
    name: "UTKARSH",
    tagline: "The Pinnacle of Distinction",
    theme: {
      primary: "#eab308",
      secondary: "#fde047",
      glow: "rgba(234, 179, 8, 0.25)",
      border: "rgba(234, 179, 8, 0.4)",
      badgeBg: "linear-gradient(135deg, #713f12 0%, #a16207 100%)",
      atmosphere: "from-yellow-950/40 via-amber-950/20 to-transparent",
    },
    sportsPoints: 0,
    culturalPoints: 0,
    technicalPoints: 0,
    logoUrl: "/teams/utkarsh.png",
  },
];

/**
 * Calculates total points dynamically and returns sorted teams with ranks assigned.
 * @param {Array} teamsList - List of raw team objects
 * @returns {Array} Processed teams list sorted by total points descending
 */
export function getSortedLeaderboard(teamsList = initialTeams) {
  return [...teamsList]
    .map((team) => ({
      ...team,
      totalPoints:
        (team.sportsPoints || 0) +
        (team.culturalPoints || 0) +
        (team.technicalPoints || 0),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((team, index) => ({
      ...team,
      rank: index + 1,
    }));
}
