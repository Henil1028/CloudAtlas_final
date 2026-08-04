import React, { useEffect, useRef } from 'react';

export const CinematicBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Drifting cosmic stardust
    const particleCount = 40;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.05,
        vy: -Math.random() * 0.07 - 0.015,
        radius: Math.random() * 1.1 + 0.3,
        pulseSpeed: Math.random() * 0.008 + 0.004,
        pulseVal: Math.random() * Math.PI,
        maxOpacity: Math.random() * 0.35 + 0.15
      });
    }

    const render = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.018;
      mouse.y += (mouse.targetY - mouse.y) * 0.018;

      // Obsidian void base
      ctx.fillStyle = '#03050a';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'screen';
      const time = Date.now() * 0.00012;

      // Blob 1: Vibrant Emerald Green
      const b1x = width * 0.2 + Math.sin(time) * (width * 0.08) - (mouse.x - width / 2) * 0.05;
      const b1y = height * 0.3 + Math.cos(time * 0.8) * (height * 0.08) - (mouse.y - height / 2) * 0.05;
      const grad1 = ctx.createRadialGradient(b1x, b1y, 0, b1x, b1y, width * 0.36);
      grad1.addColorStop(0, 'rgba(34, 197, 94, 0.13)'); 
      grad1.addColorStop(0.5, 'rgba(34, 197, 94, 0.02)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(b1x, b1y, width * 0.36, 0, Math.PI * 2);
      ctx.fill();

      // Blob 2: Deep Sapphire Blue
      const b2x = width * 0.8 + Math.cos(time * 0.6) * (width * 0.1) - (mouse.x - width / 2) * 0.07;
      const b2y = height * 0.25 + Math.sin(time * 0.7) * (height * 0.08) - (mouse.y - height / 2) * 0.07;
      const grad2 = ctx.createRadialGradient(b2x, b2y, 0, b2x, b2y, width * 0.42);
      grad2.addColorStop(0, 'rgba(59, 130, 246, 0.11)'); 
      grad2.addColorStop(0.5, 'rgba(59, 130, 246, 0.015)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(b2x, b2y, width * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Blob 3: Velvet Orchid Purple
      const b3x = width * 0.65 + Math.sin(time * 0.7) * (width * 0.09) - (mouse.x - width / 2) * 0.04;
      const b3y = height * 0.75 + Math.cos(time * 0.5) * (height * 0.07) - (mouse.y - height / 2) * 0.04;
      const grad3 = ctx.createRadialGradient(b3x, b3y, 0, b3x, b3y, width * 0.38);
      grad3.addColorStop(0, 'rgba(139, 92, 246, 0.10)'); 
      grad3.addColorStop(0.5, 'rgba(139, 92, 246, 0.015)');
      grad3.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad3;
      ctx.beginPath();
      ctx.arc(b3x, b3y, width * 0.38, 0, Math.PI * 2);
      ctx.fill();

      // Blob 4: Sunset Amber Rose
      const b4x = width * 0.45 + Math.cos(time * 0.8) * (width * 0.11) - (mouse.x - width / 2) * 0.06;
      const b4y = height * 0.5 + Math.sin(time * 0.6) * (height * 0.09) - (mouse.y - height / 2) * 0.06;
      const grad4 = ctx.createRadialGradient(b4x, b4y, 0, b4x, b4y, width * 0.35);
      grad4.addColorStop(0, 'rgba(236, 72, 153, 0.07)');
      grad4.addColorStop(0.5, 'rgba(245, 158, 11, 0.015)');
      grad4.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad4;
      ctx.beginPath();
      ctx.arc(b4x, b4y, width * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulseVal += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const alpha = Math.max(0.015, Math.sin(p.pulseVal) * p.maxOpacity);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 243, 208, ${alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
        willChange: 'transform',
        transform: 'translate3d(0,0,0)',
      }}
    />
  );
};

export default CinematicBackground;
