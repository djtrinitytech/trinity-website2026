import React from "react";
import bgImg from "../assets/homepage/bg.png";

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
    <>
      <style>{`
        .site-footer {
          width: 100%;
          border-top: 1px solid rgba(214, 175, 102, 0.22);
          background-image: linear-gradient(180deg, rgba(8, 13, 16, 0.86) 0%, rgba(5, 9, 12, 0.96) 100%), url(${bgImg});
          background-position: center bottom;
          background-size: cover;
          background-repeat: no-repeat;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 18px clamp(20px, 3.5vw, 48px);
          margin-top: auto;
          position: relative;
        }

        .footer-inner-grid {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .footer-left {
          justify-self: start;
          color: ${gold};
          font-family: "DM Serif Display", Georgia, serif;
          font-size: 13.5px;
          letter-spacing: 0.02em;
        }

        .footer-center {
          justify-self: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }

        .footer-right {
          justify-self: end;
          color: ${gold};
          font-family: "DM Serif Display", Georgia, serif;
          font-size: 13.5px;
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .footer-social-btn {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border-radius: 9px;
          background-color: rgba(243, 207, 155, 0.08);
          color: ${gold};
          border: 1px solid rgba(243, 207, 155, 0.32);
          transition: all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
          text-decoration: none;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .footer-social-btn svg {
          display: block;
          margin: auto;
        }

        .footer-social-btn:hover {
          background-color: rgba(243, 207, 155, 0.2);
          border-color: rgba(243, 207, 155, 0.65);
          color: #fff6e0;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(220, 157, 74, 0.3);
        }

        @media (max-width: 768px) {
          .site-footer {
            padding: 22px 18px 24px !important;
          }

          .footer-inner-grid {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 14px;
          }

          .footer-left {
            justify-self: center;
            text-align: center;
            order: 1;
            font-size: 13px;
          }

          .footer-center {
            justify-self: center;
            order: 2;
            gap: 16px;
            margin: 2px 0;
          }

          .footer-right {
            justify-self: center;
            text-align: center;
            order: 3;
            font-size: 13px;
            justify-content: center;
          }
        }
      `}</style>

      <footer className="footer site-footer">
        <div className="footer-inner-grid">
          {/* Left Section */}
          <div className="footer-left">
            © {new Date().getFullYear()} DJS Trinity. All rights reserved.
          </div>

          {/* Center Section: Social Icons */}
          <div className="footer-center">
            {socialLinks.map(({ icon: Icon, link, label }, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="footer-social-btn"
              >
                <Icon size={19} />
              </a>
            ))}
          </div>

          {/* Right Section */}
          <div className="footer-right">
            <span>Made with <span style={{ fontSize: "14px", margin: "0 1px" }}>♡</span> by DJS Trinity</span>
          </div>
        </div>
      </footer>
    </>
  );
}
