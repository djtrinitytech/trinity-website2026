import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import hariSirImg from "../../assets/homepage/hari_sir.jpg";
import "./AboutSection.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutSection() {
  const sectionRef = useRef(null);
  const portraitCardRef = useRef(null);
  const portraitImgRef = useRef(null);
  const directorLayerRef = useRef(null);
  const aboutLayerRef = useRef(null);
  const watermarkRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(".about-archival-rule", { opacity: 0, y: 20 });

      gsap.set(portraitCardRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.97,
      });

      gsap.set(
        [
          ".director-eyebrow",
          ".director-title",
          ".director-attribution",
          ".director-quote-box",
        ],
        { opacity: 0, y: 24 },
      );

      gsap.set(".about-mid-divider", { opacity: 0, scaleX: 0.8 });

      gsap.set(aboutLayerRef.current, { opacity: 0, y: 20 });
      gsap.set([".about-title", ".about-desc-lead"], { opacity: 0, y: 16 });

      // Main ScrollTrigger Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          end: "bottom bottom",
          toggleActions: "play none none none",
        },
      });

      tl.to(".about-archival-rule", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
      })
        .to(
          portraitCardRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power2.out",
          },
          "-=0.4",
        )
        .to(
          [
            ".director-eyebrow",
            ".director-title",
            ".director-attribution",
            ".director-quote-box",
          ],
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
          },
          "-=0.7",
        )
        .to(
          ".about-mid-divider",
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.7,
            ease: "power2.out",
          },
          "-=0.3",
        )
        .to(
          aboutLayerRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.3",
        )
        .to(
          [".about-title", ".about-desc-lead"],
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
          },
          "-=0.6",
        );

      // Subtle Parallax on scroll
      if (portraitImgRef.current) {
        gsap.to(portraitImgRef.current, {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: directorLayerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }

      if (watermarkRef.current) {
        gsap.to(watermarkRef.current, {
          rotation: 18,
          y: -25,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="anugatha-about-section"
      aria-label="Director Message and About Us"
    >
      {/* Background Ambient Celestial Grid & Radial Glow */}
      <div className="about-bg-grid" aria-hidden="true" />
      <div className="about-bg-glow" aria-hidden="true" />

      {/* Decorative Rotating Celestial Astrolabe Watermark */}
      <div
        ref={watermarkRef}
        className="about-celestial-watermark"
        aria-hidden="true"
      >
        <svg viewBox="0 0 600 600" fill="none">
          <circle
            cx="300"
            cy="300"
            r="280"
            stroke="rgba(214, 175, 102, 0.08)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <circle
            cx="300"
            cy="300"
            r="210"
            stroke="rgba(214, 175, 102, 0.05)"
            strokeWidth="1"
          />
          <circle
            cx="300"
            cy="300"
            r="140"
            stroke="rgba(75, 156, 153, 0.08)"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
          <line
            x1="300"
            y1="20"
            x2="300"
            y2="580"
            stroke="rgba(214, 175, 102, 0.06)"
            strokeWidth="1"
          />
          <line
            x1="20"
            y1="300"
            x2="580"
            y2="300"
            stroke="rgba(214, 175, 102, 0.06)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="about-content-wrapper">
        {/* Archival Section Preface Rule */}
        <div className="about-archival-rule" aria-hidden="true">
          <span className="rule-coord">19° 06′ N · 72° 50′ E</span>
          <span className="rule-line" />
          <span className="rule-symbol">✦</span>
          <span className="rule-line" />
          <span className="rule-codex">CHRONICLE</span>
        </div>

        {/* ==============================================================
            SECTION 1 — THE DIRECTOR'S MESSAGE (FIRST)
            ============================================================== */}
        <div ref={directorLayerRef} className="about-layer-director">
          {/* LEFT: Clean portrait of Dr. Hari Vasudevan (NO border frame) */}
          <div className="director-portrait-col">
            <div
              ref={portraitCardRef}
              className="director-portrait-clean"
              aria-label="Portrait of Dr. Hari Vasudevan, Director & Principal"
            >
              <div className="portrait-image-box">
                <img
                  ref={portraitImgRef}
                  src={hariSirImg}
                  alt="Dr. Hari Vasudevan, Director & Principal of DJSCE"
                  className="portrait-clean-img"
                  loading="lazy"
                  draggable="false"
                />
              </div>

              {/* Clean Understated Portrait Identification */}
              <div className="portrait-clean-caption">
                <span className="caption-role">
                  Director / Principal · DJSCE
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Director's Vision & Institutional Message */}
          <div className="director-editorial-col">
            <div className="director-eyebrow">
              <span className="dir-kicker-bar" aria-hidden="true" />
              <span className="dir-kicker-text">LEADERSHIP & VISION</span>
            </div>

            <h3 className="director-title">Dr. Hari Vasudevan</h3>

            <div className="director-attribution">
              <span className="attr-role">Principal & Director, DJSCE</span>
            </div>

            {/* Editorial Quote Box */}
            <div className="director-quote-box">
              <span className="quote-mark-open" aria-hidden="true">
                “
              </span>
              <blockquote className="director-message-text">
                In a short span of 32 years, Dwarkadas J. Sanghvi College of
                Engineering (DJSCE), an Autonomous Institution, affiliated to
                the University of Mumbai and owned by SVKM has come a long way
                and has made its impact felt not only in the country, but also
                abroad. Our students have been performing exceedingly well in
                national and globally competent multinational companies and also
                in the universities in India and abroad as they pursue their
                higher education.
              </blockquote>
            </div>
          </div>
        </div>

        {/* Fine Archival Hairline Separator */}
        <div className="about-mid-divider" aria-hidden="true">
          <span className="mid-divider-line" />
          <span className="mid-divider-glyph">⚜</span>
          <span className="mid-divider-line" />
        </div>

        {/* ==============================================================
            SECTION 2 — ABOUT US (AT THE BOTTOM BELOW THE MESSAGE)
            ============================================================== */}
        <div ref={aboutLayerRef} className="about-layer-trinity">
          <h2 className="about-title">About Us</h2>

          <p className="about-desc-lead">
            Trinity embodies the spirit of D.J. Sanghvi as the most anticipated
            and cherished annual socio-cultural, sports and technical festival.
            Trinity is a coalescence of innovation and technology, festivities
            and social responsibilities, and the competitive streak of sports.
            The grandeur of Trinity is sure to attract students not only from
            Mumbai but from colleges all around the world.
          </p>
        </div>
      </div>
    </section>
  );
}
