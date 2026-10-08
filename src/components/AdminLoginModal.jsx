import React, { useState } from "react";
import { X, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        setEmail("");
        setPassword("");
        if (onLoginSuccess) {
          onLoginSuccess(data.session);
        }
        onClose();
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg(err.message || "Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#080f22]/95 border border-[#dc9d4a]/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(220,157,74,0.3)] text-white overflow-hidden">
        {/* Intricate Gold Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#dc9d4a]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#dc9d4a]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#dc9d4a]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#dc9d4a]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-[#dc9d4a] hover:bg-[#dc9d4a]/10 transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#dc9d4a]/15 border border-[#dc9d4a]/30 mb-3 text-[#dc9d4a]">
            <Lock className="w-6 h-6" />
          </div>
          <h2
            className="text-2xl font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#fff2cb] to-[#dc9d4a]"
            style={{ fontFamily: "'Reggae One', 'Outfit', sans-serif" }}
          >
            ADMIN LOGIN
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authorized Trinity Admin Access Only
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 mb-4 text-xs bg-red-950/60 border border-red-500/40 rounded-xl text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#f3cf9b] tracking-wider uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@trinity.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#050b18]/90 border border-[#dc9d4a]/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#dc9d4a] focus:ring-1 focus:ring-[#dc9d4a] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#f3cf9b] tracking-wider uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#050b18]/90 border border-[#dc9d4a]/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#dc9d4a] focus:ring-1 focus:ring-[#dc9d4a] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-[#ffd700] via-[#dc9d4a] to-[#b37c35] text-[#050b18] hover:brightness-110 transition-all duration-200 shadow-[0_0_15px_rgba(220,157,74,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>LOG IN</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
