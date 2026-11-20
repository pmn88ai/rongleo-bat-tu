import React from 'react';
import { Link } from 'react-router-dom';
import TempleBackground from './TempleBackground';
import TempleSceneControls, { TempleFullscreenButton } from './TempleSceneControls';
import useTempleFullscreen from './useTempleFullscreen';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import './TempleScene.css';

const MusicVideoCard = () => {
    const { embedSrc, currentTrack } = useMusicPlayer();

    return (
        <section className="temple-card glass-card music-video-card">
            <h2>Video nhạc của Leo</h2>
            <div className="music-video-frame">
                <iframe
                    src={embedSrc}
                    title={currentTrack.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                />
            </div>
        </section>
    );
};

const GardenScene = ({ sceneRef, fullscreen }) => (
    <div className="temple-scene vuon-scene" ref={sceneRef}>
        <TempleBackground src="/video/vuon-tinh-tam-pp.mp4" />
        <TempleSceneControls fullscreen={fullscreen} />
    </div>
);

const VuonTinhTamPage = () => {
    const fullscreen = useTempleFullscreen();

    return (
        <div className="temple-page vuon-tinh-tam-page">
            <GardenScene sceneRef={fullscreen.sceneRef} fullscreen={fullscreen} />

            <div className="temple-content">
                <TempleFullscreenButton onClick={fullscreen.enter} />

                <header className="temple-hero glass-card">
                    <span className="temple-kicker">RongLeo • Vườn tĩnh tâm</span>
                    <h1 className="temple-title">Vườn Tịnh Tâm</h1>
                    <p className="temple-subtitle">
                        Suối chảy qua vườn đá, lá đung đưa trong gió. Ngồi đây một lát,
                        nghe đàn rồi hãy hỏi điều mình đang băn khoăn.
                    </p>
                </header>

                <MusicVideoCard />

                <section className="temple-card glass-card">
                    <div className="temple-links">
                        <Link to="/chanh-dien" className="temple-link">
                            Vào Chánh điện →
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

export default VuonTinhTamPage;
