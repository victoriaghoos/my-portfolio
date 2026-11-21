import { useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';

type NoiseFn = (x: number, y?: number, z?: number) => number;

const fbm = (
  noiseFn: NoiseFn,
  x: number,
  y: number,
  z: number,
  octaves = 5,
  lacunarity = 2.0,
  gain = 0.5,
) => {
  let amplitude = 0.5;
  let frequency = 1;
  let sum = 0;
  let max = 0;

  for (let i = 0; i < octaves; i++) {
    sum += amplitude * noiseFn(x * frequency, y * frequency, z * frequency);
    max += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return sum / max;
};

const NEBULA_RAMP = [
  { t: 0.0, c: [4, 3, 14] },
  { t: 0.35, c: [10, 10, 35] },
  { t: 0.48, c: [30, 25, 75] },
  { t: 0.62, c: [80, 40, 120] },
  { t: 0.8, c: [160, 70, 145] },
  { t: 1.0, c: [220, 130, 110] },
];

const sampleRamp = (t: number): number[] => {
  const clampedT = Math.min(1, Math.max(0, t));

  for (let i = 0; i < NEBULA_RAMP.length - 1; i++) {
    const a = NEBULA_RAMP[i];
    const b = NEBULA_RAMP[i + 1];

    if (clampedT >= a.t && clampedT <= b.t) {
      const localT = (clampedT - a.t) / (b.t - a.t);
      return [
        a.c[0] + (b.c[0] - a.c[0]) * localT,
        a.c[1] + (b.c[1] - a.c[1]) * localT,
        a.c[2] + (b.c[2] - a.c[2]) * localT,
      ];
    }
  }

  return NEBULA_RAMP[NEBULA_RAMP.length - 1].c;
};

// Weighted so most stars are white/blue-white (like real skies), with occasional warm outliers.
// `fill` is built once here instead of as a new string for every star in every frame
const STAR_COLORS = [
  { r: 255, g: 255, b: 255, weight: 40 },
  { r: 202, g: 216, b: 255, weight: 25 },
  { r: 170, g: 200, b: 255, weight: 12 },
  { r: 255, g: 244, b: 214, weight: 12 },
  { r: 255, g: 210, b: 161, weight: 7 },
  { r: 255, g: 178, b: 158, weight: 4 },
].map((c) => ({ ...c, fill: `rgb(${c.r},${c.g},${c.b})` }));
const STAR_COLOR_TOTAL = STAR_COLORS.reduce((sum, c) => sum + c.weight, 0);

interface StarColor {
  r: number;
  g: number;
  b: number;
  fill: string;
  weight?: number;
}

interface Star {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  brightness: number;
  vx: number;
  vy: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: StarColor;
}

interface StarLayer {
  stars: Star[];
  parallax: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  twinkleOffset: number;
}

interface Shockwave {
  x: number;
  y: number;
  r: number;
  maxR: number;
  strength: number;
  life: number;
}

export interface NightSkyHandle {
  triggerShockwave: (clientX: number, clientY: number) => void;
}

interface NightSkyBackgroundProps {
  isVisible?: boolean;
  /**
   * Cheaper version for phones and tablets: no bloom pass (a blurred full-screen copy every
   * frame), 20 instead of 30 frames per second, a smaller nebula texture and the faint
   * background stars painted once into the cached backdrop instead of every frame. On a slow
   * phone the full version takes longer than 50 ms per frame, which blocks taps and scrolling.
   */
  lite?: boolean;
}

const NightSkyBackground = forwardRef<NightSkyHandle, NightSkyBackgroundProps>(
  function NightSkyBackground({ isVisible = true, lite = false }, ref) {
    const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const drawFrameRef = useRef<((time: number) => void) | null>(null);
    const isVisibleRef = useRef(isVisible);
    const triggerShockwaveRef = useRef<(x: number, y: number) => void>(() => {});

    const perlinNoise = useMemo(() => {
      const p = new Uint8Array(512);
      const perm = [
        151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69,
        142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252,
        219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168,
        68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211,
        133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80,
        73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100,
        109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82,
        85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248,
        152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98,
        108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238,
        210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
        181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205,
        93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
      ];
      for (let i = 0; i < 256; ++i) p[256 + i] = p[i] = perm[i];
      function fade(t: number) {
        return t * t * t * (t * (t * 6 - 15) + 10);
      }
      function lerp(t: number, a: number, b: number) {
        return a + t * (b - a);
      }
      function grad(hash: number, x: number, y: number, z: number) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return (h & 1 ? -u : u) + (h & 2 ? -v : v);
      }
      return {
        noise: (x: number, y = 0, z = 0) => {
          const X = Math.floor(x) & 255,
            Y = Math.floor(y) & 255,
            Z = Math.floor(z) & 255;
          x -= Math.floor(x);
          y -= Math.floor(y);
          z -= Math.floor(z);
          const u = fade(x),
            v = fade(y),
            w = fade(z);
          const A = p[X] + Y,
            AA = p[A] + Z,
            AB = p[A + 1] + Z,
            B = p[X + 1] + Y,
            BA = p[B] + Z,
            BB = p[B + 1] + Z;
          return lerp(
            w,
            lerp(
              v,
              lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
              lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z)),
            ),
            lerp(
              v,
              lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
              lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1)),
            ),
          );
        },
      };
    }, []);

    const pickStarColor = useCallback((): StarColor => {
      let r = Math.random() * STAR_COLOR_TOTAL;
      for (const c of STAR_COLORS) {
        if (r < c.weight) return c;
        r -= c.weight;
      }
      return STAR_COLORS[0];
    }, []);

    useImperativeHandle(ref, () => ({
      triggerShockwave: (clientX: number, clientY: number) => {
        const canvas = backgroundCanvasRef.current;
        if (triggerShockwaveRef.current && canvas) {
          // measured on click rather than on every resize: reading it right after resizing the
          // canvas forced the browser to lay out the page early
          const bounds = canvas.getBoundingClientRect();
          triggerShockwaveRef.current(clientX - bounds.left, clientY - bounds.top);
        }
      },
    }));

    useEffect(() => {
      isVisibleRef.current = isVisible;

      if (!isVisible && animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (isVisible && !animationFrameRef.current && drawFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(drawFrameRef.current);
      }
    }, [isVisible]);

    useEffect(() => {
      const canvas = backgroundCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const buildNebulaTexture = () => {
        const textureScale = lite ? 4 : 2;
        const tw = Math.max(1, Math.floor(window.innerWidth / textureScale));
        const th = Math.max(1, Math.floor(window.innerHeight / textureScale));
        const off = document.createElement('canvas');
        off.width = tw;
        off.height = th;

        const octx = off.getContext('2d');
        if (!octx) return off;
        const img = octx.createImageData(tw, th);
        const scale = 0.0022;
        const CONTRAST = 2.2;
        const FORCE_OPAQUE_DEBUG = false;

        for (let y = 0; y < th; y++) {
          for (let x = 0; x < tw; x++) {
            const n = fbm(perlinNoise.noise, x * scale, y * scale, 0, 4);
            let v = (n + 1) * 0.5;
            v = 0.5 + (v - 0.5) * CONTRAST;
            v = Math.min(1, Math.max(0, v));
            const [r, g, b] = sampleRamp(v);

            let alpha = 0;
            if (v > 0.32) {
              alpha = Math.pow((v - 0.32) / 0.68, 1.2);
            }
            alpha *= 0.6; // global dimmer

            const idx = (y * tw + x) * 4;
            img.data[idx] = r;
            img.data[idx + 1] = g;
            img.data[idx + 2] = b;
            img.data[idx + 3] = FORCE_OPAQUE_DEBUG ? 255 : Math.round(alpha * 255);
          }
        }

        octx.putImageData(img, 0, 0);
        return off;
      };

      let nebulaTexture: HTMLCanvasElement | null = null;
      let bloomCanvas: HTMLCanvasElement | null = null;
      let bloomCtx: CanvasRenderingContext2D | null = null;
      // The blurred copy is the most expensive step of a frame, so it is only redone every
      // BLOOM_EVERY frames and reused in between; the sky changes too slowly to notice.
      const BLOOM_EVERY = 3;
      let bloomFrame = 0;
      // Kept up to date by resize(): reading window.innerWidth in every frame forces a layout
      // whenever something else on the page changed (framer-motion, sections mounting)
      let viewW = window.innerWidth;
      let viewH = window.innerHeight;

      const resize = () => {
        viewW = window.innerWidth;
        viewH = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        // innerWidth/innerHeight can briefly be 0 (minimised window, hidden iframe, mobile
        // rotation); a 0-sized canvas makes drawImage throw, so never go below 1px
        canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
        canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        nebulaTexture = buildNebulaTexture();
        bloomFrame = 0;
        bloomCanvas = document.createElement('canvas');
        bloomCanvas.width = Math.max(1, Math.floor(window.innerWidth / 3));
        bloomCanvas.height = Math.max(1, Math.floor(window.innerHeight / 3));
        bloomCtx = bloomCanvas.getContext('2d');
      };
      // With reduced motion the sky is drawn once and then stands still (WCAG 2.3.3 / 2.2.2)
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const requestStillFrame = () => {
        if (isVisibleRef.current && !animationFrameRef.current && drawFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(drawFrameRef.current);
        }
      };
      const handleResize = () => {
        resize();
        // resizing clears the canvas, so a sky that stands still needs one new frame
        requestStillFrame();
      };
      const handleMotionChange = () => requestStillFrame();

      resize();
      window.addEventListener('resize', handleResize);
      reducedMotionQuery.addEventListener('change', handleMotionChange);

      // Depth layers
      // Three layers with different size/brightness/parallax response.
      // Parallax factor is how much each layer shifts relative to mouse movement
      const areaFactor = (window.innerWidth * window.innerHeight) / 1_000_000;

      const makeStar = (
        sizeMin: number,
        sizeMax: number,
        brightMin: number,
        brightMax: number,
      ): Star => {
        const magnitude = -Math.log(Math.random()) / 2;
        const brightness = Math.min(
          brightMax,
          brightMin + (magnitude / 6) * (brightMax - brightMin),
        );
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          baseX: 0,
          baseY: 0,
          size: sizeMin + Math.random() * (sizeMax - sizeMin),
          brightness,
          vx: 0,
          vy: 0,
          twinkleSpeed: 0.3 + Math.random() * 1.5,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: pickStarColor(),
        };
      };

      const distantStars = Array.from(
        { length: Math.min(1600, Math.floor(280 * areaFactor) + 500) },
        () => makeStar(0.5, 1.0, 0.25, 0.55),
      );
      const midStars = Array.from(
        { length: Math.min(500, Math.floor(90 * areaFactor) + 150) },
        () => makeStar(1.0, 1.7, 0.5, 0.85),
      );
      const heroStars = Array.from({ length: Math.min(45, Math.floor(6 * areaFactor) + 18) }, () =>
        makeStar(1.9, 3.0, 0.8, 1.0),
      );

      [distantStars, midStars, heroStars].forEach((layer) =>
        layer.forEach((s) => {
          s.baseX = s.x;
          s.baseY = s.y;
        }),
      );

      const distantLayer: StarLayer = { stars: distantStars, parallax: 0.012 };
      const midLayer: StarLayer = { stars: midStars, parallax: 0.035 };
      const heroLayer: StarLayer = { stars: heroStars, parallax: 0.07 };

      // Galactic band
      // A soft tilted glow band plus its own denser faint-star scatter along it
      const bandAngle = -0.38;
      const bandCenter = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.42 };
      const bandLength = Math.max(window.innerWidth, window.innerHeight) * 1.7;

      const bandStars = Array.from(
        { length: Math.min(700, Math.floor(140 * areaFactor) + 200) },
        () => {
          const along = (Math.random() - 0.5) * bandLength;
          const across = (Math.random() - 0.5) * 140 * (0.3 + Math.random() * 0.7);
          const cos = Math.cos(bandAngle),
            sin = Math.sin(bandAngle);
          const x = bandCenter.x + along * cos - across * sin;
          const y = bandCenter.y + along * sin + across * cos;
          return {
            x,
            y,
            baseX: x,
            baseY: y,
            size: 0.4 + Math.random() * 0.8,
            brightness: 0.2 + Math.random() * 0.4,
            vx: 0,
            vy: 0,
            twinkleSpeed: 0.3 + Math.random() * 1.2,
            twinkleOffset: Math.random() * Math.PI * 2,
            color: pickStarColor(),
          };
        },
      );
      const bandLayer: StarLayer = { stars: bandStars, parallax: 0.008 };

      // The lite version (phones, tablets) has no parallax and no shockwaves, so its faint
      // distant and band stars never move: they are painted once into the cached backdrop and
      // only the brighter stars are redrawn (and twinkle) every frame. ~80% fewer arcs per frame.
      const liveLayers: StarLayer[] = lite
        ? [midLayer, heroLayer]
        : [distantLayer, midLayer, heroLayer, bandLayer];
      const bakedLayers: StarLayer[] = lite ? [distantLayer, bandLayer] : [];

      const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMouseMoveParallax = (e: MouseEvent) => {
        parallax.tx = (e.clientX / viewW - 0.5) * 2;
        parallax.ty = (e.clientY / viewH - 0.5) * 2;
      };
      // touch screens send a mousemove on every tap, which would nudge the sky
      if (!lite) window.addEventListener('mousemove', onMouseMoveParallax, { passive: true });

      const shooting: ShootingStar[] = [];
      // Rare enough to feel special: one every 3 to 8 seconds (in time, so the same at 20 and
      // 30 fps), the first soon after the page opens, at most two at once
      const maxShooting = 2;
      const SHOOTING_MIN_GAP = 3;
      const SHOOTING_EXTRA_GAP = 5;
      let nextShootingAt = -1;
      // sparks that fall off a shooting star's head and linger for a moment
      const sparkles: Sparkle[] = [];
      const maxSparkles = 140;
      const SPARKLES_PER_SECOND = 70;
      // Like a real meteor shower, every shooting star flies away from one point (the radiant),
      // so they fan out instead of all running parallel. The radiant sits just beyond the top
      // left or top right corner, picked once per visit, as a fraction of the viewport: above
      // the middle they fell almost straight down, like rain.
      const radiantOnLeft = Math.random() < 0.5;
      const radiant = {
        x: radiantOnLeft ? -0.15 + Math.random() * 0.1 : 1.05 + Math.random() * 0.1,
        y: -0.8,
      };

      const spawnShootingStar = () => {
        const startX = Math.random() * viewW;
        const startY = Math.random() * viewH * 0.35;
        const angle =
          Math.atan2(startY - radiant.y * viewH, startX - radiant.x * viewW) +
          (Math.random() - 0.5) * 0.1;
        // speed in px per second and life in seconds, so they look the same at 20 and 30 fps
        const speed = 900 + Math.random() * 600;
        const duration = 0.6 + Math.random() * 0.5;
        shooting.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: duration,
          maxLife: duration,
          size: 1 + Math.random() * 1.2,
        });
      };

      const shockwaves: Shockwave[] = [];

      const auroraParams = [
        { amp: 120, speed: 0.02, hue: 250, alpha: 0.25 },
        { amp: 70, speed: 0.04, hue: 300, alpha: 0.18 },
      ];

      const spawnShock = (x: number, y: number) => {
        shockwaves.push({
          x,
          y,
          r: 0,
          maxR: Math.max(viewW, viewH) * 0.9,
          strength: 1 + Math.random() * 1.2,
          life: 1.0,
        });
      };
      triggerShockwaveRef.current = spawnShock;

      let lastTime = performance.now();

      const drawStarLayer = (layer: StarLayer, t: number, _dt: number, px: number, py: number) => {
        layer.stars.forEach((s) => {
          s.vx *= 0.92;
          s.vy *= 0.92;

          shockwaves.forEach((sw) => {
            const dx = s.x - sw.x;
            const dy = s.y - sw.y;
            const d2 = Math.sqrt(dx * dx + dy * dy);
            const diff = Math.abs(d2 - sw.r);
            if (diff < 100) {
              const push = (1 - diff / 100) * (sw.strength * 0.8);
              s.vx += (dx / (d2 + 0.001)) * push * 2.0;
              s.vy += (dy / (d2 + 0.001)) * push * 2.0;
            }
          });

          const relax = 0.01;
          s.vx += (s.baseX - s.x) * relax;
          s.vy += (s.baseY - s.y) * relax;
          s.x += s.vx;
          s.y += s.vy;

          const tw = 0.8 + 0.2 * Math.sin(t * 2 * s.twinkleSpeed + s.twinkleOffset);
          const alpha = s.brightness * tw * 0.96;

          const drawX = s.x + px;
          const drawY = s.y + py;

          const radius = s.size * 0.9;
          ctx.fillStyle = s.color.fill;
          if (radius < 1) {
            // Most stars are under 2px across, where a square looks the same as a circle and is
            // far cheaper to draw than an arc path. π/4 keeps the same amount of light.
            ctx.globalAlpha = alpha * (Math.PI / 4);
            ctx.fillRect(drawX - radius, drawY - radius, radius * 2, radius * 2);
          } else {
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
            ctx.fill();
          }

          if (layer === heroLayer) {
            const ray = s.size * 5;
            ctx.strokeStyle = `rgba(${s.color.r},${s.color.g},${s.color.b},${alpha * 0.4})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(drawX - ray, drawY);
            ctx.lineTo(drawX + ray, drawY);
            ctx.moveTo(drawX, drawY - ray);
            ctx.lineTo(drawX, drawY + ray);
            ctx.stroke();
          }
        });
      };

      // Background gradient, nebula and the glow of the galactic band. Only the nebula moves (a
      // slow drift), so the lite version paints this once and reuses it every frame.
      const drawBackdrop = (
        c: CanvasRenderingContext2D,
        W: number,
        H: number,
        driftX: number,
        driftY: number,
      ) => {
        c.globalCompositeOperation = 'source-over';
        const bg = c.createLinearGradient(0, 0, 0, H);
        const colors = ['#020112', '#050c22', '#08173f', '#0f2050', '#1a2870'];
        colors.forEach((color, i) => bg.addColorStop(i / (colors.length - 1), color));
        c.fillStyle = bg;
        c.fillRect(0, 0, W, H);

        if (nebulaTexture) {
          c.save();
          c.globalCompositeOperation = 'lighter';
          c.globalAlpha = 1;
          c.drawImage(nebulaTexture, -20 + driftX, -20 + driftY, W + 40, H + 40);
          c.restore();
        }

        c.globalCompositeOperation = 'lighter';

        // Galactic band glow, drawn before stars so the band starfield sits on top of it
        const bandNoiseScale = 0.006;
        const bandPuffCount = 55;
        const cos = Math.cos(bandAngle);
        const sin = Math.sin(bandAngle);

        for (let i = 0; i < bandPuffCount; i++) {
          const alongPos = -bandLength / 2 + (i / bandPuffCount) * bandLength;
          const n = perlinNoise.noise(alongPos * bandNoiseScale, 0.5, 2.1);
          const density = Math.max(0, (n + 1) * 0.5 - 0.3) * 1.5;
          if (density <= 0) continue;

          const px = bandCenter.x + alongPos * cos;
          const py = bandCenter.y + alongPos * sin;
          const puffRadius = 130;

          const grd = c.createRadialGradient(px, py, 0, px, py, puffRadius);
          grd.addColorStop(0, `rgba(210, 215, 255, ${0.22 * density})`);
          grd.addColorStop(1, 'rgba(210, 215, 255, 0)');
          c.fillStyle = grd;
          c.fillRect(px - puffRadius, py - puffRadius, puffRadius * 2, puffRadius * 2);
        }
      };

      // Painted at the average twinkle brightness, so they look the same as when animated
      const drawBakedStars = (c: CanvasRenderingContext2D) => {
        c.globalCompositeOperation = 'lighter';
        bakedLayers.forEach((layer) =>
          layer.stars.forEach((s) => {
            c.globalAlpha = s.brightness * 0.8 * 0.96;
            c.fillStyle = s.color.fill;
            c.beginPath();
            c.arc(s.baseX, s.baseY, s.size * 0.9, 0, Math.PI * 2);
            c.fill();
          }),
        );
        c.globalAlpha = 1;
      };

      let backdrop: HTMLCanvasElement | null = null;
      const buildBackdrop = (W: number, H: number) => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const off = document.createElement('canvas');
        off.width = Math.max(1, Math.floor(W * dpr));
        off.height = Math.max(1, Math.floor(H * dpr));
        const octx = off.getContext('2d');
        if (octx) {
          octx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawBackdrop(octx, W, H, 0, 25);
          drawBakedStars(octx);
        }
        return off;
      };

      const draw = (time: number) => {
        if (!isVisibleRef.current) {
          animationFrameRef.current = null;
          return;
        }

        if (time - lastTime < 1000 / (lite ? 20 : 30)) {
          animationFrameRef.current = requestAnimationFrame(draw);
          return;
        }

        const t = time * 0.001;
        const dt = Math.min((time - lastTime) * 0.001, 0.05);
        lastTime = time;

        parallax.x += (parallax.tx - parallax.x) * Math.min(1, dt * 2);
        parallax.y += (parallax.ty - parallax.y) * Math.min(1, dt * 2);

        const W = viewW;
        const H = viewH;

        // Nothing to draw while the viewport has no size; try again next frame
        if (W === 0 || H === 0) {
          animationFrameRef.current = requestAnimationFrame(draw);
          return;
        }

        if (lite) {
          if (!backdrop || backdrop.dataset.size !== `${W}x${H}`) {
            backdrop = buildBackdrop(W, H);
            backdrop.dataset.size = `${W}x${H}`;
          }
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(backdrop, 0, 0, W, H);
        } else {
          // Drift a pre-baked fBm texture for nebula motion at low runtime cost
          drawBackdrop(ctx, W, H, Math.sin(t * 0.015) * 40, Math.cos(t * 0.012) * 25);
        }
        ctx.globalCompositeOperation = 'lighter';

        auroraParams.forEach((ap, idx) => {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = ap.alpha;
          ctx.beginPath();
          const baseY = H * (0.12 + idx * 0.05) + Math.sin(t * 0.5 + idx) * 12;
          ctx.moveTo(0, baseY);
          const segments = 6;
          for (let i = 0; i <= segments; i++) {
            const sx = (i / segments) * W;
            const sy =
              baseY +
              Math.sin((i / segments) * Math.PI * 2 + t * ap.speed * 4) *
                (ap.amp + Math.sin(t * 0.7) * 12);
            ctx.lineTo(sx, sy);
          }
          ctx.lineTo(W, H);
          ctx.lineTo(0, H);
          ctx.closePath();
          const g = ctx.createLinearGradient(0, baseY - 120, 0, baseY + 120);
          g.addColorStop(0, `hsla(${ap.hue},80%,65%,0.9)`);
          g.addColorStop(0.5, `hsla(${(ap.hue + 60) % 360},70%,55%,0.6)`);
          g.addColorStop(1, `rgba(0,0,0,0)`);
          ctx.fillStyle = g;
          ctx.fill();
          ctx.restore();
        });

        for (let i = shockwaves.length - 1; i >= 0; i--) {
          const sw = shockwaves[i];
          sw.r += dt * (sw.maxR * 0.8);
          sw.life -= dt * 0.6;
          if (sw.life <= 0) {
            shockwaves.splice(i, 1);
            continue;
          }
          const innerRadius = Math.max(0.1, sw.r * 0.1);
          const outerRadius = Math.max(innerRadius + 0.1, sw.r);
          const grd = ctx.createRadialGradient(sw.x, sw.y, innerRadius, sw.x, sw.y, outerRadius);
          const hue = (200 + sw.strength * 80) % 360;
          grd.addColorStop(0, `hsla(${hue},80%,60%,${0.12 * sw.life})`);
          grd.addColorStop(1, `rgba(0,0,0,0)`);
          ctx.globalCompositeOperation = 'overlay';
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, W, H);
          ctx.globalCompositeOperation = 'lighter';
        }

        const px0 = parallax.x,
          py0 = parallax.y;
        liveLayers.forEach((layer) => {
          drawStarLayer(layer, t, dt, px0 * layer.parallax * 180, py0 * layer.parallax * 150);
        });
        ctx.globalAlpha = 1;

        // violet in the hue of the aurora (250): lavender with more red turned pink over the nebula
        const trailRgb = '150,140,255';
        const glowRgb = '118,94,237';

        // Sparks drift slowly, twinkle and fade out; drawn before the shooting stars so the
        // trails stay on top
        ctx.fillStyle = `rgb(${trailRgb})`;
        for (let i = sparkles.length - 1; i >= 0; i--) {
          const sp = sparkles[i];
          sp.life -= dt;
          if (sp.life <= 0) {
            sparkles.splice(i, 1);
            continue;
          }
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          const fade = sp.life / sp.maxLife;
          const twinkle = 0.6 + 0.4 * Math.sin(t * 18 + sp.twinkleOffset);
          ctx.globalAlpha = 0.85 * fade * twinkle;
          ctx.fillRect(sp.x - sp.size, sp.y - sp.size, sp.size * 2, sp.size * 2);
        }
        ctx.globalAlpha = 1;

        // A shooting star in three layers: a soft coloured glow along the whole path, a tapered
        // trail that thins out towards the tail, and a bright head with a small halo
        for (let i = shooting.length - 1; i >= 0; i--) {
          const st = shooting[i];
          st.x += st.vx * dt;
          st.y += st.vy * dt;
          st.life -= dt;
          if (st.life <= 0 || st.x < -400 || st.x > W + 400 || st.y > H + 400) {
            shooting.splice(i, 1);
            continue;
          }

          const progress = 1 - st.life / st.maxLife;
          // flares up quickly, then burns out
          const intensity = Math.min(1, progress * 6) * Math.min(1, (1 - progress) * 2.5);
          const speed = Math.hypot(st.vx, st.vy);
          const dirX = st.vx / speed;
          const dirY = st.vy / speed;
          const tail = (160 + st.size * 70) * Math.min(1, progress * 4);
          const tailX = st.x - dirX * tail;
          const tailY = st.y - dirY * tail;

          // shed sparks just behind the head, more while it burns brightest
          const sparkCount = Math.floor(SPARKLES_PER_SECOND * intensity * dt + Math.random());
          for (let n = 0; n < sparkCount && sparkles.length < maxSparkles; n++) {
            const back = Math.random() * 30;
            const side = (Math.random() - 0.5) * st.size * 8;
            const maxLife = 0.5 + Math.random() * 0.7;
            sparkles.push({
              x: st.x - dirX * back - dirY * side,
              y: st.y - dirY * back + dirX * side,
              // a little of the star's own motion, plus a slow random drift
              vx: st.vx * 0.04 + (Math.random() - 0.5) * 30,
              vy: st.vy * 0.04 + (Math.random() - 0.5) * 30,
              life: maxLife,
              maxLife,
              size: 0.5 + Math.random() * 0.7,
              twinkleOffset: Math.random() * Math.PI * 2,
            });
          }

          // a wedge from the head (halfWidth wide) to a point at the tail, fading along its length
          const wedge = (halfWidth: number, head: string, middle?: string) => {
            const gradient = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
            gradient.addColorStop(0, head);
            if (middle) gradient.addColorStop(0.35, middle);
            gradient.addColorStop(1, `rgba(${glowRgb},0)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(st.x - dirY * halfWidth, st.y + dirX * halfWidth);
            ctx.lineTo(tailX, tailY);
            ctx.lineTo(st.x + dirY * halfWidth, st.y - dirX * halfWidth);
            ctx.closePath();
            ctx.fill();
          };

          // three ever wider, fainter wedges blend into a soft glow without hard edges
          wedge(st.size * 5, `rgba(${glowRgb},${0.07 * intensity})`);
          wedge(st.size * 3, `rgba(${glowRgb},${0.1 * intensity})`);
          wedge(st.size * 1.8, `rgba(${glowRgb},${0.14 * intensity})`);
          wedge(
            st.size * 0.9,
            `rgba(255,255,255,${0.95 * intensity})`,
            `rgba(${trailRgb},${0.5 * intensity})`,
          );

          const headRadius = st.size * 5;
          const head = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, headRadius);
          head.addColorStop(0, `rgba(255,255,255,${intensity})`);
          head.addColorStop(0.2, `rgba(${glowRgb},${0.45 * intensity})`);
          head.addColorStop(1, `rgba(${glowRgb},0)`);
          ctx.fillStyle = head;
          ctx.beginPath();
          ctx.arc(st.x, st.y, headRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        if (nextShootingAt < 0) nextShootingAt = t + 1.5 + Math.random() * 2.5;
        if (t >= nextShootingAt) {
          if (shooting.length < maxShooting) spawnShootingStar();
          nextShootingAt = t + SHOOTING_MIN_GAP + Math.random() * SHOOTING_EXTRA_GAP;
        }

        // Subtle vignette
        ctx.globalCompositeOperation = 'source-over';
        const vignette = ctx.createRadialGradient(
          W / 2,
          H / 2,
          Math.min(W, H) * 0.3,
          W / 2,
          H / 2,
          Math.max(W, H) * 0.75,
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);

        // Cheap bloom (skipped in the lite version)
        if (!lite && bloomCanvas && bloomCtx) {
          if (bloomFrame % BLOOM_EVERY === 0) {
            bloomCtx.clearRect(0, 0, bloomCanvas.width, bloomCanvas.height);
            bloomCtx.filter = 'brightness(0.4) contrast(2.2) blur(3px)';
            bloomCtx.drawImage(canvas, 0, 0, bloomCanvas.width, bloomCanvas.height);
            bloomCtx.filter = 'none';
          }
          bloomFrame++;

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 0.28;
          ctx.drawImage(bloomCanvas, 0, 0, W, H);
          ctx.restore();
        }

        if (reducedMotionQuery.matches) {
          animationFrameRef.current = null;
          return;
        }

        animationFrameRef.current = requestAnimationFrame(draw);
      };

      drawFrameRef.current = draw;

      if (isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }

      return () => {
        window.removeEventListener('resize', handleResize);
        reducedMotionQuery.removeEventListener('change', handleMotionChange);
        if (!lite) window.removeEventListener('mousemove', onMouseMoveParallax);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        drawFrameRef.current = null;
      };
    }, [perlinNoise, pickStarColor, lite]);

    return <canvas ref={backgroundCanvasRef} className="night-sky-canvas" />;
  },
);

export default NightSkyBackground;
