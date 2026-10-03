import React from "react";
import { useLocation } from "react-router-dom";
import { Heart } from "lucide-react";

// Brand icons compatible with Lucide icon interface
const Instagram = ({ size = 22, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Linkedin = ({ size = 22, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Youtube = ({ size = 22, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
  </svg>
);

export default function Footer() {
  const gold = "#f3cf9b";
  const linkColor = "#dc9d4a";

  const socialLinks = [
    {
      icon: Instagram,
      link: "https://www.instagram.com/djsce.trinity/",
      label: "Instagram",
    },
    {
      icon: Youtube,
      link: "https://www.youtube.com/@DJSCETRINITY24",
      label: "YouTube",
    },
    {
      icon: Linkedin,
      link: "https://www.linkedin.com/company/djsce-trinity/",
      label: "LinkedIn",
    },
  ];

  return (
    <footer
      className="footer"
      style={{
        width: "100%",
        borderTop: "1px solid rgba(214, 175, 102, 0.2)",
        backgroundColor: "rgba(5, 11, 24, 0.95)",
        backdropFilter: "blur(12px)",
        padding: "18px clamp(16px, 3.5vw, 48px)",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          width: "100%",
          maxWidth: "1440px",
          margin: "0 auto",
        }}
      >
        {/* Left Section */}
        <div style={{ color: gold, fontSize: "13.5px" }}>
          © {new Date().getFullYear()} DJS Trinity. All rights reserved.
        </div>

        {/* Center Section: Social Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {socialLinks.map(({ icon: Icon, link, label }, idx) => (
            <a
              key={idx}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                borderRadius: "8px",
                backgroundColor: "rgba(243, 207, 155, 0.1)",
                color: linkColor,
                border: "1px solid rgba(243, 207, 155, 0.3)",
                transition: "all 0.2s ease",
              }}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        {/* Right Section */}
        <div
          style={{
            color: gold,
            fontSize: "13.5px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span>Made with</span>
          <Heart size={15} style={{ color: "#e5b058", fill: "#e5b058" }} />
          <span>by DJS Trinity</span>
        </div>
      </div>
    </footer>
  );
}
