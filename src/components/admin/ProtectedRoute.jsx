import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminCommon.css";

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-box">
          <div className="admin-spinner" />
          <p className="admin-loading-title">ANUGATHA ARCHIVE CONTROL</p>
          <p className="admin-loading-sub">Authenticating credentials...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // Logged in but not in admin_profiles
  if (!isAdmin) {
    return (
      <div className="admin-unauthorized-screen">
        <div className="admin-unauthorized-card">
          <div className="unauth-icon">⚠️</div>
          <h2>Access Restricted</h2>
          <p className="unauth-lead">
            Signed in as <strong>{user.email}</strong>.
          </p>
          <p className="unauth-desc">
            Your account is authenticated, but does not have an active administrative role in{" "}
            <code>admin_profiles</code>.
          </p>
          <div className="unauth-hint">
            <strong>Administrator Setup:</strong>
            <br />
            To grant access, add a row in Supabase:
            <pre>
              INSERT INTO public.admin_profiles (user_id, email, role)
              <br />
              VALUES ('{user.id}', '{user.email}', 'admin');
            </pre>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return children;
}
