import React from "react";
import TeamLogo from "./TeamLogo";

const TeamNavigation = ({ teams, selectedTeamId, onSelectTeam }) => {
  return (
    <div className="w-full my-4 sm:my-5">
      {/* Container with gold accent border and dark frosted background */}
      <div className="relative max-w-4xl mx-auto rounded-xl sm:rounded-2xl bg-[#080f22]/80 backdrop-blur-xl border border-[#dc9d4a]/30 shadow-[0_8px_25px_rgba(0,0,0,0.6)] p-1.5 sm:p-2.5 overflow-hidden">
        {/* Intricate Corner Gold Line Accents */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#dc9d4a]/80" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#dc9d4a]/80" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#dc9d4a]/80" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#dc9d4a]/80" />

        {/* Scrollable Team List */}
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-0.5 px-0.5 divide-x divide-[#dc9d4a]/20">
          {teams.map((team) => {
            const isSelected = selectedTeamId === team.id;
            const primaryColor = team.theme.primary;

            return (
              <button
                key={team.id}
                onClick={() => onSelectTeam(team.id)}
                className={`flex-1 min-w-[95px] sm:min-w-[115px] flex flex-col items-center justify-center py-1.5 sm:py-2 px-2 rounded-lg sm:rounded-xl transition-all duration-300 group cursor-pointer border ${
                  isSelected
                    ? "bg-[#0f1d3a] shadow-[0_0_15px_rgba(220,157,74,0.2)] scale-[1.02]"
                    : "bg-transparent border-transparent hover:bg-[#0c162b]/60"
                }`}
                style={{
                  borderColor: isSelected ? team.theme.border : "transparent",
                  boxShadow: isSelected ? `0 0 12px ${team.theme.glow}` : "none",
                }}
              >
                {/* Logo with scaling animation */}
                <TeamLogo team={team} className="w-7 h-7 sm:w-9 sm:h-9 mb-1" />

                {/* Team Name */}
                <span
                  className="text-[11px] sm:text-xs font-semibold tracking-wider transition-all duration-300 group-hover:scale-105"
                  style={{
                    color: isSelected ? primaryColor : "#cbd5e1",
                    textShadow: isSelected ? `0 0 8px ${primaryColor}` : "none",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {team.name}
                </span>

                {/* Active Indicator Bar */}
                <div
                  className={`h-0.5 mt-1 rounded-full transition-all duration-300 ${
                    isSelected ? "w-6 opacity-100" : "w-0 opacity-0 group-hover:w-3 group-hover:opacity-50"
                  }`}
                  style={{ backgroundColor: primaryColor }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeamNavigation;
