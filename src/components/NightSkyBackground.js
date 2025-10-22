import { useRef, useEffect, useMemo } from "react";

const NightSkyBackground = ({ mouse, clicks }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // Perlin noise (compact implementation)
  const Perlin = useMemo(() => {
    const p = new Uint8Array(512);
    const perm = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
      140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247,
      120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177,
      33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165,
      71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211,
      133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25,
      63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
      135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217,
      226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
      59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248,
      152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22,
      39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218,
      246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
      81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
      222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
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
          AB = p[A + 1] + Z;
        const B = p[X + 1] + Y,
          BA = p[B] + Z,
          BB = p[B + 1] + Z;
        return lerp(
          w,
          lerp(
            v,
            lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
            lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))
          ),
          lerp(
            v,
            lerp(
              u,
              grad(p[AA + 1], x, y, z - 1),
              grad(p[BA + 1], x - 1, y, z - 1)
            ),
            lerp(
              u,
              grad(p[AB + 1], x, y - 1, z - 1),
              grad(p[BB + 1], x - 1, y - 1, z - 1)
            )
          )
        );
      },
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Stars
    const STAR_COUNT =
      Math.floor((window.innerWidth * window.innerHeight) / 2000) + 500;
    const stars = new Array(STAR_COUNT).fill(0).map(() => {
      const magnitude = -Math.log(Math.random()) / 2;
      const brightness = Math.min(1, magnitude / 6);
      const size =
        brightness > 0.9
          ? 2.4
          : brightness > 0.7
          ? 1.8
          : brightness > 0.5
          ? 1.4
          : 1.0;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        baseX: 0,
        baseY: 0,
        size,
        brightness,
        vx: 0,
        vy: 0,
        twinkleSpeed: 0.3 + Math.random() * 1.5,
        twinkleOffset: Math.random() * Math.PI * 2,
      };
    });
    // base positions
    stars.forEach((s) => {
      s.baseX = s.x;
      s.baseY = s.y;
    });

    // Shooting stars
    const shooting = [];
    const maxShooting = 3;
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

    // Shockwaves from clicks
    const shockwaves = [];

    // Nebula animation params
    let nebulaOffset = 0;

    // Aurora ribbons params
    const auroraParams = [
      { amp: 120, speed: 0.02, hue: 250, alpha: 0.25 },
      { amp: 70, speed: 0.04, hue: 300, alpha: 0.18 },
    ];

    // spawn shockwave
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

    // Animation loop
    let lastTime = performance.now();
    const draw = (time) => {
      const t = time * 0.001;
      const dt = Math.min((time - lastTime) * 0.001, 0.05);
      lastTime = time;

      nebulaOffset += dt * 0.05;

      const W = window.innerWidth;
      const H = window.innerHeight;

      // Background gradient base
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      const colors = ["#030217", "#07102b", "#0a1b4b", "#122555", "#1f2e83"];
      colors.forEach((c, i) => bg.addColorStop(i / (colors.length - 1), c));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";

      // layered nebula: sample noise at coarse grid to avoid per-pixel heavy ops
      const layers = [
        { scale: 0.0012, speed: 0.02, color: [120, 60, 220], intensity: 0.35 },
        { scale: 0.0022, speed: 0.04, color: [220, 100, 180], intensity: 0.18 },
        { scale: 0.0009, speed: 0.01, color: [60, 90, 220], intensity: 0.12 },
      ];

      // draw many soft circles where noise > threshold
      const step = 40;
      for (const layer of layers) {
        const { scale, speed, color, intensity } = layer;
        const z = nebulaOffset * speed;
        for (let y = 0; y < H; y += step) {
          for (let x = 0; x < W; x += step) {
            const n = Perlin.noise(x * scale, y * scale, z);
            const v = (n + 1) * 0.5;
            if (v > 0.48) {
              const alpha = Math.pow((v - 0.48) / 0.52, 1.8) * intensity;
              ctx.beginPath();
              const radius = Math.max(1, step * (0.8 + v * 1.8));
              // Ensure inner radius is at least 0.1 to avoid the error
              const innerRadius = Math.max(0.1, radius * 0.1);
              const grd = ctx.createRadialGradient(
                x,
                y,
                innerRadius,
                x,
                y,
                radius
              );
              const rgbaInner = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
              grd.addColorStop(0, rgbaInner);
              grd.addColorStop(
                1,
                `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`
              );
              ctx.fillStyle = grd;
              ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
            }
          }
        }
      }
      // Aurora ribbons
      auroraParams.forEach((ap, idx) => {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
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

      // shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.r += dt * (sw.maxR * 0.8);
        sw.life -= dt * 0.6;
        if (sw.life <= 0) shockwaves.splice(i, 1);
        const innerRadius = Math.max(0.1, sw.r * 0.1);
        const outerRadius = Math.max(innerRadius + 0.1, sw.r); // ensure outer > inner
        const grd = ctx.createRadialGradient(
          sw.x,
          sw.y,
          innerRadius,
          sw.x,
          sw.y,
          outerRadius
        );

        const hue = (200 + sw.strength * 80) % 360;
        grd.addColorStop(0, `hsla(${hue},80%,60%,${0.12 * sw.life})`);
        grd.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "lighter";
      }

      // Stars - only shockwaves + drift, no mouse influence
      stars.forEach((s) => {
        s.vx *= 0.92;
        s.vy *= 0.92;

        // shockwaves push
        shockwaves.forEach((sw) => {
          const dx = s.x - sw.x;
          const dy = s.y - sw.y;
          const d2 = Math.sqrt(dx * dx + dy * dy);
          const rr = sw.r;
          const diff = Math.abs(d2 - rr);
          if (diff < 100) {
            const push = (1 - diff / 100) * (sw.strength * 0.8);
            s.vx += (dx / (d2 + 0.001)) * push * 2.0;
            s.vy += (dy / (d2 + 0.001)) * push * 2.0;
          }
        });

        const relax = 0.1;
        s.vx += (s.baseX - s.x) * relax * 0.1;
        s.vy += (s.baseY - s.y) * relax * 0.1;

        s.x += s.vx;
        s.y += s.vy;

        const tw =
          0.8 + 0.2 * Math.sin(t * 2 * s.twinkleSpeed + s.twinkleOffset);
        const alpha = s.brightness * tw * 0.96;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${alpha * 0.15})`;
        ctx.fill();
      });

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
          st.y - st.vy * (trailLength / st.maxLife)
        );
        ctx.lineWidth = st.size;
        ctx.strokeStyle = `rgba(255,255,255,${0.7 * lifeRatio})`;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${lifeRatio})`;
        ctx.fill();
        if (st.life <= 0 || st.x > W + 100 || st.y > H + 100)
          shooting.splice(i, 1);
      }

      if (Math.random() < 0.02 && shooting.length < maxShooting)
        spawnShootingStar();

      ctx.globalCompositeOperation = "source-over";

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const onCanvasClick = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const cx = ev.clientX - rect.left;
      const cy = ev.clientY - rect.top;
      spawnShock(cx, cy);
    };
    canvas.addEventListener("click", onCanvasClick);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", onCanvasClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [Perlin]);

  useEffect(() => {
    if (!clicks || !clicks.count) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cx = clicks.pos ? clicks.pos.x : window.innerWidth * 0.5;
    const cy = clicks.pos ? clicks.pos.y : window.innerHeight * 0.5;

    const ev = new MouseEvent("click", {
      bubbles: true,
      clientX: cx + rect.left,
      clientY: cy + rect.top,
    });
    canvas.dispatchEvent(ev);
  }, [clicks]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "auto",
      }}
    />
  );
};

export default NightSkyBackground;