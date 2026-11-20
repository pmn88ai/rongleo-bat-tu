import React from 'react';
import { Link } from 'react-router-dom';
import TempleBackground from './TempleBackground';
import TempleSceneControls, { TempleFullscreenButton } from './TempleSceneControls';
import useTempleFullscreen from './useTempleFullscreen';
import './TempleScene.css';

const BuddhaSilhouette = () => (
    <svg
        className="chanh-buddha"
        viewBox="0 0 320 420"
        role="img"
        aria-label="Tượng Phật trong Chánh điện"
    >
        <defs>
            <radialGradient id="buddhaHalo" cx="50%" cy="34%" r="52%">
                <stop offset="0%" stopColor="#ffe9a8" stopOpacity="0.55" />
                <stop offset="55%" stopColor="#e2c044" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#e2c044" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="buddhaBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f7e8b0" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#b98d2c" stopOpacity="0.72" />
            </linearGradient>
        </defs>

        <circle cx="160" cy="150" r="132" fill="url(#buddhaHalo)" className="chanh-halo" />
        <circle cx="160" cy="150" r="104" fill="none" stroke="rgba(226,192,68,0.28)" strokeWidth="1.4" strokeDasharray="2 8" />

        <ellipse cx="160" cy="394" rx="126" ry="18" fill="rgba(226,192,68,0.16)" />
        <ellipse cx="160" cy="386" rx="102" ry="15" fill="none" stroke="rgba(226,192,68,0.5)" strokeWidth="2" />

        <path
            d="M160 74c26 0 45 21 45 48 0 12-3 22-9 30 20 9 33 30 33 53 0 30-25 50-69 50s-69-20-69-50c0-23 13-44 33-53-6-8-9-18-9-30 0-27 19-48 45-48z"
            fill="url(#buddhaBody)"
            stroke="rgba(255,240,190,0.75)"
            strokeWidth="1.6"
        />
        <path d="M132 152c8-5 48-5 56 0" fill="none" stroke="rgba(80,55,10,0.55)" strokeWidth="3" strokeLinecap="round" />
        <path d="M128 178c10 9 54 9 64 0" fill="none" stroke="rgba(80,55,10,0.5)" strokeWidth="3" strokeLinecap="round" />
        <path d="M160 92c-7 0-13 6-13 13s6 13 13 13 13-6 13-13-6-13-13-13z" fill="rgba(255,248,220,0.8)" />
        <path d="M96 250c22 15 106 15 128 0" fill="none" stroke="rgba(255,240,190,0.55)" strokeWidth="2" />
        <path d="M104 276c18 10 94 10 112 0" fill="none" stroke="rgba(255,240,190,0.4)" strokeWidth="2" />
    </svg>
);

const IncenseSmoke = () => (
    <div className="chanh-incense" aria-hidden="true">
        <div className="incense-bowl">
            <span className="incense-stick stick-1" />
            <span className="incense-stick stick-2" />
            <span className="incense-stick stick-3" />
        </div>
        <span className="smoke smoke-1" />
        <span className="smoke smoke-2" />
        <span className="smoke smoke-3" />
        <span className="smoke smoke-4" />
    </div>
);

const ChanhDienPage = () => {
    const fullscreen = useTempleFullscreen();

    return (
        <div className="temple-page chanh-dien-page">
            <div className="temple-scene chanh-scene" ref={fullscreen.sceneRef}>
                <TempleBackground src="/video/chanh-dien.mp4" />
                <div className="chanh-radiance" />
                <div className="chanh-beams">
                    <span className="beam beam-a" />
                    <span className="beam beam-b" />
                    <span className="beam beam-c" />
                </div>
                <div className="chanh-floor" />
                <BuddhaSilhouette />
                <IncenseSmoke />
                <div className="chanh-lotus">
                    <span /><span /><span /><span /><span />
                </div>
                <TempleSceneControls fullscreen={fullscreen} />
            </div>

            <div className="temple-content">
                <TempleFullscreenButton onClick={fullscreen.enter} />

                <header className="temple-hero glass-card">
                    <span className="temple-kicker">RongLeo • Không gian tĩnh lặng</span>
                    <h1 className="temple-title">Chánh Điện</h1>
                    <p className="temple-subtitle">
                        Một khoảng lặng trước khi gieo quẻ. Thắp nén nhang, nghe tiếng đàn,
                        để lòng mình lắng lại.
                    </p>
                </header>

                <section className="temple-card glass-card">
                    <h2>Nghe nhạc thiền</h2>
                    <p>
                        Bản piano của Leo đã sẵn trong chùa. Bấm nút tròn ở góc dưới để phát,
                        bấm lần nữa để mở thanh nhạc đầy đủ.
                    </p>
                    <div className="temple-links">
                        <Link to="/vuon-tinh-tam" className="temple-link">
                            Sang Vườn tịnh tâm →
                        </Link>
                        <Link to="/chua" className="temple-link temple-link--ghost">
                            ← Về bản đồ chùa
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ChanhDienPage;
