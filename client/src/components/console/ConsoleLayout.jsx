import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CinematicBackground } from '../landing/CinematicBackground';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '../../hooks/useAuth';

export const ConsoleLayout = ({ children, title }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const { theme } = useAuth();
  const location = useLocation();

  const handleCollapseToggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  return (
    <div className={`console-root ${theme}`}>
      {/* Animated enterprise background */}
      <CinematicBackground />

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onCollapseToggle={handleCollapseToggle}
      />

      {/* Main area */}
      <div 
        className="console-workspace" 
        style={{ 
          flex: 1, 
          marginLeft: collapsed ? '96px' : '272px',
          transition: 'margin-left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' 
        }}
      >
        {/* Top bar */}
        <TopBar
          onMenuClick={() => setMobileOpen(true)}
          title={title}
          collapsed={collapsed}
        />

        {/* Page content */}
        <main className="workspace-content" key={location.pathname}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default ConsoleLayout;
