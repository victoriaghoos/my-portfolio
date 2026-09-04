import { useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';

const fbm = (noiseFn, x, y, z, octaves = 5, lacunarity = 2.0, gain = 0.5) => {
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

const sampleRamp = (t) => {
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
const STAR_COLORS = [
  { r: 255, g: 255, b: 255, weight: 40 },
  { r: 202, g: 216, b: 255, weight: 25 },
  { r: 170, g: 200, b: 255, weight: 12 },
  { r: 255, g: 244, b: 214, weight: 12 },
  { r: 255, g: 210, b: 161, weight: 7 },
  { r: 255, g: 178, b: 158, weight: 4 },
];
const STAR_COLOR_TOTAL = STAR_COLORS.reduce((sum, c) => sum + c.weight, 0);

const NightSkyBackground = forwardRef(function NightSkyBackground({ isVisible = true }, ref) {
  const backgroundCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const drawFrameRef = useRef(null);
  const isVisibleRef = useRef(isVisible);
  const triggerShockwaveRef = useRef(() => {});
  const canvasBoundsRef = useRef({ left: 0, top: 0 });

  const perlinNoise = useMemo(() => {
    const p = new Uint8Array(512);
    const perm = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69,
      142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219,
      203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
      74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230,
      220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209,
      76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198,
      173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
      207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
      154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79,
      113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
      191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29,
      24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
    ];
    for (let i = 0; i < 256; ++i) p[256 + i] = p[i] = perm[i];
    function fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }
    function lerp(t, a, b) {
      return a + t * (b - a);
    }
    function grad(hash, x, y, z) {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
      return (h & 1 ? -u : u) + (h & 2 ? -v : v);
    }
    return {
      noise: (x, y = 0, z = 0) => {
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

  const pickStarColor = useCallback(() => {
    let r = Math.random() * STAR_COLOR_TOTAL;
    for (const c of STAR_COLORS) {
      if (r < c.weight) return c;
      r -= c.weight;
    }
    return STAR_COLORS[0];
  }, []);

  useImperativeHandle(ref, () => ({
    triggerShockwave: (clientX, clientY) => {
      if (triggerShockwaveRef.current) {
        const x = clientX - canvasBoundsRef.current.left;
        const y = clientY - canvasBoundsRef.current.top;
        triggerShockwaveRef.current(x, y);
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
    const ctx = canvas.getContext('2d', { alpha: false });

    const buildNebulaTexture = () => {
      const tw = Math.max(1, Math.floor(window.innerWidth / 2));
      const th = Math.max(1, Math.floor(window.innerHeight / 2));
      const off = document.createElement('canvas');
      off.width = tw;
      off.height = th;

      const octx = off.getContext('2d');
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

    let nebulaTexture = null;
    let bloomCanvas = null;
    let bloomCtx = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const r = canvas.getBoundingClientRect();
      canvasBoundsRef.current = { left: r.left, top: r.top };
      nebulaTexture = buildNebulaTexture();
      bloomCanvas = document.createElement('canvas');
      bloomCanvas.width = Math.floor(window.innerWidth / 3);
      bloomCanvas.height = Math.floor(window.innerHeight / 3);
      bloomCtx = bloomCanvas.getContext('2d');
    };
    resize();
    window.addEventListener('resize', resize);

    // Depth layers
    // Three layers with different size/brightness/parallax response.
    // Parallax factor is how much each layer shifts relative to mouse movement
    const areaFactor = (window.innerWidth * window.innerHeight) / 1_000_000;

    const makeStar = (sizeMin, sizeMax, brightMin, brightMax) => {
      const magnitude = -Math.log(Math.random()) / 2;
      const brightness = Math.min(brightMax, brightMin + (magnitude / 6) * (brightMax - brightMin));
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

    const distantStars = new Array(Math.min(1600, Math.floor(280 * areaFactor) + 500))
      .fill(0)
      .map(() => makeStar(0.5, 1.0, 0.25, 0.55));
    const midStars = new Array(Math.min(500, Math.floor(90 * areaFactor) + 150))
      .fill(0)
      .map(() => makeStar(1.0, 1.7, 0.5, 0.85));
    const heroStars = new Array(Math.min(45, Math.floor(6 * areaFactor) + 18))
      .fill(0)
      .map(() => makeStar(1.9, 3.0, 0.8, 1.0));

    [distantStars, midStars, heroStars].forEach((layer) =>
      layer.forEach((s) => {
        s.baseX = s.x;
        s.baseY = s.y;
      }),
    );

    const layers = [
      { stars: distantStars, parallax: 0.012 },
      { stars: midStars, parallax: 0.035 },
      { stars: heroStars, parallax: 0.07 },
    ];

    // Galactic band
    // A soft tilted glow band plus its own denser faint-star scatter along it
    const bandAngle = -0.38;
    const bandCenter = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.42 };
    const bandLength = Math.max(window.innerWidth, window.innerHeight) * 1.7;

    const bandStars = new Array(Math.min(700, Math.floor(140 * areaFactor) + 200))
      .fill(0)
      .map(() => {
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
      });
    layers.push({ stars: bandStars, parallax: 0.008 });

    const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMoveParallax = (e) => {
      parallax.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      parallax.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMoveParallax, { passive: true });

    const shooting = [];
    const maxShooting = 4;
    const spawnShootingStar = () => {
      const startX = Math.random() * window.innerWidth * 0.8;
      const startY = Math.random() * window.innerHeight * 0.2;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      const speed = 30 + Math.random() * 25;
      const length = 80 + Math.random() * 150;
      shooting.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: Math.floor(length / speed) + 8,
        maxLife: Math.floor(length / speed) + 8,
        size: 1 + Math.random() * 1.2,
      });
    };

    const shockwaves = [];

    const auroraParams = [
      { amp: 120, speed: 0.02, hue: 250, alpha: 0.25 },
      { amp: 70, speed: 0.04, hue: 300, alpha: 0.18 },
    ];

    const spawnShock = (x, y) => {
      shockwaves.push({
        x,
        y,
        r: 0,
        maxR: Math.max(window.innerWidth, window.innerHeight) * 0.9,
        strength: 1 + Math.random() * 1.2,
        life: 1.0,
      });
    };
    triggerShockwaveRef.current = spawnShock;

    let lastTime = performance.now();

    const drawStarLayer = (layer, t, dt, px, py) => {
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

        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${s.color.r},${s.color.g},${s.color.b})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, s.size * 0.9, 0, Math.PI * 2);
        ctx.fill();

        if (layer === layers[2]) {
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

    const draw = (time) => {
      if (!isVisibleRef.current) {
        animationFrameRef.current = null;
        return;
      }

      if (time - lastTime < 1000 / 30) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const t = time * 0.001;
      const dt = Math.min((time - lastTime) * 0.001, 0.05);
      lastTime = time;

      parallax.x += (parallax.tx - parallax.x) * Math.min(1, dt * 2);
      parallax.y += (parallax.ty - parallax.y) * Math.min(1, dt * 2);

      const W = window.innerWidth;
      const H = window.innerHeight;

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      const colors = ['#020112', '#050c22', '#08173f', '#0f2050', '#1a2870'];
      colors.forEach((c, i) => bg.addColorStop(i / (colors.length - 1), c));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Drift a pre-baked fBm texture for nebula motion at low runtime cost
      const driftX = Math.sin(t * 0.015) * 40;
      const driftY = Math.cos(t * 0.012) * 25;
      if (nebulaTexture) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 1;
        ctx.drawImage(nebulaTexture, -20 + driftX, -20 + driftY, W + 40, H + 40);
        ctx.restore();
      }

      ctx.globalCompositeOperation = 'lighter';

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

        const grd = ctx.createRadialGradient(px, py, 0, px, py, puffRadius);
        grd.addColorStop(0, `rgba(210, 215, 255, ${0.22 * density})`);
        grd.addColorStop(1, 'rgba(210, 215, 255, 0)');
        ctx.fillStyle = grd;
        ctx.fillRect(px - puffRadius, py - puffRadius, puffRadius * 2, puffRadius * 2);
      }

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
      layers.forEach((layer) => {
        drawStarLayer(layer, t, dt, px0 * layer.parallax * 180, py0 * layer.parallax * 150);
      });
      ctx.globalAlpha = 1;

      for (let i = shooting.length - 1; i >= 0; i--) {
        const st = shooting[i];
        st.x += st.vx * dt * 60;
        st.y += st.vy * dt * 60;
        st.life--;
        const lifeRatio = st.life / st.maxLife;
        const trailLength = Math.max(25, st.maxLife * 4 * lifeRatio);
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(
          st.x - st.vx * (trailLength / st.maxLife),
          st.y - st.vy * (trailLength / st.maxLife),
        );
        ctx.lineWidth = st.size;
        ctx.strokeStyle = `rgba(255,255,255,${0.7 * lifeRatio})`;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${lifeRatio})`;
        ctx.fill();
        if (st.life <= 0 || st.x > W + 100 || st.y > H + 100) shooting.splice(i, 1);
      }

      if (Math.random() < 0.025 && shooting.length < maxShooting) spawnShootingStar();

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

      // Cheap bloom
      if (bloomCanvas && bloomCtx) {
        bloomCtx.clearRect(0, 0, bloomCanvas.width, bloomCanvas.height);
        bloomCtx.filter = 'brightness(0.4) contrast(2.2) blur(3px)';
        bloomCtx.drawImage(canvas, 0, 0, bloomCanvas.width, bloomCanvas.height);
        bloomCtx.filter = 'none';

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.28;
        ctx.drawImage(bloomCanvas, 0, 0, W, H);
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    drawFrameRef.current = draw;

    if (isVisibleRef.current) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMoveParallax);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      drawFrameRef.current = null;
    };
  }, [perlinNoise, pickStarColor]);

  return <canvas ref={backgroundCanvasRef} className="night-sky-canvas" />;
});

export default NightSkyBackground;
