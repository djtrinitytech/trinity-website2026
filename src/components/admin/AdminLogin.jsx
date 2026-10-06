import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isSupabaseConfigured } from "../../lib/supabase";
import "./AdminCommon.css";
import "./AdminLogin.css";

export default function AdminLogin() {
  const { user, isAdmin, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const from = location.state?.from?.pathname || "/admin";

  // If already authenticated admin, redirect immediately
  useEffect(() => {
    if (user && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [user, isAdmin, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMsg(
        "Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
      );
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      // Auth state listener handles redirect upon admin verification
    } catch (err) {
      console.error("Login attempt failed:", err);
      setErrorMsg(err.message || "Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-glow" aria-hidden="true" />

      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-symbol">⚜</div>
          <p className="admin-login-kicker">ANUGATHA ARCHIVE CONTROL</p>
          <h1 className="admin-login-title">TRINITY ADMIN</h1>
          <p className="admin-login-sub">Authorized Personnel Sign In</p>
        </div>

        {errorMsg && (
          <div className="admin-login-error" role="alert">
            <span className="error-icon">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="admin-email">Email Address</label>
            <input
              id="admin-email"
              type="email"
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@djtrinity.org"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary admin-login-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-flex">
                <span className="admin-spinner sm" /> Authenticating...
              </span>
            ) : (
              "SIGN IN"
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>
            Public registration is disabled. Administrator accounts are created
            manually in Supabase Auth.
          </p>
          <Link to="/" className="admin-login-back">
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
