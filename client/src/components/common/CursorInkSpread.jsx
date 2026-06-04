import React, { useEffect, useRef } from 'react';

export const CursorInkSpread = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const maxParticles = 120;

    // Cinematic Palette: Light Blues, Deep Cyans, Glowing Purples, Neon Golds, Pink/Magenta
    const colors = [
      { r: 14, g: 165, b: 233 },   // Light Blue / Sky
      { r: 6, g: 182, b: 212 },    // Teal / Cyan
      { r: 139, g: 92, b: 246 },   // Glowing Purple
      { r: 236, g: 72, b: 153 },   // Hot Pink
      { r: 232, g: 127, b: 36 },   // Golden Orange
      { r: 226, g: 168, b: 75 }    // Soft Gold
    ];

    let lastMouse = { x: 0, y: 0, time: Date.now() };
    let mouse = { x: 0, y: 0, isMoved: false };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const now = Date.now();
      const dt = now - lastMouse.time;

      if (dt > 0) {
        const dx = x - lastMouse.x;
        const dy = y - lastMouse.y;
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;

        // Spawn particles if mouse moves
        if (speed > 0.1) {
          // Calculate number of particles to spawn based on speed
          const count = Math.min(Math.floor(speed * 3) + 1, 6);
          for (let i = 0; i < count; i++) {
            // Add slight offset based on speed vector
            const angle = Math.random() * Math.PI * 2;
            const velocityMagnitude = speed * (Math.random() * 2 + 1);
            
            particles.push({
              x: x + (Math.random() - 0.5) * 10,
              y: y + (Math.random() - 0.5) * 10,
              vx: Math.cos(angle) * velocityMagnitude * 0.4 + (dx / dt) * 0.2,
              vy: Math.sin(angle) * velocityMagnitude * 0.4 + (dy / dt) * 0.2,
              size: Math.random() * 15 + 8,
              maxSize: Math.random() * 100 + 70,
              life: 1.0,
              decay: Math.random() * 0.012 + 0.008, // Slow decay for ink diffusion look
              color: colors[Math.floor(Math.random() * colors.length)],
              growth: Math.random() * 1.8 + 1.2 // Growth rate of the ink blob
            });
          }
        }
      }

      lastMouse = { x, y, time: now };
      mouse = { x, y, isMoved: true };
    };

    // Add ambient particles from time to time to make it feel alive
    const addAmbientParticles = () => {
      if (particles.length < maxParticles && Math.random() < 0.15) {
        const x = lastMouse.x || Math.random() * width;
        const y = lastMouse.y || Math.random() * height;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.5 + 0.1;

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 10 + 5,
          maxSize: Math.random() * 60 + 40,
          life: 1.0,
          decay: Math.random() * 0.008 + 0.004,
          color: colors[Math.floor(Math.random() * colors.length)],
          growth: Math.random() * 0.8 + 0.5
        });
      }
    };

    const animate = () => {
      // Create trailing ink spread effect on canvas by clearing with transparency
      ctx.clearRect(0, 0, width, height);

      // Composite mode to blend cinematic colors beautifully
      ctx.globalCompositeOperation = 'screen';

      addAmbientParticles();

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97; // friction
        p.vy *= 0.97;
        
        // Grow the size (ink diffusion)
        if (p.size < p.maxSize) {
          p.size += p.growth;
        }
        
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw radial gradient blob for soft diffuse ink look
        const gradient = ctx.createRadialGradient(
          p.x, p.y, p.size * 0.1,
          p.x, p.y, p.size
        );

        // Core glow
        gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.life * 0.35})`);
        // Mid diffusion color
        gradient.addColorStop(0.3, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.life * 0.15})`);
        // Transparent soft edge
        gradient.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw active cursor light blue backing aura
      if (mouse.isMoved) {
        ctx.globalCompositeOperation = 'screen';
        const auraGradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 180
        );
        auraGradient.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        auraGradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.02)');
        auraGradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-30"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default CursorInkSpread;
