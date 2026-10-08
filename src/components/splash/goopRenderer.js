// WebGL renderer for the splash's golden liquid (metaballs) and energy orb.
// Everything is computed in CSS pixels; the canvas itself renders at a reduced
// resolution (the material is soft, so it upscales cleanly) to stay smooth.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2 uRes;      // canvas size in device px
uniform float uScale;   // device px per css px
uniform float uTime;
uniform vec3 uBalls[6]; // x, y, radius (css px)
uniform vec4 uMass;     // x, y, radius, splash amount
uniform vec4 uOrb;      // x, y, radius, alpha
uniform float uGlow;    // emissive boost of the liquid
uniform float uCore;    // core flash intensity
uniform float uAlpha;   // global fade

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

float field(vec2 p) {
  // organic wobble so the liquid never looks like perfect circles
  vec2 w = vec2(noise(p * 0.011 + uTime * 0.45), noise(p * 0.011 - uTime * 0.38 + 7.3)) - 0.5;
  p += w * 22.0;

  float f = 0.0;
  for (int i = 0; i < 6; i++) {
    vec3 b = uBalls[i];
    if (b.z > 0.5) {
      vec2 d = p - b.xy;
      f += b.z * b.z / (dot(d, d) + 1.0);
    }
  }

  if (uMass.z > 0.5) {
    vec2 d = p - uMass.xy;
    float ang = atan(d.y, d.x);
    vec2 dir = vec2(cos(ang), sin(ang));
    // splashy, ragged rim that grows with uMass.w
    float n = fbm(dir * 2.4 + vec2(uTime * 0.35, -uTime * 0.27));
    float spikes = pow(noise(dir * 7.0 + uTime * 0.6), 3.0);
    float r = uMass.z * (1.0 + uMass.w * ((n - 0.5) * 1.6 + spikes * 1.1));
    f += r * r / (dot(d, d) + 1.0);
  }
  return f;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;

  // ---- golden liquid ----
  float e = 1.5;
  float f = field(p);
  float fx = field(p + vec2(e, 0.0));
  float fy = field(p + vec2(0.0, e));
  // sqrt(1 - 1/f) is an exact hemisphere for a single ball, and blends smoothly where balls merge
  float h = sqrt(clamp(1.0 - 1.0 / max(f, 1e-3), 0.0, 1.0));
  float hx = sqrt(clamp(1.0 - 1.0 / max(fx, 1e-3), 0.0, 1.0));
  float hy = sqrt(clamp(1.0 - 1.0 / max(fy, 1e-3), 0.0, 1.0));
  vec3 n = normalize(vec3(-vec2(hx - h, hy - h) / e * 60.0, 1.0));

  vec3 goldDeep = vec3(0.22, 0.11, 0.02);
  vec3 goldDark = vec3(0.48, 0.28, 0.07);
  vec3 goldMid = vec3(0.88, 0.63, 0.26);
  vec3 goldLight = vec3(1.0, 0.92, 0.7);

  // polished liquid metal: fake environment reflection + sharp key highlight + warm rim
  vec3 R = reflect(vec3(0.0, 0.0, -1.0), n);
  float sky = smoothstep(-0.35, 0.85, -R.y);
  vec3 col = mix(goldDeep, goldMid, sky);
  col = mix(col, goldDark, smoothstep(0.2, 0.9, R.y) * 0.6);
  vec3 L = normalize(vec3(-0.4, -0.7, 0.6));
  float spec = pow(max(dot(R, L), 0.0), 48.0);
  float spec2 = pow(max(dot(R, normalize(vec3(0.6, 0.2, 0.75))), 0.0), 18.0);
  col += goldLight * (spec * 1.6 + spec2 * 0.35);
  float fres = pow(1.0 - n.z, 2.2);
  col += vec3(0.95, 0.55, 0.16) * fres * 0.55;

  // molten flow drifting through the surface
  float flow = fbm(p * 0.009 + vec2(uTime * 0.25, -uTime * 0.18));
  float flow2 = fbm(p * 0.02 - vec2(uTime * 0.12, uTime * 0.3));
  col += goldLight * 0.22 * smoothstep(0.55, 0.78, flow) * n.z;
  col += vec3(1.0, 0.7, 0.3) * 0.12 * smoothstep(0.6, 0.8, flow2);
  col += vec3(1.0, 0.8, 0.45) * uGlow * smoothstep(1.2, 6.0, f);

  float body = smoothstep(0.9, 1.1, f);
  float halo = smoothstep(0.22, 1.0, f) * (1.0 - body) * 0.4;
  vec3 liquid = col * body + vec3(1.0, 0.7, 0.3) * halo;
  float liquidA = body + halo * 0.7;

  // ---- energy orb ----
  vec3 orbCol = vec3(0.0);
  if (uOrb.w > 0.001) {
    vec2 d = p - uOrb.xy;
    float r = length(d) / uOrb.z;
    float ang = atan(d.y, d.x);
    float shell = exp(-pow((r - 1.0) * 10.0, 2.0));
    float wob = fbm(vec2(ang * 3.0, r * 4.0 - uTime * 0.5));
    float veins = pow(abs(sin(ang * 9.0 + wob * 7.0 + r * 5.0 - uTime * 0.6)), 22.0);
    veins *= smoothstep(1.02, 0.4, r) * smoothstep(0.08, 0.45, r);
    float edgeVeins = pow(abs(sin(ang * 26.0 + wob * 10.0)), 6.0) * smoothstep(0.7, 0.98, r) * smoothstep(1.06, 0.98, r);
    float haze = smoothstep(1.0, 0.0, r) * 0.16 + pow(clamp(r, 0.0, 1.0), 4.0) * 0.25 * step(r, 1.0);
    orbCol = vec3(1.0, 0.76, 0.38) * (shell * 1.25 + veins * 0.55 + edgeVeins * 0.5 + haze) * uOrb.w;
  }

  // ---- core flash ----
  vec2 dm = p - uMass.xy;
  float coreR = max(uMass.z, 30.0) * 0.9;
  float core = uCore * exp(-dot(dm, dm) / (coreR * coreR));
  vec3 coreCol = vec3(1.0, 0.92, 0.72) * core;

  vec3 rgb = liquid + orbCol + coreCol;
  float a = clamp(liquidA + max(max(orbCol.r, orbCol.g), orbCol.b) * 0.85 + core, 0.0, 1.0);
  gl_FragColor = vec4(rgb * uAlpha, a * uAlpha);
}
`;

function compile(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log || "shader compile failed");
  }
  return shader;
}

// Returns null when WebGL is unavailable so the caller can skip the splash.
export function createGoopRenderer(canvas) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (err) {
    console.warn("[splash] WebGL shader unavailable:", err);
    return null;
  }
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  for (const name of ["uRes", "uScale", "uTime", "uBalls", "uMass", "uOrb", "uGlow", "uCore", "uAlpha"]) {
    u[name] = gl.getUniformLocation(program, name);
  }

  let scale = 1;
  const balls = new Float32Array(18);

  return {
    resize(width, height) {
      // cap rendered pixels (~1.6MP) — the liquid is soft, so this is invisible but keeps 60fps
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      scale = Math.min(dpr, Math.sqrt(1_600_000 / (width * height)));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    render(state) {
      for (let i = 0; i < 6; i++) {
        const b = state.balls[i];
        balls[i * 3] = b ? b.x : 0;
        balls[i * 3 + 1] = b ? b.y : 0;
        balls[i * 3 + 2] = b ? b.r : 0;
      }
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uScale, scale);
      gl.uniform1f(u.uTime, state.time);
      gl.uniform3fv(u.uBalls, balls);
      gl.uniform4f(u.uMass, state.mass.x, state.mass.y, state.mass.r, state.mass.splash);
      gl.uniform4f(u.uOrb, state.orb.x, state.orb.y, state.orb.r, state.orb.alpha);
      gl.uniform1f(u.uGlow, state.glow);
      gl.uniform1f(u.uCore, state.core);
      gl.uniform1f(u.uAlpha, state.alpha);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      // context is left alive: StrictMode re-runs the effect on the same canvas
    },
  };
}
