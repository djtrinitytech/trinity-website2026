import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import logo from "../images/trinity_logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
          transition: all 0.3s ease;
        }

        .site-navbar.scrolled {
          background: rgba(8, 12, 18, 0.88);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
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
      `}</style>

      <header className={`site-navbar ${scrolled ? "scrolled" : ""}`}>
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
            {rightNavItems.map((item) => (
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
        </div>

        {/* MOBILE TOP BAR (< 980px) */}
        <div className="mobile-bar mobile-only">
          <div className="mobile-spacer" />
          <Link to="/" className="mobile-logo-link" onClick={() => setOpen(false)}>
            <img src={logo} alt="Trinity Logo" className="mobile-logo-img" />
          </Link>
          <button
            className="nav-mobile-hamburger"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div className={`nav-mobile-overlay ${open ? "open" : ""}`}>
        <div className="nav-mobile-list">
          {allNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link-btn ${isActive ? "active" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              {item.title}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}
