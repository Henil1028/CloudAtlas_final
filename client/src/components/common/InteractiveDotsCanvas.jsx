import React, { useEffect, useRef } from 'react';

export const InteractiveDotsCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color definitions for cycling (Neon Noir colors)
    const colors = [
      { r: 123, g: 47, b: 255 },  // #7B2FFF (Electric violet)
      { r: 255, g: 0, b: 128 },   // #FF0080 (Hot magenta)
      { r: 0, g: 212, b: 255 },   // #00D4FF (Neon cyan)
      { r: 255, g: 77, b: 0 }     // #FF4D00 (Plasma orange)
    ];

    const getInterpolatedColor = (phase) => {
      const len = colors.length;
      const p = phase % len;
      const index = Math.floor(p);
      const nextIndex = (index + 1) % len;
      const factor = p - index;

      const c1 = colors[index];
      const c2 = colors[nextIndex];

      const r = Math.round(c1.r + (c2.r - c1.r) * factor);
      const g = Math.round(c1.g + (c2.g - c1.g) * factor);
      const b = Math.round(c1.b + (c2.b - c1.b) * factor);

      return `rgba(${r}, ${g}, ${b}, 0.75)`;
    };

    // Initialize 80 dots
    const dotsCount = 80;
    const dots = [];

    for (let i = 0; i < dotsCount; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        // Radius between 1.5px and 3.0px
        radius: Math.random() * 1.5 + 1.5,
        // Velocity between -0.6 and 0.6
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        // Individual color phase for randomized offsets
        colorPhase: Math.random() * 4,
        colorSpeed: 0.003 + Math.random() * 0.004
      });
    }

    let mouse = { x: null, y: null };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw connecting lines between dots within 120px
      for (let i = 0; i < dotsCount; i++) {
        const d1 = dots[i];
        for (let j = i + 1; j < dotsCount; j++) {
          const d2 = dots[j];
          const dx = d1.x - d2.x;
          const dy = d1.y - d2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(d1.x, d1.y);
            ctx.lineTo(d2.x, d2.y);
            // Smoothly fade line based on distance
            const alpha = 0.15 * (1 - dist / 120);
            ctx.strokeStyle = `rgba(123, 47, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 2. Update and draw dots
      dots.forEach((dot) => {
        // Apply normal velocity
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Push away from mouse if within 80px
        if (mouse.x !== null && mouse.y !== null) {
          const dx = dot.x - mouse.x;
          const dy = dot.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 80) {
            // Push strength increases as distance decreases
            const force = (80 - dist) / 80;
            const angle = Math.atan2(dy, dx);
            // Dynamic push displacement
            dot.x += Math.cos(angle) * force * 4;
            dot.y += Math.sin(angle) * force * 4;
          }
        }

        // Bouncing logic at bounds
        if (dot.x < 0) {
          dot.x = 0;
          dot.vx *= -1;
        } else if (dot.x > width) {
          dot.x = width;
          dot.vx *= -1;
        }

        if (dot.y < 0) {
          dot.y = 0;
          dot.vy *= -1;
        } else if (dot.y > height) {
          dot.y = height;
          dot.vy *= -1;
        }

        // Increment color phase
        dot.colorPhase += dot.colorSpeed;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = getInterpolatedColor(dot.colorPhase);
        ctx.shadowBlur = 4;
        ctx.shadowColor = getInterpolatedColor(dot.colorPhase);
        ctx.fill();
        // Reset shadow
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(updateAndDraw);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    updateAndDraw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default InteractiveDotsCanvas;
