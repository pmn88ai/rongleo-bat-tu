import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const tabs = [
    { id: 'chart', path: '/laso', label: 'LÁ SỐ', icon: '🎨' },
    { id: 'matrix', path: '/phantich', label: 'PHÂN TÍCH', icon: '⚙️' },
    { id: 'date', path: '/xemngay', label: 'XEM NGÀY', icon: '📅' },
    { id: 'matching', path: '/duyenso', label: 'DUYÊN SỐ', icon: '🎎' },
    { id: 'que', path: '/xinque', label: 'GIEO QUẺ', icon: '🎴' },
    { id: 'consultant', path: '/tuvan', label: 'TƯ VẤN', icon: '💬' },
    { id: 'wisdom', path: '/dientich', label: 'ĐIỂN TỊCH', icon: '📜' },
    { id: 'western', path: '/tuviphuongtay', label: 'TỬ VI TÂY', icon: '⭐' },
];

const DesktopShell = ({ children, hasData, onClearData }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClearData = () => {
        if (onClearData) {
            onClearData();
            navigate('/');
        }
    };

    const isHomePage = location.pathname === '/' || location.pathname === '/input';

    return (
        <div className="desktop-shell">
            <div className="app-container">
                {!isHomePage && (
                    <>
                        <div className="action-bar glass-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <a
                                    href="https://rongleo-land.vercel.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        background: 'linear-gradient(135deg, #1a6fc4 0%, #0d4f9e 100%)',
                                        color: '#fff', textDecoration: 'none',
                                        padding: '8px 16px', borderRadius: '8px',
                                        fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.5px',
                                        boxShadow: '0 4px 15px rgba(26,111,196,0.4)',
                                        transition: 'all 0.3s ease', whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(26,111,196,0.6)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 15px rgba(26,111,196,0.4)'; }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    ← RongLeo Land
                                </a>
                                <h1 className="mini-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                                    MỆNH LÝ AI
                                </h1>
                            </div>
                            <div className="header-right">
                                {hasData && (
                                    <button className="premium-button small" onClick={handleClearData}>
                                        XEM LÁ SỐ KHÁC
                                    </button>
                                )}
                            </div>
                        </div>

                        <nav className="main-nav-tabs glass-card">
                            {tabs.map(tab => (
                                <NavLink
                                    key={tab.id}
                                    to={{ pathname: tab.path, search: location.search }}
                                    className={({ isActive }) => `nav-tab-btn ${isActive ? 'active' : ''}`}
                                >
                                    <span className="tab-icon">{tab.icon}</span>
                                    <span className="tab-label">{tab.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </>
                )}

                <main className="desktop-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DesktopShell;
