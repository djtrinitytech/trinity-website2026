import React, { useEffect, useRef } from "react";

const MAX_PARTICLES = 160;
const SPAWN_SPACING = 9; // px between particles along the pointer path
const MAX_SPAWN_PER_MOVE = 6;
const HUES = [32, 36, 41, 45, 50]; // gold range, pre-rendered as sprites
const SPRITE_R = 12; // star radius inside the sprite, in sprite px
const SPRITE_GLOW = 26; // baked-in glow blur, in sprite px
const SPRITE_HALF = SPRITE_R + SPRITE_GLOW + 4;

function drawStar(ctx, size) {
  const inner = size * 0.22;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 === 0 ? size : inner;
    const angle = (i * Math.PI) / 4;
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
}

// shadowBlur is the expensive part of the effect, so render each glowing star once
// and stamp it with drawImage every frame instead of re-blurring per particle.
function makeSprite(hue) {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE_HALF * 2;
  const ctx = sprite.getContext("2d");
  ctx.translate(SPRITE_HALF, SPRITE_HALF);
  ctx.shadowBlur = SPRITE_GLOW;
  ctx.shadowColor = `hsla(${hue}, 85%, 60%, 0.9)`;
  ctx.fillStyle = `hsl(${hue}, 90%, 79%)`;
  drawStar(ctx, SPRITE_R);
  return sprite;
}

export default function CursorSparkles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const sprites = HUES.map(makeSprite);
    const particles = [];
    let dpr = 1;
    let frame = 0;
    let lastX = -1;
    let lastY = -1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };

    const tick = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life >= p.maxLife) {
          // swap-remove: O(1) instead of splice
          particles[i] = particles[particles.length - 1];
          particles.pop();
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035;
        p.vx *= 0.98;
        p.rotation += p.spin;

        const progress = p.life / p.maxLife;
        const alpha = progress < 0.15 ? progress / 0.15 : 1 - (progress - 0.15) / 0.85;
        const twinkle = 0.7 + Math.sin(p.life * 0.6) * 0.3;
        const scale = ((p.size * (1 - progress * 0.5)) / SPRITE_R) * dpr;
        const cos = Math.cos(p.rotation) * scale;
        const sin = Math.sin(p.rotation) * scale;

        ctx.globalAlpha = alpha * twinkle;
        ctx.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr);
        ctx.drawImage(p.sprite, -SPRITE_HALF, -SPRITE_HALF);
      }

      frame = particles.length > 0 ? requestAnimationFrame(tick) : 0;
    };

    const spawnOne = (x, y) => {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.2 + 0.2;
      particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        life: 0,
        maxLife: 40 + Math.random() * 40,
        size: Math.random() * 4 + 2,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.12,
        sprite: sprites[(Math.random() * sprites.length) | 0],
      });
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (lastX < 0) {
        spawnOne(x, y);
      } else {
        // spread particles along the segment so fast moves leave a continuous trail
        const distance = Math.hypot(x - lastX, y - lastY);
        const count = Math.min(Math.max(1, Math.round(distance / SPAWN_SPACING)), MAX_SPAWN_PER_MOVE);
        for (let i = 1; i <= count; i++) {
          const t = i / count;
          spawnOne(lastX + (x - lastX) * t, lastY + (y - lastY) * t);
        }
      }
      lastX = x;
      lastY = y;
      start();
    };

    const onDown = (e) => {
      for (let i = 0; i < 18; i++) spawnOne(e.clientX, e.clientY);
      start();
    };

    const onLeave = () => {
      lastX = -1;
      lastY = -1;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] h-full w-full" />;
}
