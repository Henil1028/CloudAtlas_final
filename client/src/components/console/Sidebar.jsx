import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, BarChart3, Sliders, ShieldAlert,
  Zap, Bot, Database, FileText, Settings, ChevronLeft, ChevronRight,
  Activity, Sparkles, Menu, X
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'AI Models',
    items: [
      { name: 'Cost Prediction', path: '/predictions', icon: TrendingUp },
      { name: 'Cost Driver Analysis', path: '/analytics', icon: BarChart3 },
      { name: 'Budget Simulator', path: '/simulator', icon: Sliders },
      { name: 'Risk Classification', path: '/risk-assessment', icon: ShieldAlert },
      { name: 'Anomaly Detection', path: '/anomalies', icon: Zap },
      { name: 'AI Insight Engine', path: '/insights', icon: Bot },
    ]
  },
  {
    label: 'Data',
    items: [
      { name: 'Datasets', path: '/datasets', icon: Database },
      { name: 'Reports', path: '/reports', icon: FileText },
      { name: 'Upload CSV', path: '/upload', icon: Activity },
    ]
  },
  {
    label: 'Account',
    items: [
      { name: 'Settings', path: '/settings', icon: Settings },
    ]
  }
];

export const Sidebar = ({ mobileOpen, onMobileClose, collapsed, onCollapseToggle }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className="console-sidebar"
        style={{
          transform: mobileOpen ? 'translateX(0)' : undefined,
          width: collapsed ? '64px' : '240px',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s ease',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center',
          gap: '10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          minHeight: '64px',
        }}>
          <div style={{
            width: '32px', height: '32px', flexShrink: 0,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)',
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          {!collapsed && (
            <div>
              <div style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700, fontSize: '15px',
                color: '#F1F5F9', letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                CloudAtlas
              </div>
              <div style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600, fontSize: '10px',
                backgroundImage: 'linear-gradient(135deg, #7C3AED, #06B6D4, #22C55E)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                AI Platform
              </div>
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            style={{
              marginLeft: 'auto', display: 'none', background: 'none',
              border: 'none', color: '#64748B', cursor: 'pointer',
            }}
            className="lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0', overflowX: 'hidden' }}>
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} style={{ marginBottom: '4px' }}>
              {!collapsed && (
                <div style={{
                  padding: '8px 20px 4px',
                  fontSize: '10px', fontWeight: 600,
                  color: '#475569', letterSpacing: '0.08em',
                  textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
                }}>
                  {section.label}
                </div>
              )}
              {collapsed && si > 0 && (
                <div style={{
                  height: '1px', margin: '8px 12px',
                  background: 'rgba(255,255,255,0.04)',
                }} />
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-nav-item ${active ? 'active' : ''}`}
                    style={{
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      padding: collapsed ? '10px 12px' : '9px 16px',
                      margin: '1px 8px',
                      title: collapsed ? item.name : undefined,
                    }}
                    title={collapsed ? item.name : undefined}
                    onClick={onMobileClose}
                  >
                    <Icon
                      size={16}
                      style={{
                        flexShrink: 0,
                        color: active ? '#06B6D4' : 'currentColor',
                      }}
                    />
                    {!collapsed && (
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '12px 8px',
        }}>
          <button
            onClick={onCollapseToggle}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-end',
              gap: '6px', padding: '8px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              color: '#475569', cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
            }}
            className="hidden lg:flex"
            onMouseEnter={e => {
              e.currentTarget.style.color = '#06B6D4';
              e.currentTarget.style.borderColor = 'rgba(6,182,212,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : (
              <>
                <span>Collapse</span>
                <ChevronLeft size={14} />
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
