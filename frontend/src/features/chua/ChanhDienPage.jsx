import React from 'react';
import { Link } from 'react-router-dom';
import TempleBackground from './TempleBackground';
import TempleSceneControls, { TempleFullscreenButton } from './TempleSceneControls';
import useTempleFullscreen from './useTempleFullscreen';
import './TempleScene.css';

const ChanhDienPage = () => {
    const fullscreen = useTempleFullscreen();

    return (
        <div className="temple-page chanh-dien-page">
            <div className="temple-scene chanh-scene" ref={fullscreen.sceneRef}>
                <TempleBackground src="/video/chanh-dien-pp.mp4" />
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
