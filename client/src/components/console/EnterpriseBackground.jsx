import React, { useEffect, useRef } from 'react';

// Premium Animated Background
// Layers: aurora blobs, animated grid, floating particles, floating 3D orbs,
// hex rings, data pulse lines, gradient mesh, and canvas stars
export const EnterpriseBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ─── Floating particles ───────────────────────────────────────────────
    const particles = [];
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.8 + 0.3,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.45 + 0.08,
        color: ['rgba(124,58,237,', 'rgba(6,182,212,', 'rgba(59,130,246,', 'rgba(34,197,94,'][Math.floor(Math.random() * 4)],
      });
    }

    // ─── Floating "data orbs" ─────────────────────────────────────────────
    const orbs = [
      { x: 0.15, y: 0.25, r: 38, speed: 0.0006, angle: 0,    color1: 'rgba(124,58,237,0.35)', color2: 'rgba(79,70,229,0.0)' },
      { x: 0.78, y: 0.15, r: 28, speed: 0.0009, angle: 1.2,  color1: 'rgba(6,182,212,0.3)',   color2: 'rgba(6,182,212,0.0)' },
      { x: 0.55, y: 0.68, r: 44, speed: 0.0005, angle: 2.5,  color1: 'rgba(139,92,246,0.28)', color2: 'rgba(139,92,246,0.0)' },
      { x: 0.88, y: 0.72, r: 22, speed: 0.001,  angle: 0.7,  color1: 'rgba(34,197,94,0.22)',  color2: 'rgba(34,197,94,0.0)' },
      { x: 0.32, y: 0.82, r: 18, speed: 0.0012, angle: 3.0,  color1: 'rgba(245,158,11,0.2)',  color2: 'rgba(245,158,11,0.0)' },
    ];

    // ─── Connection lines between orbs ───────────────────────────────────
    const drawOrbConnections = (frame) => {
      const positions = orbs.map(o => ({
        x: o.x * canvas.width + Math.sin(frame * o.speed + o.angle) * 60,
        y: o.y * canvas.height + Math.cos(frame * o.speed + o.angle) * 45,
      }));
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 420) {
            const alpha = (1 - dist / 420) * 0.06;
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);
            ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    // ─── Pulsing ring around an orb ───────────────────────────────────────
    let pulseR = 0;
    const drawPulseRing = (x, y, frame) => {
      pulseR = (pulseR + 0.4) % 80;
      const alpha = (1 - pulseR / 80) * 0.15;
      ctx.beginPath();
      ctx.arc(x, y, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    // ─── Hex pattern lines (data-style) ──────────────────────────────────
    const drawHexLines = (frame) => {
      const count = 5;
      for (let i = 0; i < count; i++) {
        const progress = ((frame * 0.003 + i * (1 / count)) % 1);
        const x = (0.1 + progress * 0.8) * canvas.width;
        const alpha = Math.sin(progress * Math.PI) * 0.06;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    };

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Stars ────────────────────────────────────────────────────────
      for (let i = 0; i < 130; i++) {
        const x = ((i * 137.5 + frame * 0.008) % canvas.width);
        const y = ((i * 83.7 + frame * 0.004) % canvas.height);
        const alpha = 0.1 + Math.sin(frame * 0.015 + i) * 0.08;
        ctx.beginPath();
        ctx.arc(x, y, 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${alpha})`;
        ctx.fill();
      }

      // ── Horizontal scan lines (subtle) ──────────────────────────────
      for (let i = 0; i < 3; i++) {
        const y = ((frame * 0.4 + i * (canvas.height / 3)) % canvas.height);
        const g = ctx.createLinearGradient(0, y, canvas.width, y);
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.3, 'rgba(124,58,237,0.03)');
        g.addColorStop(0.7, 'rgba(6,182,212,0.025)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, y, canvas.width, 1.5);
      }

      // ── Floating Orbs ────────────────────────────────────────────────
      orbs.forEach((o, idx) => {
        const cx = o.x * canvas.width + Math.sin(frame * o.speed + o.angle) * 60;
        const cy = o.y * canvas.height + Math.cos(frame * o.speed + o.angle) * 45;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
        grad.addColorStop(0, o.color1);
        grad.addColorStop(1, o.color2);
        ctx.beginPath();
        ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Inner bright core
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r * 0.3);
        core.addColorStop(0, o.color1.replace('0.35', '0.7').replace('0.3', '0.6').replace('0.28', '0.55').replace('0.22', '0.5').replace('0.2', '0.5'));
        core.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, o.r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();

        // Orbit ring
        ctx.beginPath();
        ctx.arc(cx, cy, o.r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = o.color1.replace('0.35', '0.12').replace('0.3', '0.1').replace('0.28', '0.1').replace('0.22', '0.08').replace('0.2', '0.08');
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // ── Orb connections ───────────────────────────────────────────────
      drawOrbConnections(frame);

      // ── Pulse ring on first orb ───────────────────────────────────────
      const o0cx = orbs[0].x * canvas.width + Math.sin(frame * orbs[0].speed) * 60;
      const o0cy = orbs[0].y * canvas.height + Math.cos(frame * orbs[0].speed) * 45;
      drawPulseRing(o0cx, o0cy, frame);

      // ── Hex scan lines ─────────────────────────────────────────────────
      drawHexLines(frame);

      // ── Particles ─────────────────────────────────────────────────────
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', background: '#050816' }}>
      {/* Gradient mesh base */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 20% 10%, rgba(124,58,237,0.14) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 80% 90%, rgba(6,182,212,0.09) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 70%)
        `,
      }} />

      {/* Aurora blobs */}
      <div style={{ position: 'absolute', width: '750px', height: '550px', top: '-120px', left: '-180px', background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)', filter: 'blur(65px)', animation: 'aurora-drift 20s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '650px', height: '650px', top: '18%', right: '-120px', background: 'radial-gradient(ellipse, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'aurora-drift 26s ease-in-out infinite reverse', animationDelay: '-8s' }} />
      <div style={{ position: 'absolute', width: '550px', height: '450px', bottom: '-60px', left: '28%', background: 'radial-gradient(ellipse, rgba(79,70,229,0.12) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'aurora-drift 19s ease-in-out infinite', animationDelay: '-5s' }} />
      <div style={{ position: 'absolute', width: '420px', height: '420px', top: '58%', left: '8%', background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)', filter: 'blur(55px)', animation: 'aurora-drift 23s ease-in-out infinite', animationDelay: '-13s' }} />
      {/* Extra green aurora (premium accent) */}
      <div style={{ position: 'absolute', width: '300px', height: '280px', top: '35%', left: '60%', background: 'radial-gradient(ellipse, rgba(34,197,94,0.06) 0%, transparent 70%)', filter: 'blur(55px)', animation: 'aurora-drift 28s ease-in-out infinite', animationDelay: '-3s' }} />

      {/* Animated Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)`,
        backgroundSize: '42px 42px',
        animation: 'grid-move 8s linear infinite',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }} />

      {/* Glass noise */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, opacity: 0.02, backgroundSize: '200px 200px' }} />

      {/* Canvas: stars + floating orbs + pulse rings + scan lines + particles */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </div>
  );
};

export default EnterpriseBackground;
