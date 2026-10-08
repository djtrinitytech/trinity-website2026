// 2D canvas layer for the splash: comet trails, sparks, spiral filaments, light streak.
// Glows are pre-rendered sprites stamped with drawImage — no per-frame shadowBlur.

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const range = (t, a, b) => clamp01((t - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
// rises then falls: 0 before a, 1 between b and c, 0 after d
export const envelope = (t, a, b, c, d) => (t < b ? easeInOutSine(range(t, a, b)) : 1 - easeInOutSine(range(t, c, d)));

function makeGlowSprite(size, stops) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) grad.addColorStop(o, col);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

function makeStarSprite(hue) {
  const half = 40;
  const c = document.createElement("canvas");
  c.width = c.height = half * 2;
  const g = c.getContext("2d");
  g.translate(half, half);
  g.shadowBlur = 22;
  g.shadowColor = `hsla(${hue}, 85%, 60%, 0.9)`;
  g.fillStyle = `hsl(${hue}, 90%, 80%)`;
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? 10 : 2.2;
    const a = (i * Math.PI) / 4;
    g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath();
  g.fill();
  return { canvas: c, half };
}

export function createFx(canvas) {
  const ctx = canvas.getContext("2d");
  const dot = makeGlowSprite(64, [
    [0, "rgba(255,244,214,1)"],
    [0.18, "rgba(255,214,140,0.85)"],
    [0.5, "rgba(214,160,70,0.25)"],
    [1, "rgba(214,160,70,0)"],
  ]);
  const bloom = makeGlowSprite(256, [
    [0, "rgba(255,246,222,1)"],
    [0.15, "rgba(255,220,150,0.8)"],
    [0.45, "rgba(230,170,80,0.22)"],
    [1, "rgba(200,140,60,0)"],
  ]);
  const stars = [36, 42, 48].map(makeStarSprite);
  const sparks = [];
  let dpr = 1;
  let w = 0;
  let h = 0;

  const fx = {
    resize(width, height) {
      w = width;
      h = height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    },

    begin() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    // tapered glowing tail following an icon's recent positions
    trail(points, intensity, width) {
      if (points.length < 3 || intensity <= 0.01) return;
      ctx.lineCap = "round";
      for (let i = points.length - 1; i > 1; i--) {
        const a = points[i];
        const b = points[i - 1];
        const k = 1 - i / points.length;
        ctx.globalAlpha = intensity * k * k * 0.9;
        ctx.strokeStyle = "rgb(255, 205, 120)";
        ctx.lineWidth = width * (0.25 + k * 0.75);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      const head = points[2];
      const s = width * 5;
      ctx.globalAlpha = intensity * 0.8;
      ctx.drawImage(dot, head.x - s / 2, head.y - s / 2, s, s);
    },

    spawn(x, y, opts = {}) {
      const angle = opts.angle ?? Math.random() * Math.PI * 2;
      const speed = opts.speed ?? Math.random() * 1.2 + 0.2;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed + (opts.vx || 0),
        vy: Math.sin(angle) * speed + (opts.vy || 0),
        life: 0,
        maxLife: opts.life ?? 50 + Math.random() * 50,
        size: opts.size ?? Math.random() * 3 + 1.5,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.1,
        drag: opts.drag ?? 0.97,
        star: Math.random() < (opts.starChance ?? 0.35),
        sprite: stars[(Math.random() * stars.length) | 0],
      });
      if (sparks.length > 420) sparks.shift();
    },

    drawSparks(dt) {
      const step = dt * 60;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.life += step;
        if (p.life >= p.maxLife) {
          sparks[i] = sparks[sparks.length - 1];
          sparks.pop();
          continue;
        }
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.vx *= Math.pow(p.drag, step);
        p.vy *= Math.pow(p.drag, step);
        p.rot += p.spin * step;
        const prog = p.life / p.maxLife;
        const alpha = prog < 0.12 ? prog / 0.12 : 1 - (prog - 0.12) / 0.88;
        const twinkle = 0.75 + Math.sin(p.life * 0.5) * 0.25;
        ctx.globalAlpha = alpha * twinkle;
        if (p.star) {
          const sc = p.size / 10;
          const c = Math.cos(p.rot) * sc * dpr;
          const s = Math.sin(p.rot) * sc * dpr;
          ctx.setTransform(c, s, -s, c, p.x * dpr, p.y * dpr);
          ctx.drawImage(p.sprite.canvas, -p.sprite.half, -p.sprite.half);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        } else {
          const s = p.size * 3;
          ctx.drawImage(dot, p.x - s / 2, p.y - s / 2, s, s);
        }
      }
    },

    // golden filaments spiralling out from the orb (reference frames 19–33)
    filaments(cx, cy, r0, alpha, rot, count = 14) {
      if (alpha <= 0.01) return;
      const maxR = Math.hypot(w, h) * 0.75;
      ctx.lineWidth = 1.3;
      const grad = ctx.createRadialGradient(cx, cy, r0 * 0.6, cx, cy, maxR);
      grad.addColorStop(0, "rgba(255,226,160,0.95)");
      grad.addColorStop(0.35, "rgba(232,180,95,0.45)");
      grad.addColorStop(1, "rgba(200,150,70,0)");
      ctx.strokeStyle = grad;
      for (let j = 0; j < count; j++) {
        const base = (j / count) * Math.PI * 2 + rot;
        const twist = 1.15 + (j % 3) * 0.18;
        ctx.globalAlpha = alpha * (0.55 + 0.45 * ((j * 7) % 5) / 4);
        ctx.beginPath();
        for (let s = 0; s <= 28; s++) {
          const r = r0 * 0.55 + (maxR - r0 * 0.55) * Math.pow(s / 28, 1.35);
          const th = base + twist * Math.log(r / (r0 * 0.55));
          const x = cx + Math.cos(th) * r;
          const y = cy + Math.sin(th) * r;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    },

    // anamorphic horizontal light streak through the core
    streak(cx, cy, alpha, width) {
      if (alpha <= 0.01) return;
      const grad = ctx.createLinearGradient(cx - width, 0, cx + width, 0);
      grad.addColorStop(0, "rgba(255,200,120,0)");
      grad.addColorStop(0.35, "rgba(255,200,120,0.35)");
      grad.addColorStop(0.5, "rgba(255,246,220,1)");
      grad.addColorStop(0.65, "rgba(255,200,120,0.35)");
      grad.addColorStop(1, "rgba(255,200,120,0)");
      ctx.fillStyle = grad;
      ctx.globalAlpha = alpha;
      ctx.fillRect(cx - width, cy - 1.5, width * 2, 3);
      ctx.globalAlpha = alpha * 0.22;
      ctx.fillRect(cx - width * 0.8, cy - 14, width * 1.6, 28);
    },

    bloom(cx, cy, radius, alpha) {
      if (alpha <= 0.01) return;
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.drawImage(bloom, cx - radius, cy - radius, radius * 2, radius * 2);
    },

    sparkCount: () => sparks.length,
  };
  return fx;
}
