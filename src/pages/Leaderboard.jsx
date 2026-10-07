import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Lock, ShieldCheck, ShieldAlert, LogOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { initialTeams } from "../data/teams";
import TeamNavigation from "../components/TeamNavigation";
import LeaderboardCard from "../components/LeaderboardCard";
import AdminLoginModal from "../components/AdminLoginModal";
import AdminScorePanel from "../components/AdminScorePanel";
import bgImage from "../assets/leaderboard-bg.jpg";

// Decorative Gold Ornament Component for royal divider
const RoyalGoldOrnament = () => (
  <div className="flex items-center justify-center gap-3 my-2 sm:my-3 opacity-80">
    <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#dc9d4a] to-transparent" />
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#dc9d4a]">
      <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" fill="currentColor" />
    </svg>
    <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#dc9d4a] to-transparent" />
  </div>
);

const Leaderboard = () => {
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth & Admin Authorization State
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // SINDHU is expanded initially as per requirements
  const [expandedTeamId, setExpandedTeamId] = useState("sindhu");

  // Check admin status using secure Supabase RPC function check_is_admin()
  const checkAdminStatus = useCallback(async (currentUser) => {
    if (!currentUser) {
      setIsAdmin(false);
      setCheckingAdmin(false);
      return;
    }

    setCheckingAdmin(true);
    try {
      const { data: adminFlag, error: rpcErr } = await supabase.rpc("check_is_admin");

      if (rpcErr) {
        console.error("Error calling check_is_admin RPC:", rpcErr);
        setIsAdmin(false);
      } else {
        setIsAdmin(adminFlag === true);
      }
    } catch (err) {
      console.error("Error verifying admin status:", err);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  }, []);

  // Listen for Supabase auth state changes and restore session across refreshes
  useEffect(() => {
    // Check initial active session
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);
      if (activeSession?.user) {
        checkAdminStatus(activeSession.user);
      } else {
        setIsAdmin(false);
        setCheckingAdmin(false);
      }
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        await checkAdminStatus(newSession.user);
      } else {
        setIsAdmin(false);
        setCheckingAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  // Handle Logout action
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setIsAdmin(false);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Helper to fetch real team score data from Supabase
  const loadLeaderboardData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: supaTeams, error: supaError } = await supabase
        .from("teams")
        .select("*");

      if (supaError) {
        console.error("Supabase fetch error:", supaError);
        setTeamsData(
          initialTeams.map((t) => ({ ...t, sportsPoints: 0, culturalPoints: 0, technicalPoints: 0, totalPoints: 0 }))
        );
        return;
      }

      if (supaTeams && supaTeams.length > 0) {
        const mergedTeams = initialTeams.map((localTeam) => {
          const matchedSupa = supaTeams.find(
            (st) =>
              st.name?.trim().toLowerCase() === localTeam.name.trim().toLowerCase() ||
              st.name?.trim().toLowerCase() === localTeam.id.trim().toLowerCase()
          );

          const sportsPoints = matchedSupa ? Number(matchedSupa.sports_points ?? 0) : 0;
          const culturalPoints = matchedSupa ? Number(matchedSupa.cultural_points ?? 0) : 0;
          const technicalPoints = matchedSupa ? Number(matchedSupa.technical_points ?? 0) : 0;
          const totalPoints = sportsPoints + culturalPoints + technicalPoints;

          return {
            ...localTeam,
            dbId: matchedSupa ? matchedSupa.id : null,
            sportsPoints,
            culturalPoints,
            technicalPoints,
            totalPoints,
          };
        });

        setTeamsData(mergedTeams);
      } else {
        setTeamsData(
          initialTeams.map((t) => ({ ...t, sportsPoints: 0, culturalPoints: 0, technicalPoints: 0, totalPoints: 0 }))
        );
      }
    } catch (err) {
      console.error("Unexpected error fetching teams from Supabase:", err);
      setTeamsData(
        initialTeams.map((t) => ({ ...t, sportsPoints: 0, culturalPoints: 0, technicalPoints: 0, totalPoints: 0 }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initFetch() {
      const { data: supaTeams, error: supaError } = await supabase
        .from("teams")
        .select("*");

      if (!isMounted) return;

      if (supaError) {
        console.error("Supabase fetch error:", supaError);
        setTeamsData(
          initialTeams.map((t) => ({ ...t, sportsPoints: 0, culturalPoints: 0, technicalPoints: 0, totalPoints: 0 }))
        );
        setLoading(false);
        return;
      }

      if (supaTeams && supaTeams.length > 0) {
        const mergedTeams = initialTeams.map((localTeam) => {
          const matchedSupa = supaTeams.find(
            (st) =>
              st.name?.trim().toLowerCase() === localTeam.name.trim().toLowerCase() ||
              st.name?.trim().toLowerCase() === localTeam.id.trim().toLowerCase()
          );

          const sportsPoints = matchedSupa ? Number(matchedSupa.sports_points ?? 0) : 0;
          const culturalPoints = matchedSupa ? Number(matchedSupa.cultural_points ?? 0) : 0;
          const technicalPoints = matchedSupa ? Number(matchedSupa.technical_points ?? 0) : 0;
          const totalPoints = sportsPoints + culturalPoints + technicalPoints;

          return {
            ...localTeam,
            dbId: matchedSupa ? matchedSupa.id : null,
            sportsPoints,
            culturalPoints,
            technicalPoints,
            totalPoints,
          };
        });

        setTeamsData(mergedTeams);
      } else {
        setTeamsData(
          initialTeams.map((t) => ({ ...t, sportsPoints: 0, culturalPoints: 0, technicalPoints: 0, totalPoints: 0 }))
        );
      }
      setLoading(false);
    }

    initFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sort teams dynamically by total points descending and assign rank
  const sortedTeams = useMemo(() => {
    const listToUse = teamsData.length > 0 ? teamsData : initialTeams;

    return [...listToUse]
      .map((team) => {
        const sports = team.sportsPoints ?? 0;
        const cultural = team.culturalPoints ?? 0;
        const technical = team.technicalPoints ?? 0;
        const total = team.totalPoints ?? sports + cultural + technical;
        return {
          ...team,
          sportsPoints: sports,
          culturalPoints: cultural,
          technicalPoints: technical,
          totalPoints: total,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((team, index) => ({
        ...team,
        rank: index + 1,
      }));
  }, [teamsData]);

  const handleToggleExpand = (teamId) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  const handleSelectTeamFromNav = (teamId) => {
    setExpandedTeamId(teamId);
    const element = document.getElementById(`team-card-${teamId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050b18] text-white flex flex-col pt-20 pb-12 px-3 sm:px-6 lg:px-8 overflow-hidden">
      {/* =========================================
          BACKGROUND LAYER WITH DARK OVERLAY
          ========================================= */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{
          backgroundImage: `url(${bgImage}), url('/leaderboard-bg.jpg')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          filter: "brightness(2.1) contrast(1.35) saturate(1.2)",
        }}
      >
        <div className="absolute inset-0 bg-[#050b18]/15" />
      </div>

      {/* =========================================
          MAIN CONTENT CONTAINER (Z-INDEX 10)
          ========================================= */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* TOP-RIGHT AUTHENTICATION CONTROL BAR */}
        <div className="w-full flex justify-end mb-2">
          {!session ? (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 border border-[#dc9d4a]/40 bg-[#080f22]/80 text-[#f3cf9b] hover:bg-[#dc9d4a]/20 hover:border-[#dc9d4a] shadow-[0_0_12px_rgba(220,157,74,0.2)] cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#dc9d4a]" />
              <span>LOGIN</span>
            </button>
          ) : checkingAdmin ? (
            <div className="px-3 py-1.5 rounded-xl bg-[#080f22]/80 border border-[#dc9d4a]/30 text-xs text-[#dc9d4a] animate-pulse">
              Verifying Admin Permissions...
            </div>
          ) : isAdmin ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a2518]/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                Admin ({session.user?.email})
              </span>
              <button
                onClick={handleLogout}
                className="ml-1 px-2 py-0.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2a0a0a]/90 border border-rose-500/40 text-rose-300 text-xs font-semibold shadow-[0_0_12px_rgba(244,63,94,0.2)]">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                Not Authorized ({session.user?.email})
              </span>
              <button
                onClick={handleLogout}
                className="ml-1 px-2 py-0.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* PAGE HEADER: ONLY SAY "LEADERBOARD" */}
        <header className="text-center mt-1 sm:mt-2 mb-2 sm:mb-4">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-[#fff2cb] via-[#f3cf9b] to-[#b37c35] drop-shadow-[0_0_20px_rgba(220,157,74,0.45)]"
            style={{
              fontFamily: "'Reggae One', 'Outfit', serif",
            }}
          >
            LEADERBOARD
          </h1>

          {/* Decorative Royal Gold Divider */}
          <RoyalGoldOrnament />
        </header>

        {/* ADMIN SCORE EDITING PANEL (Only rendered for verified admins) */}
        {session && isAdmin && (
          <AdminScorePanel
            teams={sortedTeams}
            onScoreUpdated={loadLeaderboardData}
          />
        )}

        {/* TOP TEAM NAVIGATION */}
        <TeamNavigation
          teams={initialTeams}
          selectedTeamId={expandedTeamId}
          onSelectTeam={handleSelectTeamFromNav}
        />

        {/* EXPANDABLE TEAM LEADERBOARD LIST */}
        <div className="w-full flex flex-col space-y-2.5 sm:space-y-3.5 my-2">
          {loading && sortedTeams.length === 0 ? (
            <div className="text-center py-8 text-[#dc9d4a] font-semibold tracking-wider animate-pulse">
              Loading Leaderboard...
            </div>
          ) : (
            sortedTeams.map((team) => (
              <LeaderboardCard
                key={team.id}
                team={team}
                isExpanded={expandedTeamId === team.id}
                onToggleExpand={() => handleToggleExpand(team.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ADMIN LOGIN MODAL */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(newSession) => {
          setSession(newSession);
          if (newSession?.user) {
            checkAdminStatus(newSession.user);
          }
        }}
      />
    </div>
  );
};

export default Leaderboard;