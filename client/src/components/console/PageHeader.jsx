import React from 'react';
import { ChevronRight } from 'lucide-react';

export const PageHeader = ({ title, subtitle, icon: Icon, iconColor = '#7C3AED', breadcrumb = [], actions }) => {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: '28px', gap: '16px', flexWrap: 'wrap',
    }}>
      <div>
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            marginBottom: '8px',
          }}>
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={i}>
                <span style={{
                  fontSize: '12px', color: i === breadcrumb.length - 1 ? '#7C3AED' : '#475569',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: i === breadcrumb.length - 1 ? 500 : 400,
                }}>
                  {crumb}
                </span>
                {i < breadcrumb.length - 1 && (
                  <ChevronRight size={12} color="#334155" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {Icon && (
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: `${iconColor}18`,
              border: `1px solid ${iconColor}28`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={20} color={iconColor} />
            </div>
          )}
          <div>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700, fontSize: '24px',
              color: '#F1F5F9', margin: 0, lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px', color: '#475569',
                margin: '4px 0 0', lineHeight: 1.4,
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions slot */}
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
