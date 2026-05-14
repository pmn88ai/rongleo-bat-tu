import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

// Header navigation items (4 items)
const headerTabs = [
  { id: 'date', path: '/xemngay', label: 'XEM NGÀY', icon: '📅' },
  { id: 'matching', path: '/duyenso', label: 'DUYÊN SỐ', icon: '🎎' },
  { id: 'cycles', path: '/vanhan', label: 'VẬN HẠN', icon: '📈' },
  { id: 'western', path: '/tuviphuongtay', label: 'TỬ VI TÂY', icon: '⭐' },
];

// Status Bar - chỉ hiển thị thời gian
const StatusBar = () => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mobile-status-bar">
      <span className="status-time">{timeStr}</span>
      <span className="status-notch"></span>
    </div>
  );
};

const LAND_LINK_STYLE = {
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
  color: '#fff', textDecoration: 'none',
  padding: '5px 10px', borderRadius: '6px',
  fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.3px',
  boxShadow: '0 3px 10px rgba(14,165,233,0.4)'
};

// Brand Bar Component
const BrandBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/input';

  if (isHomePage) {
    return (
      <div style={{ position: 'fixed', top: '12px', left: '12px', zIndex: 200 }}>
        <a href="https://rongleo-land.vercel.app/" target="_blank" rel="noopener noreferrer" style={LAND_LINK_STYLE}>
          ← RongLeo Land
        </a>
      </div>
    );
  }

  return (
    <div className="mobile-brand-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
      <a
        href="https://rongleo-land.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        style={LAND_LINK_STYLE}
      >
        ← RongLeo Land
      </a>
      <h1 className="mobile-mini-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        MỆNH LÝ AI
      </h1>
      <div style={{ width: '80px' }} />
    </div>
  );
};

// Header Navigation Component - Simplified
const HeaderNav = () => {
  const location = useLocation();

  return (
    <header className="mobile-header">
      <nav className="header-nav">
        {headerTabs.map(tab => (
          <NavLink
            key={tab.id}
            to={{ pathname: tab.path, search: location.search }}
            className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

// Bottom Navigation Component - Redesigned with center button
const BottomNav = ({ onClearData }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (onClearData) {
      onClearData();
    }
    navigate('/');
  };

  // Left items
  const leftTabs = [
    { id: 'chart', path: '/laso', label: 'LÁ SỐ', icon: '🎨' },
    { id: 'matrix', path: '/phantich', label: 'PHÂN TÍCH', icon: '⚙️' },
  ];

  // Right items
  const rightTabs = [
    { id: 'que', path: '/xinque', label: 'GIEO QUẺ', icon: '🎴' },
    { id: 'home', path: '/', label: 'TRANG CHỦ', icon: '🏠', onClick: handleHomeClick },
  ];

  // Center button (Tư Vấn) - ☯️ Yin-Yang symbol for BaZi/Feng Shui
  const centerTab = { id: 'consultant', path: '/tuvan', label: 'TƯ VẤN', icon: '☯️' };

  return (
    <nav className="mobile-bottom-nav">
      <div className="nav-left">
        {leftTabs.map(tab => (
          <NavLink
            key={tab.id}
            to={{ pathname: tab.path, search: location.search }}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Center Floating Button */}
      <NavLink
        to={{ pathname: centerTab.path, search: location.search }}
        className={({ isActive }) => `bottom-nav-center ${isActive ? 'active' : ''}`}
      >
        <span className="center-icon">{centerTab.icon}</span>
        <span className="center-label">{centerTab.label}</span>
      </NavLink>

      <div className="nav-right">
        {rightTabs.map(tab => (
          tab.id === 'home' ? (
            <a
              key={tab.id}
              href="/"
              onClick={tab.onClick}
              className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </a>
          ) : (
            <NavLink
              key={tab.id}
              to={{ pathname: tab.path, search: location.search }}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </NavLink>
          )
        ))}
      </div>
    </nav>
  );
};

// Main Mobile Shell Component
const MobileShell = ({ children, hasData, onClearData }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/input';
  const pageClass = location.pathname.split('/').filter(Boolean).join('-') || 'home';

  return (
    <div className={`mobile-shell ${pageClass}-page ${isHomePage ? 'home-page' : ''}`}>
      <div className="mobile-top-fixed">
        <StatusBar />
        <BrandBar />
        <HeaderNav />
      </div>
      <main className="mobile-content">
        {children}
      </main>
      <BottomNav onClearData={onClearData} />
    </div>
  );
};

export default MobileShell;
