import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar({ sidebarOpen, onClose }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <Link to="/admin" className="admin-brand-link" onClick={onClose}>
          <div className="admin-brand-logo">⚜</div>
          <div className="admin-brand-text">
            <span className="admin-brand-title">TRINITY ADMIN</span>
            <span className="admin-brand-sub">Anugatha Archive CMS</span>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="admin-sidebar-nav">
        <span className="nav-section-label">Content Management</span>

        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `admin-nav-item ${isActive ? "active" : ""}`
          }
          onClick={onClose}
        >
          <span className="admin-nav-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/announcements"
          className={({ isActive }) =>
            `admin-nav-item ${isActive ? "active" : ""}`
          }
          onClick={onClose}
        >
          <span className="admin-nav-icon">📜</span>
          <span>Announcements</span>
        </NavLink>

        <NavLink
          to="/admin/gallery"
          className={({ isActive }) =>
            `admin-nav-item ${isActive ? "active" : ""}`
          }
          onClick={onClose}
        >
          <span className="admin-nav-icon">🖼️</span>
          <span>Gallery Archive</span>
        </NavLink>

        <span className="nav-section-label" style={{ marginTop: 18 }}>
          External
        </span>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-nav-item"
          onClick={onClose}
        >
          <span className="admin-nav-icon">↗</span>
          <span>View Public Site</span>
        </a>
      </nav>

      {/* User Footer */}
      <div className="admin-sidebar-footer">
        <div className="admin-user-pill">
          <div className="user-avatar-glyph">
            {user?.email ? user.email.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="user-info">
            <span className="user-email">{user?.email || "Admin User"}</span>
            <span className="user-role">
              {profile?.role === "editor" ? "Editor" : "Administrator"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="admin-logout-btn"
          onClick={handleLogout}
          aria-label="Log out of CMS"
        >
          <span>Logout</span>
          <span>↪</span>
        </button>
      </div>
    </aside>
  );
}
