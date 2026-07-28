import React, { useRef } from 'react';

export const TiltCard = ({ children, className = "", style = {} }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;

    // Smooth spring-like transition for responsive, elegant cursor-following inertia
    card.style.transition = 'transform 0.18s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.18s cubic-bezier(0.25, 0.8, 0.25, 1)';
    card.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    
    // Custom dynamic green glow shadow matching the million-dollar emerald palette
    card.style.boxShadow = `${-x * 18}px ${-y * 18}px 35px rgba(34, 197, 94, 0.15), 0 15px 45px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    // Slow and smooth return inertia to rest state
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
    card.style.boxShadow = '0 15px 45px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
  };

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ ...style, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default TiltCard;
