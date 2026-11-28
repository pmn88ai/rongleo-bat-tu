import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import TempleBackground from './TempleBackground';
import TempleSceneControls, { TempleFullscreenButton } from './TempleSceneControls';
import useTempleFullscreen from './useTempleFullscreen';
import NpcMemory from './NpcMemory';
import './TempleScene.css';

const ChanhDienPage = () => {
    const fullscreen = useTempleFullscreen();

    // Khi roi ve che do "rap" (khong co Fullscreen API, thuong gap tren
    // dien thoai), dua scene thang ra document.body de position:fixed
    // luon tinh theo viewport — khong bi khung cuon .mobile-content
    // (overflow-y:auto) co lai lam canh hien nho.
    const scene = (
        <div className="temple-scene chanh-scene" ref={fullscreen.sceneRef}>
            <TempleBackground src="/video/chanh-dien-loop-30s.mp4" />
            <TempleSceneControls fullscreen={fullscreen} />
        </div>
    );

    return (
        <div className="temple-page chanh-dien-page">
            {fullscreen.isFallback ? createPortal(scene, document.body) : scene}

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

                <NpcMemory npcId="chua" />

                <section className="temple-card glass-card">
                    <h2>Nghe nhạc thiền</h2>
                    <p>
                        Tiếng chuông, mõ và sáo của Chánh điện (36 phút). Bấm nút tròn ở góc dưới
                        để phát, bấm lần nữa để mở thanh nhạc đầy đủ. Sang Vườn tịnh tâm sẽ đổi
                        sang bản piano và tiếng nước.
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
