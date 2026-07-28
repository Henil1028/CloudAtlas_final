import React, { useEffect, useRef, useState } from 'react';

/* ─── Inject keyframes once ─────────────────────────────────────────────────── */
const GLOW_STYLES = `
@keyframes glow-rotate {
  0%   { transform: translate(-50%, -50%) rotate(0deg);   }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes glow-shimmer {
  0%   { left: -100%; }
  60%  { left: 120%;  }
  100% { left: 120%;  }
}
@keyframes glow-float {
  0%, 100% { transform: translateY(0px)   scale(1);    opacity: 0.6; }
  50%       { transform: translateY(-8px) scale(1.08); opacity: 0.9; }
}
@keyframes glow-pulse-border {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1;   }
}
@keyframes glow-count {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}
.glow-card-root {
  position: relative;
  border-radius: 18px;
  padding: 2px;          /* space for the rotating border */
  cursor: default;
  isolation: isolate;
  transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1),
              box-shadow  0.22s ease;
}
.glow-card-root:hover {
  transform: translateY(-4px) scale(1.015);
}
.glow-card-inner {
  border-radius: 16px;
  padding: 20px 18px;
  position: relative;
  overflow: hidden;
  background: rgba(6, 9, 22, 0.85);
  backdrop-filter: blur(18px);
  height: 100%;
}
/* Conic-gradient spinning ring */
.glow-card-ring {
  position: absolute;
  top: 50%; left: 50%;
  width: 200%; height: 200%;
  border-radius: 50%;
  animation: glow-rotate 3.5s linear infinite;
  pointer-events: none;
  z-index: 0;
}
/* Shimmer sweep */
.glow-card-shimmer {
  position: absolute;
  top: 0; bottom: 0;
  width: 45%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.05) 50%,
    transparent 100%
  );
  animation: glow-shimmer 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 2;
}
/* Floating orb */
.glow-card-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(28px);
  animation: glow-float 4s ease-in-out infinite;
  z-index: 1;
}
/* Value count-in */
.glow-card-value {
  animation: glow-count 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
}
`;

let stylesInjected = false;
const injectStyles = () => {
  if (stylesInjected) return;
  const el = document.createElement('style');
  el.textContent = GLOW_STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
};

/* ─── GlowCard ──────────────────────────────────────────────────────────────── */
export const GlowCard = ({
  label,
  value,
  badge,
  badgeUp,
  gradient,   // CSS gradient string e.g. 'linear-gradient(135deg,#7C3AED,#A855F7)'
  glow,       // rgba glow colour string
  animDelay = 0,
  children,
}) => {
  const [ready, setReady] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    injectStyles();
    const t = setTimeout(() => setReady(true), 60 + animDelay);
    return () => clearTimeout(t);
  }, []);

  // Trigger re-animation when value changes
  useEffect(() => {
    if (value !== prevValue) {
      setAnimKey(k => k + 1);
      setPrevValue(value);
    }
  }, [value]);

  const opacity = ready ? 1 : 0;

  return (
    <div
      className="glow-card-root"
      style={{
        opacity,
        transition: `opacity 0.4s ease ${animDelay}ms, transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.45), 0 0 40px ${glow}`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.06), 0 16px 48px rgba(0,0,0,0.5), 0 0 60px ${glow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.45), 0 0 40px ${glow}`;
      }}
    >
      {/* Rotating conic border */}
      <div
        className="glow-card-ring"
        style={{ background: `conic-gradient(from 0deg, transparent 0%, ${glow} 20%, transparent 40%)` }}
      />

      {/* Thin static border behind ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '18px',
        border: `1px solid ${glow.replace(/[\d.]+\)$/, '0.25)')}`,
        pointerEvents: 'none', zIndex: 3, animation: 'glow-pulse-border 2.5s ease-in-out infinite',
      }} />

      {/* Card body */}
      <div className="glow-card-inner">
        {/* Shimmer */}
        <div className="glow-card-shimmer" />

        {/* Corner glow orb */}
        <div
          className="glow-card-orb"
          style={{
            width: '100px', height: '100px',
            top: '-30px', right: '-30px',
            background: gradient,
            opacity: 0.12,
            animationDelay: `${animDelay}ms`,
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 4 }}>
          {/* Label */}
          <div style={{
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#475569',
            fontFamily: 'Inter', marginBottom: '12px',
          }}>
            {label}
          </div>

          {/* Value */}
          <div
            key={animKey}
            className="glow-card-value"
            style={{
              fontSize: '28px', fontWeight: 900,
              fontFamily: 'Space Grotesk, monospace',
              letterSpacing: '-0.03em', lineHeight: 1,
              backgroundImage: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `drop-shadow(0 0 10px ${glow})`,
              marginBottom: '10px',
            }}
          >
            {value}
          </div>

          {/* Badge */}
          {badge && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700,
                padding: '3px 9px', borderRadius: '12px',
                background: badgeUp ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                border: `1px solid ${badgeUp ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
                color: badgeUp ? '#F87171' : '#4ADE80',
                fontFamily: 'Space Grotesk',
              }}>
                {badge}
              </span>
            </div>
          )}

          {/* Extra children (subtitle etc) */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default GlowCard;
