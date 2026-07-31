import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, CloudOff } from 'lucide-react';

/**
 * EmptyState — shown on all analytics pages when no CSV has been uploaded.
 * Shows the page header, zeroed KPI cards, and a prominent upload prompt.
 */
export const EmptyState = ({ title, subtitle, icon: Icon, iconColor = '#7C3AED', kpis = [] }) => {
  return (
    <div>
      {/* Zeroed KPI Row */}
      {kpis.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          {kpis.map((kpi, i) => (
            <div key={i} style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', fontFamily: 'Inter, sans-serif' }}>
                {kpi.label}
              </div>
              <div style={{ fontFamily: 'Space Grotesk, monospace', fontSize: '26px', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em' }}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Prompt Card */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 40px',
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.015)',
        border: '1px dashed rgba(124,58,237,0.3)',
        textAlign: 'center',
        gap: '20px',
      }}>
        {/* Icon */}
        <div style={{
          width: '72px', height: '72px',
          borderRadius: '20px',
          background: 'rgba(124,58,237,0.1)',
          border: '1px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CloudOff size={30} color="#7C3AED" />
        </div>

        {/* Text */}
        <div>
          <h3 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '20px', fontWeight: 700,
            color: '#F1F5F9', margin: '0 0 8px',
          }}>
            No Billing Data Yet
          </h3>
          <p style={{
            fontSize: '14px', color: '#64748B',
            maxWidth: '420px', margin: '0 auto',
            lineHeight: 1.6, fontFamily: 'Inter, sans-serif',
          }}>
            Upload a multi-cloud billing CSV to populate {title.toLowerCase()} data, charts, and AI-powered insights.
          </p>
        </div>

        {/* Upload Button */}
        <Link
          to="/upload"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.02em',
            boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Upload size={16} />
          Upload Billing CSV
        </Link>

        {/* Sub-hint */}
        <p style={{ fontSize: '12px', color: '#334155', margin: 0, fontFamily: 'Inter, sans-serif' }}>
          Supports AWS · Azure · GCP &nbsp;·&nbsp; CSV format &nbsp;·&nbsp; Up to 2 GB
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
