import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import logo from "../images/trinity_logo.png";
import { useAnnouncementNotification } from "../context/AnnouncementNotificationContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { unreadCount } = useAnnouncementNotification();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 25);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Left shortcuts (swapped & balanced)
  const leftNavItems = [
    { title: "Events", path: "/events" },
    { title: "Leaderboard", path: "/leaderboard" },
    { title: "Gallery", path: "/gallery" },
    { title: "Registrations", path: "/registrations" },
  ];

  // Right shortcuts (swapped & balanced)
  const rightNavItems = [
    { title: "Teams", path: "/teams" },
    { title: "Sponsors", path: "/sponsors" },
    { title: "Announcements", path: "/announcements" },
    { title: "Contact Us", path: "/contact" },
  ];

  const allNavItems = [...leftNavItems, ...rightNavItems];

  return (
    <>
      <style>{`
        .site-navbar {
          height: 76px;
          position: fixed;
          z-index: 100;
          top: 0;
          left: 0;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 clamp(20px, 3.5vw, 60px);
          border-bottom: 1px solid rgba(214, 175, 102, 0.2);
          background: rgba(11, 16, 15, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease;
        }

        /* Fully transparent on homepage when not scrolled */
        .site-navbar.is-home:not(.scrolled):not(.menu-open) {
          background: transparent;
          border-bottom-color: transparent;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          box-shadow: none;
        }

        .site-navbar.scrolled {
          background: rgba(8, 12, 18, 0.88);
          border-bottom-color: rgba(214, 175, 102, 0.2);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
        }

        .site-navbar.menu-open {
          background: rgba(8, 12, 18, 0.97);
          border-bottom-color: rgba(214, 175, 102, 0.25);
        }

        .nav-grid-container {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
        }

        .desktop-only {
          display: grid;
        }

        .mobile-only {
          display: none;
        }

        .nav-edge-side {
          display: flex;
          align-items: center;
          gap: clamp(16px, 2.2vw, 36px);
        }

        .nav-edge-side.left {
          justify-content: flex-start;
        }

        .nav-edge-side.right {
          justify-content: flex-end;
        }

        .nav-center-brand {
          background: none;
          border: 0;
          padding: 0 clamp(16px, 2.5vw, 36px);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
          outline: none;
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .nav-center-brand img {
          height: 46px;
          width: auto;
          max-width: 155px;
          object-fit: contain;
          display: block;
          transition: transform 0.25s ease, filter 0.25s ease;
          filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.45));
        }

        .nav-center-brand:hover img {
          transform: scale(1.08);
          filter: drop-shadow(0 0 18px rgba(229, 175, 82, 0.6));
        }

        .nav-link-btn {
          text-decoration: none;
          border: 0;
          background: none;
          font-size: clamp(13.5px, 1vw, 15.5px);
          font-family: "DM Serif Display", Georgia, serif;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: #e5b058;
          opacity: 0.92;
          padding: 6px 4px;
          transition: all 0.22s ease;
          cursor: pointer;
          white-space: nowrap;
          position: relative;
          text-shadow: 0 1px 10px rgba(229, 176, 88, 0.3);
        }

        .nav-link-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ffd885, transparent);
          transition: width 0.25s ease, left 0.25s ease;
        }

        .nav-link-btn:hover::after,
        .nav-link-btn.active::after {
          width: 80%;
          left: 10%;
        }

        .nav-link-btn:hover,
        .nav-link-btn.active {
          color: #fff6e0;
          opacity: 1;
          text-shadow: 0 0 16px rgba(239, 194, 108, 0.85);
          transform: translateY(-1px);
        }

        .nav-mobile-overlay {
          display: none;
        }

        @media (max-width: 980px) {
          .site-navbar {
            height: 64px;
            padding: 0 18px;
          }

          .desktop-only {
            display: none !important;
          }

          .mobile-only {
            display: flex !important;
            width: 100%;
            align-items: center;
            justify-content: space-between;
          }

          .mobile-spacer {
            width: 38px;
            height: 38px;
            flex-shrink: 0;
          }

          .mobile-logo-link {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
          }

          .mobile-logo-img {
            height: 36px;
            width: auto;
            max-width: 125px;
            object-fit: contain;
          }

          .nav-mobile-hamburger {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 8px;
            border: 1px solid rgba(229, 176, 88, 0.4);
            background: rgba(229, 176, 88, 0.1);
            color: #e5b058;
            cursor: pointer;
            flex-shrink: 0;
          }

          .nav-mobile-overlay {
            display: none;
            position: fixed;
            top: 64px;
            left: 0;
            right: 0;
            background: rgba(8, 12, 18, 0.97);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(214, 175, 102, 0.25);
            padding: 16px 22px 24px;
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5);
            z-index: 99;
          }

          .nav-mobile-overlay.open {
            display: block;
            animation: mobileNavDown 0.22s ease-out;
          }

          @keyframes mobileNavDown {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .nav-mobile-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .nav-mobile-list .nav-link-btn {
            display: block;
            text-align: center;
            padding: 12px 16px;
            font-size: 15.5px;
            border-bottom: 1px solid rgba(214, 175, 102, 0.12);
            border-radius: 6px;
          }

          .nav-mobile-list .nav-link-btn:last-child {
            border-bottom: 0;
          }
        }

        /* ---------------- Announcement Notification Ping Badge ---------------- */
        .announcements-nav-item {
          display: inline-flex !important;
          align-items: center;
          gap: 6px;
        }

        .nav-ping-badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          vertical-align: middle;
          margin-left: 6px;
          transform: translateY(-1px);
          user-select: none;
        }

        .nav-ping-core {
          position: relative;
          z-index: 2;
          min-width: 19px;
          height: 19px;
          padding: 0 5px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #e14938 0%, #d87d28 50%, #c9933b 100%);
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          line-height: 19px;
          text-align: center;
          border: 1px solid rgba(255, 235, 190, 0.7);
          box-shadow: 0 0 10px rgba(225, 73, 56, 0.75), 0 0 16px rgba(214, 175, 102, 0.45);
          letter-spacing: 0;
        }

        .nav-ping-ring {
          position: absolute;
          inset: -3px;
          border-radius: 9999px;
          border: 1.5px solid rgba(235, 95, 70, 0.85);
          box-shadow: 0 0 8px rgba(235, 95, 70, 0.5);
          pointer-events: none;
          z-index: 1;
          animation: navPingWave 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes navPingWave {
          0% {
            transform: scale(0.9);
            opacity: 0.95;
          }
          60% {
            transform: scale(1.65);
            opacity: 0;
          }
          100% {
            transform: scale(1.65);
            opacity: 0;
          }
        }

        /* Mobile Hamburger notification dot */
        .mobile-hamburger-ping {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #e14938;
          border: 1.5px solid #080c12;
          box-shadow: 0 0 8px #e14938;
          animation: hamburgerPulse 1.8s ease-in-out infinite alternate;
          pointer-events: none;
        }

        @keyframes hamburgerPulse {
          from {
            transform: scale(0.85);
            box-shadow: 0 0 4px #e14938;
          }
          to {
            transform: scale(1.25);
            box-shadow: 0 0 12px #ff6955, 0 0 6px #e5b058;
          }
        }
      `}</style>

      <header className={`site-navbar ${scrolled ? "scrolled" : ""} ${isHome ? "is-home" : ""} ${open ? "menu-open" : ""}`}>
        {/* DESKTOP NAVBAR: Exactly 3 Grid Columns (Left 1fr, Center Auto, Right 1fr) */}
        <div className="nav-grid-container desktop-only">
          {/* Left shortcuts - aligned to Left Edge */}
          <nav className="nav-edge-side left" aria-label="Left navigation">
            {leftNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link-btn ${isActive ? "active" : ""}`
                }
              >
                {item.title}
              </NavLink>
            ))}
          </nav>

          {/* Middle Center Logo */}
          <Link
            to="/"
            className="nav-center-brand"
            aria-label="Go to Trinity home"
          >
            <img src={logo} alt="Trinity Logo" />
          </Link>

          {/* Right shortcuts - aligned to Right Edge */}
          <nav className="nav-edge-side right" aria-label="Right navigation">
            {rightNavItems.map((item) => {
              const isAnnouncements = item.path === "/announcements";
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link-btn ${isActive ? "active" : ""} ${
                      isAnnouncements ? "announcements-nav-item" : ""
                    }`
                  }
                >
                  <span>{item.title}</span>
                  {isAnnouncements && unreadCount > 0 && (
                    <span
                      className="nav-ping-badge"
                      title={`${unreadCount} new announcement${
                        unreadCount > 1 ? "s" : ""
                      }`}
                      aria-label={`${unreadCount} new announcements`}
                    >
                      <span className="nav-ping-ring" />
                      <span className="nav-ping-core">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* MOBILE TOP BAR (< 980px) */}
        <div className="mobile-bar mobile-only">
          <div className="mobile-spacer" />
          <Link
            to="/"
            className="mobile-logo-link"
            onClick={() => setOpen(false)}
          >
            <img src={logo} alt="Trinity Logo" className="mobile-logo-img" />
          </Link>
          <button
            className="nav-mobile-hamburger"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            style={{ position: "relative" }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
            {unreadCount > 0 && !open && (
              <span className="mobile-hamburger-ping" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div className={`nav-mobile-overlay ${open ? "open" : ""}`}>
        <div className="nav-mobile-list">
          {allNavItems.map((item) => {
            const isAnnouncements = item.path === "/announcements";
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link-btn ${isActive ? "active" : ""} ${
                    isAnnouncements ? "announcements-nav-item" : ""
                  }`
                }
                onClick={() => setOpen(false)}
                style={
                  isAnnouncements
                    ? {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }
                    : undefined
                }
              >
                <span>{item.title}</span>
                {isAnnouncements && unreadCount > 0 && (
                  <span
                    className="nav-ping-badge"
                    title={`${unreadCount} new announcements`}
                  >
                    <span className="nav-ping-ring" />
                    <span className="nav-ping-core">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
}
