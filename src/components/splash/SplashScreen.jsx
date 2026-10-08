import React, { useEffect, useRef, useState } from "react";
import sindhuImg from "../../assets/homepage/sindhu.png";
import aakarImg from "../../assets/homepage/aakar.png";
import pragyaImg from "../../assets/homepage/pragya.png";
import kshatraImg from "../../assets/homepage/kshatra.png";
import aarohanImg from "../../assets/homepage/aarohan.png";
import utkarshImg from "../../assets/homepage/utkarsh.png";
import { createGoopRenderer } from "./goopRenderer";
import {
  createFx,
  clamp01,
  range,
  lerp,
  envelope,
  easeInOutCubic,
  easeOutCubic,
  easeInOutSine,
} from "./splashFx";
import "./SplashScreen.css";

const SEEN_KEY = "anugatha-splash-seen";
const TITLE = "अनुगाथा";

// Six official order emblems and where each one starts on screen.
// sx/sy: side of the screen (-1 left/top, 0 middle, 1 right/bottom); theta0/thetaEven in radians.
const ICONS = [
  { name: "Aakar", src: aakarImg, sx: -1, sy: -1, theta0: (-3 * Math.PI) / 4, thetaEven: (-2 * Math.PI) / 3 },
  { name: "Shourya", src: kshatraImg, sx: 1, sy: -1, theta0: -Math.PI / 4, thetaEven: -Math.PI / 3 },
  { name: "Sindhu", src: sindhuImg, sx: -1, sy: 0, theta0: Math.PI, thetaEven: Math.PI },
  { name: "Aarohan", src: aarohanImg, sx: 1, sy: 0, theta0: 0, thetaEven: 0 },
  { name: "Utkarsh", src: utkarshImg, sx: -1, sy: 1, theta0: (3 * Math.PI) / 4, thetaEven: (2 * Math.PI) / 3 },
  { name: "Pragya", src: pragyaImg, sx: 1, sy: 1, theta0: Math.PI / 4, thetaEven: Math.PI / 3 },
];

// Timeline (seconds)
const T = {
  orbitStart: 0.9,
  orbitEnd: 4.3,
  revealStart: 5.3,
  exitStart: 7.5,
  exitEnd: 8.5,
};
const TURNS = 1.0;

// Soundtrack: a riser whose single boom (at 7.20s into the file) must land exactly on the
// Anugatha reveal (T.revealHit). The splash clock is the master; the audio is kept in step.
const AUDIO_SRC = "/logo_audio/logo_reveal_audio.mp3";
const AUDIO_BOOM_AT = 7.2;
T.revealHit = T.revealStart + 0.15; // the moment the title starts emerging
const AUDIO_OFFSET = AUDIO_BOOM_AT - T.revealHit; // audio position at splash t = 0

function shouldPlay() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has("splash")) return true; // ?splash forces a replay
  if (window.location.pathname !== "/") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false;
  } catch {
    // storage blocked: still play
  }
  return true;
}

function decodeImage(src) {
  const img = new Image();
  img.src = src;
  return img.decode().catch(() => {});
}

// Reads the landing hero title so the splash can end exactly where it sits.
function measureLandingTitle() {
  const h1 = document.querySelector(".homepage .center-title h1");
  if (!h1) return null;
  const rect = h1.getBoundingClientRect();
  if (!rect.width) return null;
  const cs = getComputedStyle(h1);
  return {
    rect,
    style: {
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      lineHeight: cs.lineHeight,
      backgroundImage: cs.backgroundImage,
      filter: cs.filter,
    },
  };
}

export default function SplashScreen() {
  // "gate" (press to reveal) -> "play" (cinematic splash) -> null (landing page)
  const [phase, setPhase] = useState(() => (shouldPlay() ? "gate" : null));
  const rootRef = useRef(null);
  const goopRef = useRef(null);
  const fxRef = useRef(null);
  const iconRefs = useRef([]);
  const titleRef = useRef(null);
  const glowRef = useRef(null);
  const blackRef = useRef(null);
  const dimRef = useRef(null);
  const veilRef = useRef(null);
  const gateBtnRef = useRef(null);
  const audioRef = useRef(null);

  // keep the landing page from scrolling underneath while the intro is up
  const covered = phase !== null;
  useEffect(() => {
    if (!covered) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      html.style.overflow = prev;
    };
  }, [covered]);

  // gate: preload while waiting, start the splash on any press
  useEffect(() => {
    if (phase !== "gate") return;
    for (const icon of ICONS) decodeImage(icon.src);
    document.fonts?.load(`400 80px "Noto Serif Devanagari"`, TITLE).catch(() => {});
    gateBtnRef.current?.focus({ preventScroll: true });
    if (!audioRef.current) {
      const audio = new Audio(AUDIO_SRC);
      audio.preload = "auto";
      audioRef.current = audio;
    }
    const reveal = (e) => {
      if (e.type === "keydown" && (e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.key === "Tab")) return;
      // start the soundtrack inside the press itself (strict autoplay policies, e.g. Safari);
      // the splash re-aligns it to its own clock once the animation starts
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = AUDIO_OFFSET;
        audio.volume = 0;
        audio.play().catch(() => {});
      }
      setPhase("play");
    };
    window.addEventListener("pointerdown", reveal);
    window.addEventListener("keydown", reveal);
    return () => {
      window.removeEventListener("pointerdown", reveal);
      window.removeEventListener("keydown", reveal);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "play") return;
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // ignore
    }

    const root = rootRef.current;
    const goop = createGoopRenderer(goopRef.current);
    if (!goop) {
      setPhase(null);
      return;
    }
    const fx = createFx(fxRef.current);

    let W = 0;
    let H = 0;
    let iconSize = 120;
    let title = null; // measured landing title
    let center = { x: 0, y: 0 }; // convergence point = landing title centre
    const trails = ICONS.map(() => []);
    const lastPos = ICONS.map(() => null);

    const layout = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      iconSize = Math.max(84, Math.min(190, Math.min(W, H) * 0.19));
      goop.resize(W, H);
      fx.resize(W, H);
      for (const img of iconRefs.current) {
        if (img) img.style.width = img.style.height = `${iconSize}px`;
      }
      // copy the landing hero veil (.artifacts-orbit::before) so the hand-off matches exactly
      const orbit = document.querySelector(".homepage .artifacts-orbit");
      const veil = veilRef.current;
      const veilSize = orbit ? parseFloat(getComputedStyle(orbit, "::before").width) : 0;
      if (orbit && veilSize > 0) {
        const o = orbit.getBoundingClientRect();
        Object.assign(veil.style, {
          display: "block",
          left: `${o.left + o.width / 2 - veilSize / 2}px`,
          top: `${o.top + o.height / 2 - veilSize / 2}px`,
          width: `${veilSize}px`,
          height: `${veilSize}px`,
        });
      } else {
        veil.style.display = "none";
      }
      title = measureLandingTitle();
      const titleEl = titleRef.current;
      const glowEl = glowRef.current;
      if (title) {
        center = { x: title.rect.left + title.rect.width / 2, y: title.rect.top + title.rect.height / 2 };
        for (const el of [titleEl, glowEl]) {
          Object.assign(el.style, {
            left: `${title.rect.left}px`,
            top: `${title.rect.top}px`,
            width: `${title.rect.width}px`,
            height: `${title.rect.height}px`,
            fontFamily: title.style.fontFamily,
            fontSize: title.style.fontSize,
            fontWeight: title.style.fontWeight,
            letterSpacing: title.style.letterSpacing,
            lineHeight: title.style.lineHeight,
          });
        }
        titleEl.style.backgroundImage = title.style.backgroundImage;
      } else {
        center = { x: W / 2, y: H / 2 };
        const fs = Math.max(52, Math.min(104, W * 0.078));
        for (const el of [titleEl, glowEl]) {
          Object.assign(el.style, {
            left: "0px",
            width: `${W}px`,
            top: `${H / 2 - fs * 0.5}px`,
            height: `${fs}px`,
            fontSize: `${fs}px`,
          });
        }
      }
    };

    // where an icon is at orbit progress u (0..1)
    const iconPose = (icon, u) => {
      const gx = Math.max(24, W * 0.05);
      const gy = Math.max(24, H * 0.07);
      const ax = W / 2 - iconSize / 2 - gx;
      const ay = H / 2 - iconSize / 2 - gy;
      const vc = { x: W / 2, y: H / 2 };
      const start = { x: vc.x + icon.sx * ax, y: vc.y + icon.sy * ay };

      // the orbit centre glides from the screen centre to the title centre
      const ce = easeInOutSine(u);
      const ox = lerp(vc.x, center.x, ce);
      const oy = lerp(vc.y, center.y, ce);

      // screen-shaped ellipse that rounds into a circle as it tightens
      const m = Math.min(ax, ay);
      const roundness = easeInOutSine(range(u, 0.1, 0.6));
      const AX = lerp(ax, m, roundness);
      const AY = lerp(ay, m, roundness);

      // fixed radius first, then a smooth inward spiral
      const R = u < 0.16 ? 1 : 1 - easeInOutCubic(range(u, 0.16, 1));
      const spin = TURNS * Math.PI * 2 * Math.pow(u, 2.2);
      const theta = lerp(icon.theta0, icon.thetaEven, easeInOutSine(range(u, 0.05, 0.5))) + spin;

      // corners sit outside the ellipse; ease that offset away early on
      const onEllipse0 = { x: vc.x + Math.cos(icon.theta0) * ax, y: vc.y + Math.sin(icon.theta0) * ay };
      const off = 1 - easeInOutSine(range(u, 0, 0.32));
      const dx = (start.x - onEllipse0.x) * off;
      const dy = (start.y - onEllipse0.y) * off;

      return {
        x: ox + Math.cos(theta) * AX * R + dx,
        y: oy + Math.sin(theta) * AY * R + dy,
        rot: spin * 0.45,
      };
    };

    let raf = 0;
    let startTime = 0;
    let lastNow = 0;
    let exitAt = T.exitStart;
    let exitLen = T.exitEnd - T.exitStart;
    let burstDone = false;
    let hitDone = false;
    let audioBlocked = false; // browser refused playback: run silently
    const audio = audioRef.current;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      setPhase(null);
    };

    const skip = (e) => {
      if (!startTime || e?.repeat) return;
      const t = (performance.now() - startTime) / 1000;
      if (t < 0.5) return; // ignore the tail of the press that opened the gate
      if (t < exitAt) {
        exitAt = t;
        exitLen = 0.6;
      }
    };

    const frame = (now) => {
      const t = (now - startTime) / 1000;
      const dt = Math.min(0.05, (now - lastNow) / 1000 || 0.016);
      lastNow = now;
      const u = range(t, T.orbitStart, T.orbitEnd);
      const massR = Math.min(W, H) * 0.075;

      // ---- intro fade + background dim ----
      blackRef.current.style.opacity = String(1 - easeInOutSine(range(t, 0, 1.2)));
      dimRef.current.style.opacity = String(0.55 * (1 - easeInOutSine(range(t, 5.6, 7.4))));

      fx.begin();

      // ---- icons: orbit, spiral, absorb ----
      const balls = [];
      const absorb = range(u, 0.74, 0.97);
      ICONS.forEach((icon, i) => {
        const pose = iconPose(icon, u);
        const img = iconRefs.current[i];
        const appear = easeOutCubic(range(t, 0.15 + i * 0.08, 0.95 + i * 0.08));
        const scale =
          lerp(0.82, 1, appear) * lerp(1, 0.6, easeInOutSine(range(u, 0.2, 1))) * lerp(1, 0.55, absorb);
        if (img) {
          img.style.transform = `translate3d(${pose.x - iconSize / 2}px, ${pose.y - iconSize / 2}px, 0) rotate(${pose.rot}rad) scale(${scale})`;
          img.style.opacity = String(appear * (1 - absorb));
          img.style.filter = absorb > 0 ? `brightness(${1 + absorb * 1.6}) saturate(${1 + absorb * 0.4})` : "";
        }

        // comet trail + dust while orbiting
        const tr = trails[i];
        tr.unshift({ x: pose.x, y: pose.y });
        if (tr.length > 14) tr.pop();
        const prev = lastPos[i];
        const speed = prev ? Math.hypot(pose.x - prev.x, pose.y - prev.y) / dt : 0;
        lastPos[i] = pose;
        const trailI = clamp01(speed / 700) * range(u, 0.2, 0.4) * (1 - range(u, 0.82, 0.98));
        fx.trail(tr, trailI, iconSize * 0.05);
        if (u > 0.05 && u < 0.98 && Math.random() < 0.15 + u * 0.6) {
          fx.spawn(pose.x + (Math.random() - 0.5) * iconSize * 0.5, pose.y + (Math.random() - 0.5) * iconSize * 0.5, {
            speed: 0.3 + Math.random() * 0.6,
            life: 40 + Math.random() * 40,
            size: 1 + Math.random() * 2,
            starChance: 0.25,
          });
        }

        // liquid gathers around each emblem as it nears the centre
        const grow = easeInOutSine(range(u, 0.55, 0.92)) * (1 - easeInOutSine(range(t, T.orbitEnd, T.orbitEnd + 0.5)));
        balls.push({ x: pose.x, y: pose.y, r: iconSize * 0.36 * scale * grow });
      });

      // ---- central golden mass ----
      const massGrow = easeOutCubic(range(u, 0.7, 1));
      const compress = 1 - 0.3 * envelope(t, 4.3, 4.6, 5.0, 5.5);
      const splash = easeInOutSine(range(t, T.revealStart, T.revealStart + 0.8));
      const splashR = title ? title.rect.width * 0.24 : massR * 1.8;
      const dissolve = easeInOutSine(range(t, 6.1, 7.3));
      const massRadius = lerp(massR * massGrow * compress, splashR, splash) * (1 - dissolve);

      const core = 1.7 * envelope(t, 4.2, 4.45, 4.6, 5.2) + 0.6 * envelope(t, 4.4, 4.9, 5.5, 6.3) +
        1.3 * envelope(t, T.revealHit - 0.04, T.revealHit, T.revealHit + 0.08, T.revealHit + 0.7); // boom flash
      const orbR = Math.min(W, H) * (0.27 + 0.07 * easeOutCubic(range(t, 5.3, 6.3)));
      const orbRadius = lerp(massR * 0.6, orbR, easeOutCubic(range(t, 4.35, 5.3)));

      goop.render({
        time: t,
        balls,
        mass: { x: center.x, y: center.y, r: massRadius, splash: 0.55 * splash },
        orb: { x: center.x, y: center.y, r: orbRadius, alpha: envelope(t, 4.35, 4.85, 5.4, 6.3) },
        glow: 0.25 + 0.75 * envelope(t, 4.0, 4.5, 5.6, 6.6),
        core,
        alpha: 1,
      });

      // ---- energy burst, filaments, streak ----
      if (!burstDone && t >= T.orbitEnd + 0.05) {
        burstDone = true;
        for (let k = 0; k < 150; k++) {
          fx.spawn(center.x, center.y, {
            speed: 2 + Math.random() * 6,
            life: 60 + Math.random() * 60,
            drag: 0.955,
            size: 1.5 + Math.random() * 3,
            starChance: 0.4,
          });
        }
      }
      fx.filaments(center.x, center.y, orbRadius, envelope(t, 4.2, 4.9, 6.0, 7.0), t * 0.22);
      fx.bloom(center.x, center.y, massR * (2.2 + core), envelope(t, 3.9, 4.45, 5.2, 6.4) * 0.9);
      fx.streak(center.x, center.y, envelope(t, 4.2, 4.5, 5.6, 6.6), W * 0.55);

      // the boom: a burst + bloom exactly as the audio hits and the title starts to emerge
      if (!hitDone && t >= T.revealHit) {
        hitDone = true;
        for (let k = 0; k < 110; k++) {
          fx.spawn(center.x, center.y, {
            speed: 2.5 + Math.random() * 7,
            life: 50 + Math.random() * 60,
            drag: 0.95,
            size: 1.5 + Math.random() * 3,
            starChance: 0.45,
          });
        }
      }
      fx.bloom(center.x, center.y, massR * 3.4, envelope(t, T.revealHit - 0.04, T.revealHit, T.revealHit + 0.1, T.revealHit + 0.9));

      // golden energy streams spiralling into the mass before the flash
      if (t > 3.3 && t < T.orbitEnd) {
        for (let k = 0; k < 3; k++) {
          const a = Math.random() * Math.PI * 2;
          const rr = massR * (2.6 + Math.random() * 2.2);
          const inward = a + Math.PI + 0.55; // aim past the centre so they swirl in
          fx.spawn(center.x + Math.cos(a) * rr, center.y + Math.sin(a) * rr, {
            angle: inward,
            speed: 3.2 + Math.random() * 2.2,
            life: 26 + Math.random() * 14,
            drag: 0.955,
            size: 1.2 + Math.random() * 1.8,
            starChance: 0.15,
          });
        }
      }

      // golden dust settling around the title
      if (t > T.revealStart + 0.3 && t < 7.0 && Math.random() < 0.9 * (1 - range(t, 6.2, 7.0))) {
        const a = Math.random() * Math.PI * 2;
        const rr = (title ? title.rect.width * 0.35 : massR * 2) * (0.6 + Math.random() * 0.6);
        fx.spawn(center.x + Math.cos(a) * rr, center.y + Math.sin(a) * rr * 0.55, {
          angle: a,
          speed: 0.15 + Math.random() * 0.4,
          life: 60 + Math.random() * 50,
          size: 1 + Math.random() * 1.8,
          starChance: 0.2,
        });
      }
      fx.drawSparks(dt);

      // ---- Anugatha emerges from the liquid ----
      const reveal = range(t, T.revealStart + 0.1, T.revealStart + 1.2);
      const maskR = easeOutCubic(reveal) * 130;
      const blur = 10 * (1 - easeOutCubic(range(t, T.revealStart + 0.1, T.revealStart + 1.4)));
      const bright = 1 + 0.9 * (1 - easeInOutSine(range(t, T.revealStart + 0.3, T.revealStart + 1.9)));
      const tScale = lerp(1.1, 1, easeOutCubic(range(t, T.revealStart + 0.1, T.revealStart + 1.6)));
      const titleEl = titleRef.current;
      const mask = `radial-gradient(ellipse at 50% 55%, #000 ${maskR}%, transparent ${maskR + 22}%)`;
      titleEl.style.opacity = reveal > 0 ? "1" : "0";
      titleEl.style.webkitMaskImage = titleEl.style.maskImage = reveal >= 1 ? "none" : mask;
      titleEl.style.transform = `scale(${tScale})`;
      const baseFilter = title ? title.style.filter : "";
      titleEl.style.filter = `${blur > 0.05 ? `blur(${blur}px) ` : ""}${bright > 1.001 ? `brightness(${bright}) saturate(${1 + (bright - 1) * 0.4}) ` : ""}${baseFilter === "none" ? "" : baseFilter}`;
      const glowEl = glowRef.current;
      glowEl.style.opacity = String(0.85 * envelope(t, T.revealStart + 0.1, T.revealStart + 0.7, T.revealStart + 1.1, T.revealStart + 2.2));
      glowEl.style.transform = `scale(${tScale})`;

      // ---- hand-off: fade the whole layer to reveal the identical landing page ----
      const exit = range(t, exitAt, exitAt + exitLen);
      root.style.opacity = String(1 - easeInOutSine(exit));

      // ---- soundtrack: keep it locked to the splash clock so the boom lands on the reveal ----
      if (audio && !audio.ended && !audioBlocked) {
        const expected = t + AUDIO_OFFSET;
        if (audio.paused) {
          audio.currentTime = expected;
          audio.play().catch(() => {
            audioBlocked = true;
          });
        } else if (Math.abs(audio.currentTime - expected) > 0.06) {
          audio.currentTime = expected;
        }
        const fadeIn = range(t, 0, 0.5);
        const skipped = exitAt < T.exitStart;
        audio.volume = clamp01(fadeIn * (skipped ? 1 - exit : 1));
      }
      if (exit >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    root.addEventListener("pointerdown", skip);

    // wait for emblems + title font (bounded) so nothing pops in mid-sequence
    let cancelled = false;
    const ready = Promise.race([
      Promise.all([
        ...ICONS.map((icon) => decodeImage(icon.src)),
        document.fonts ? document.fonts.load(`400 80px "Noto Serif Devanagari"`, TITLE).catch(() => {}) : null,
      ]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
    ready.then(() => {
      if (cancelled) return;
      layout();
      startTime = lastNow = performance.now();
      raf = requestAnimationFrame(frame);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      root.removeEventListener("pointerdown", skip);
      audio?.pause();
      goop.dispose();
    };
  }, [phase]);

  if (!phase) return null;

  return (
    <div ref={rootRef} className="anugatha-splash">
      <div className="anugatha-splash__bg" aria-hidden="true" />
      <div ref={veilRef} className="anugatha-splash__veil" aria-hidden="true" />
      <div ref={dimRef} className="anugatha-splash__dim" aria-hidden="true" />
      <div className="anugatha-splash__icons" aria-hidden="true">
        {ICONS.map((icon, i) => (
          <img
            key={icon.name}
            ref={(el) => (iconRefs.current[i] = el)}
            src={icon.src}
            alt=""
            draggable="false"
            className="anugatha-splash__icon"
          />
        ))}
      </div>
      <canvas ref={goopRef} className="anugatha-splash__canvas" aria-hidden="true" />
      <canvas ref={fxRef} className="anugatha-splash__canvas" aria-hidden="true" />
      <div ref={glowRef} className="anugatha-splash__title anugatha-splash__title--glow" lang="hi" aria-hidden="true">
        {TITLE}
      </div>
      <div ref={titleRef} className="anugatha-splash__title anugatha-splash__title--main" lang="hi" aria-hidden="true">
        {TITLE}
      </div>
      <div ref={blackRef} className="anugatha-splash__black" aria-hidden="true" />

      <div className={`anugatha-gate ${phase === "play" ? "anugatha-gate--leaving" : ""}`}>
        <div className="anugatha-gate__bg" aria-hidden="true" />
        <div className="anugatha-gate__content">
          <p className="anugatha-gate__kicker">A living archive</p>
          <button ref={gateBtnRef} type="button" className="anugatha-gate__button" tabIndex={phase === "gate" ? 0 : -1}>
            <span className="anugatha-gate__ring" aria-hidden="true" />
            <span className="anugatha-gate__label">Press to reveal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
