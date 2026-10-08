import React from "react";
import { useLocation } from "react-router-dom";
import { Heart } from "lucide-react";

// Mock brand icons compatible with Lucide icon interface
const Instagram = ({ size = 22, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const Linkedin = ({ size = 22, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const Youtube = ({ size = 22, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
  </svg>
);

const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
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
      className={"w-full border-t backdrop-blur-md relative"}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.97)",
        fontFamily: "'Reggae One', cursive",
      }}
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-4 px-4 gap-4">
        {/* Left Section */}
        <div className="text-center md:text-left">
          <p className="text-sm" style={{ color: gold }}>
            © {new Date().getFullYear()} DJS Trinity. All rights reserved.
          </p>
        </div>

        {/* Center Section: Social Icons */}
        <div className="flex items-center space-x-4 justify-center">
          {socialLinks.map(({ icon: Icon, link, label }, idx) => (
            <a
              key={idx}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg transition-transform hover:scale-110"
              style={{
                backgroundColor: "rgba(243,207,155,0.15)",
                color: linkColor,
                border: `1px solid ${gold}`,
              }}
              aria-label={label}
            >
              <Icon size={22} />
            </a>
          ))}
        </div>

        {/* Right Section */}
        <div className="text-center md:text-right text-sm flex items-center" style={{ color: gold }}>
          <span>Made with</span>
          <Heart size={16} className="mx-1" style={{ color: gold }} />
          <span>by DJS Trinity</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
