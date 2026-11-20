import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import AccountButton from './AccountButton';
import { TEMPLE_LINKS, ROOMS } from '../config/rooms';

// Hai nhóm điều hướng tách bạch trên header: đi dạo chùa và tra cứu.
const headerGroups = [
  {
    id: 'temple',
    label: 'Đi dạo chùa',
    items: TEMPLE_LINKS.map(link => ({
      id: link.id,
      path: link.path,
      label: link.label,
      icon: link.icon
    }))
  },
  {
    id: 'lookup',
    label: 'Tra cứu',
    items: [
      { id: 'tra-cuu', path: '/tra-cuu', label: 'HỒ SƠ', icon: '🧭' },
      ...ROOMS.map(room => ({
        id: room.id,
        path: room.path,
        label: room.label,
        icon: room.icon
      }))
    ]
  }
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
      <>
        <div style={{ position: 'fixed', top: '12px', left: '12px', zIndex: 200 }}>
          <a href="https://rongleo.com" target="_blank" rel="noopener noreferrer" style={LAND_LINK_STYLE}>
            Trang chủ rongleo
          </a>
        </div>
        <div style={{ position: 'fixed', top: '12px', right: '12px', zIndex: 200 }}>
          <AccountButton />
        </div>
      </>
    );
  }

  return (
    <div className="mobile-brand-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
      <a
        href="https://rongleo.com"
        target="_blank"
        rel="noopener noreferrer"
        style={LAND_LINK_STYLE}
      >
        Trang chủ rongleo
      </a>
      <h1 className="mobile-mini-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        MỆNH LÝ AI
      </h1>
      <AccountButton />
    </div>
  );
};

// Header Navigation Component - hai nhóm tách bạch
const HeaderNav = () => {
  return (
    <header className="mobile-header">
      <nav className="header-nav header-nav-groups" aria-label="Điều hướng chính">
        {headerGroups.map(group => (
          <div key={group.id} className="header-nav-group">
            <span className="header-nav-group-label">{group.label}</span>
            <div className="header-nav-group-items">
              {group.items.map(tab => (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{tab.icon}</span>
                  <span className="nav-label">{tab.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
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
            to={tab.path}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Center Floating Button */}
      <NavLink
        to={centerTab.path}
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
              to={tab.path}
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
