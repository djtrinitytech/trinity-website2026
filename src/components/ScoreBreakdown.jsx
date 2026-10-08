import React from "react";
import { Trophy, Sparkles, Cpu } from "lucide-react";

const ScoreBreakdown = ({ team }) => {
  const sports = team.sportsPoints || 0;
  const cultural = team.culturalPoints || 0;
  const technical = team.technicalPoints || 0;
  const primaryColor = team.theme.primary;

  return (
    <div className="w-full pt-2.5 pb-1.5 px-2 sm:px-4 border-t border-[#dc9d4a]/20 transition-all duration-500 ease-out">
      <div className="grid grid-cols-3 divide-x divide-[#dc9d4a]/20 items-center text-center py-2 sm:py-3.5 bg-[#050b18]/60 rounded-lg border border-[#dc9d4a]/15 backdrop-blur-sm">
        {/* SPORTS SECTION */}
        <div className="px-1.5 sm:px-3 flex flex-col items-center group">
          <div className="flex items-center gap-1 mb-0.5 text-[#00d2ff]">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[9px] sm:text-[11px] font-bold tracking-widest uppercase" style={{ color: primaryColor }}>
              SPORTS
            </span>
          </div>
          <div className="text-base sm:text-2xl font-extrabold tracking-tight text-white my-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {sports}
          </div>
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 tracking-wider">
            PTS
          </span>
        </div>

        {/* CULTURAL SECTION */}
        <div className="px-1.5 sm:px-3 flex flex-col items-center group">
          <div className="flex items-center gap-1 mb-0.5 text-[#c084fc]">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[9px] sm:text-[11px] font-bold tracking-widest uppercase text-purple-300">
              CULTURAL
            </span>
          </div>
          <div className="text-base sm:text-2xl font-extrabold tracking-tight text-purple-200 my-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {cultural}
          </div>
          <span className="text-[9px] sm:text-[10px] font-semibold text-purple-400/80 tracking-wider">
            PTS
          </span>
        </div>

        {/* TECHNICAL SECTION */}
        <div className="px-1.5 sm:px-3 flex flex-col items-center group">
          <div className="flex items-center gap-1 mb-0.5 text-[#38bdf8]">
            <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110 text-sky-400" />
            <span className="text-[9px] sm:text-[11px] font-bold tracking-widest uppercase text-sky-300">
              TECHNICAL
            </span>
          </div>
          <div className="text-base sm:text-2xl font-extrabold tracking-tight text-sky-200 my-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {technical}
          </div>
          <span className="text-[9px] sm:text-[10px] font-semibold text-sky-400/80 tracking-wider">
            PTS
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;
