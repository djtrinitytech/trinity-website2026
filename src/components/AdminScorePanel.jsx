import React, { useState } from "react";
import { PlusCircle, MinusCircle, AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const AdminScorePanel = ({ teams, onScoreUpdated }) => {
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || "sindhu");
  const [category, setCategory] = useState("sports");
  const [actionType, setActionType] = useState("add"); // "add" or "deduct"
  const [pointsInput, setPointsInput] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Find currently selected team object from prop list
  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  const handlePointsChange = (e) => {
    const val = e.target.value;
    // Disallow negative values or decimals in the text field directly
    if (val.includes(".") || val.includes("-")) return;
    setPointsInput(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validation
    if (!selectedTeam) {
      setErrorMsg("Please select a valid team.");
      return;
    }

    if (!selectedTeam.dbId) {
      setErrorMsg(`Database ID for team "${selectedTeam.name}" not found. Please refresh the page.`);
      return;
    }

    const pointsNum = parseInt(pointsInput, 10);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      setErrorMsg("Points must be a positive whole integer greater than 0.");
      return;
    }

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setErrorMsg("Please enter a valid mandatory reason for this score update.");
      return;
    }

    // Calculate final signed points change (+ or -)
    const finalPointsChange = actionType === "add" ? pointsNum : -pointsNum;

    try {
      setLoading(true);

      // Call secure Supabase RPC update_team_score
      const { error: rpcErr } = await supabase.rpc("update_team_score", {
        p_team_id: selectedTeam.dbId,
        p_category: category.toLowerCase(),
        p_points_change: finalPointsChange,
        p_reason: trimmedReason,
      });

      if (rpcErr) {
        throw rpcErr;
      }

      setSuccessMsg(
        `Successfully updated ${selectedTeam.name}! (${finalPointsChange > 0 ? "+" : ""}${finalPointsChange} PTS to ${category.toUpperCase()})`
      );

      // Reset input fields
      setPointsInput("");
      setReason("");

      // Trigger leaderboard refetch in parent
      if (onScoreUpdated) {
        await onScoreUpdated();
      }
    } catch (err) {
      console.error("RPC update_team_score error:", err);
      setErrorMsg(err.message || "Failed to update team score. Check database constraints.");
    } finally {
      setLoading(false);
    }
  };

  const calculatedPointsChange =
    pointsInput && parseInt(pointsInput, 10) > 0
      ? actionType === "add"
        ? `+${parseInt(pointsInput, 10)}`
        : `-${parseInt(pointsInput, 10)}`
      : "0";

  return (
    <div className="relative w-full max-w-4xl mx-auto my-4 bg-[#080f22]/95 border border-[#dc9d4a]/50 rounded-2xl p-4 sm:p-6 shadow-[0_0_30px_rgba(220,157,74,0.3)] text-white backdrop-blur-xl">
      {/* Intricate Gold Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#dc9d4a]" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#dc9d4a]" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#dc9d4a]" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#dc9d4a]" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#dc9d4a]/25">
        <Sparkles className="w-5 h-5 text-[#ffd700]" />
        <h2
          className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#fff2cb] via-[#f3cf9b] to-[#dc9d4a]"
          style={{ fontFamily: "'Reggae One', 'Outfit', sans-serif" }}
        >
          ADMIN SCORE PANEL
        </h2>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 mb-4 text-xs sm:text-sm bg-red-950/70 border border-red-500/50 rounded-xl text-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 mb-4 text-xs sm:text-sm bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. SELECT TEAM */}
          <div>
            <label className="block text-xs font-bold text-[#f3cf9b] uppercase tracking-wider mb-1.5">
              1. Select Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full bg-[#050b18]/90 border border-[#dc9d4a]/40 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-[#dc9d4a] cursor-pointer"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#050b18] text-white">
                  {t.name} (Current Total: {t.totalPoints || 0} PTS)
                </option>
              ))}
            </select>
          </div>

          {/* 2. SELECT CATEGORY (SPORTS | CULTURAL | TECHNICAL) */}
          <div>
            <label className="block text-xs font-bold text-[#f3cf9b] uppercase tracking-wider mb-1.5">
              2. Select Category
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setCategory("sports")}
                className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold uppercase transition-all border cursor-pointer ${
                  category === "sports"
                    ? "bg-[#00d2ff]/20 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_10px_rgba(0,210,255,0.3)]"
                    : "bg-[#050b18]/60 border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                SPORTS
              </button>
              <button
                type="button"
                onClick={() => setCategory("cultural")}
                className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold uppercase transition-all border cursor-pointer ${
                  category === "cultural"
                    ? "bg-[#c084fc]/20 border-[#c084fc] text-[#c084fc] shadow-[0_0_10px_rgba(192,132,252,0.3)]"
                    : "bg-[#050b18]/60 border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                CULTURAL
              </button>
              <button
                type="button"
                onClick={() => setCategory("technical")}
                className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold uppercase transition-all border cursor-pointer ${
                  category === "technical"
                    ? "bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                    : "bg-[#050b18]/60 border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                TECHNICAL
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 3. ACTION TYPE */}
          <div>
            <label className="block text-xs font-bold text-[#f3cf9b] uppercase tracking-wider mb-1.5">
              3. Action Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActionType("add")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all border cursor-pointer ${
                  actionType === "add"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                    : "bg-[#050b18]/60 border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>ADD</span>
              </button>
              <button
                type="button"
                onClick={() => setActionType("deduct")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all border cursor-pointer ${
                  actionType === "deduct"
                    ? "bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_10px_rgba(251,113,133,0.3)]"
                    : "bg-[#050b18]/60 border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                <MinusCircle className="w-4 h-4" />
                <span>DEDUCT</span>
              </button>
            </div>
          </div>

          {/* 4. POINTS VALUE */}
          <div>
            <label className="block text-xs font-bold text-[#f3cf9b] uppercase tracking-wider mb-1.5">
              4. Points Amount
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={pointsInput}
              onChange={handlePointsChange}
              placeholder="e.g. 50"
              className="w-full bg-[#050b18]/90 border border-[#dc9d4a]/40 rounded-xl p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#dc9d4a]"
            />
          </div>
        </div>

        {/* 5. MANDATORY REASON */}
        <div>
          <label className="block text-xs font-bold text-[#f3cf9b] uppercase tracking-wider mb-1.5">
            5. Reason for Update (Mandatory)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Won hackathon / Lost penalty points"
            className="w-full bg-[#050b18]/90 border border-[#dc9d4a]/40 rounded-xl p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#dc9d4a]"
          />
        </div>

        {/* CONFIRMATION PREVIEW */}
        <div className="p-3 bg-[#050b18]/80 border border-[#dc9d4a]/20 rounded-xl text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-slate-400">Preview: </span>
            <span className="font-bold text-white">{selectedTeam?.name}</span>
            <span className="mx-1.5">•</span>
            <span className="font-bold uppercase text-[#dc9d4a]">{category}</span>
            <span className="mx-1.5">•</span>
            <span
              className={`font-black ${
                actionType === "add" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {calculatedPointsChange} PTS
            </span>
          </div>
          {reason.trim() && (
            <div className="italic text-slate-400 truncate max-w-xs">
              "{reason.trim()}"
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-extrabold text-sm tracking-widest uppercase bg-gradient-to-r from-[#ffd700] via-[#dc9d4a] to-[#b37c35] text-[#050b18] hover:brightness-110 transition-all shadow-[0_0_15px_rgba(220,157,74,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Scores...</span>
            </>
          ) : (
            <span>CONFIRM UPDATE</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminScorePanel;
