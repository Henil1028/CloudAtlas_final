import React from 'react';

export const ChartCard = ({
  title,
  subtitle,
  children,
  action,
  badge,
  loading = false,
  style = {},
  bodyStyle = {},
  minHeight = 280,
}) => {
  return (
    <div
      className="chart-card animate-fade-in-up"
      style={{ ...style }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '20px', gap: '12px',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px',
            color: '#F1F5F9', lineHeight: 1.3, marginBottom: '3px',
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{
              fontFamily: 'Inter, sans-serif', fontSize: '12px',
              color: '#475569', lineHeight: 1.4,
            }}>
              {subtitle}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {badge && (
            <span className={`badge-${badge.color || 'purple'}`}>
              {badge.text}
            </span>
          )}
          {action}
        </div>
      </div>

      {/* Body */}
      <div style={{ minHeight, ...bodyStyle }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '24px', width: `${80 - i * 8}%` }} />
            ))}
          </div>
        ) : children}
      </div>
    </div>
  );
};

export default ChartCard;
