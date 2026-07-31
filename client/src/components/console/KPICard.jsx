import React, { useState, useEffect } from 'react';

// Animated KPI counter hook
const useCountUp = (target, duration = 1200, format = 'number') => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const steps = 60;
    const increment = target / steps;
    const interval = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [target, duration]);

  return value;
};

const TREND_COLORS = {
  up_good: '#22C55E',
  up_bad: '#EF4444',
  down_good: '#22C55E',
  down_bad: '#EF4444',
  neutral: '#94A3B8',
};

export const KPICard = ({
  title,
  value,
  unit = '',
  prefix = '',
  suffix = '',
  trend,          // { value: number, direction: 'up'|'down', type: 'good'|'bad' }
  icon: Icon,
  iconColor = '#7C3AED',
  iconBg = 'rgba(124,58,237,0.12)',
  description,
  animateCount = true,
  style = {},
  delay = 0,
}) => {
  const isRawString = typeof value === 'string' && (value.startsWith('$') || value.includes(',') || value.includes('/') || value.includes('Active') || isNaN(Number(value)));
  const numValue = typeof value === 'number' ? value : (parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0);
  const counted = useCountUp(animateCount && !isRawString ? numValue : 0, 1200);
  const displayVal = animateCount && !isRawString ? counted : numValue;

  const trendKey = trend ? `${trend.direction}_${trend.type}` : 'neutral';
  const trendColor = TREND_COLORS[trendKey] || '#94A3B8';

  const formatDisplay = (v) => {
    if (isRawString) return value;
    if (unit === 'M' && v >= 1000000) return (v / 1000000).toFixed(2);
    if (unit === 'K' && v >= 1000) return (v / 1000).toFixed(1);
    if (Number.isInteger(numValue)) return Math.round(v).toLocaleString();
    return v.toFixed(1);
  };

  return (
    <div
      className="kpi-card animate-fade-in-up"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        ...style,
      }}
    >
      {/* Top row: icon + trend */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        {Icon && (
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={18} color={iconColor} />
          </div>
        )}
        {trend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            padding: '3px 8px', borderRadius: '999px',
            background: `${trendColor}14`,
            border: `1px solid ${trendColor}25`,
            fontSize: '11px', fontWeight: 700,
            color: trendColor, fontFamily: 'Space Grotesk, monospace',
            flexShrink: 0,
          }}>
            {trend.direction === 'up' ? '↑' : '↓'}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{
        fontFamily: 'Space Grotesk, monospace',
        fontWeight: 800, fontSize: '28px',
        color: '#F1F5F9', lineHeight: 1.1,
        letterSpacing: '-0.02em',
        marginBottom: '6px',
        className: 'animate-count-up',
      }}>
        {prefix}{formatDisplay(displayVal)}{suffix}
        {unit && (
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B', marginLeft: '3px' }}>
            {unit}
          </span>
        )}
      </div>

      {/* Label */}
      <div style={{
        fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500,
        color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: description ? '6px' : 0,
      }}>
        {title}
      </div>

      {/* Description */}
      {description && (
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: '11.5px',
          color: '#475569', lineHeight: 1.4,
        }}>
          {description}
        </div>
      )}
    </div>
  );
};

export default KPICard;
