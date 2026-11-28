import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import TempleBackground from './TempleBackground';
import TempleSceneControls, { TempleFullscreenButton } from './TempleSceneControls';
import useTempleFullscreen from './useTempleFullscreen';
import NpcMemory from './NpcMemory';
import { TRACKS, trackForRoom } from '../../context/MusicPlayerContext';
import './TempleScene.css';

// Khung video luôn là bài YouTube của Vườn tịnh tâm (không lấy "bài đang chọn" — có thể là file nhạc Chánh điện).
const VUON_TRACK = trackForRoom('/vuon-tinh-tam') || TRACKS.find((t) => t.kind === 'youtube');

const MusicVideoCard = () => {
    if (!VUON_TRACK) return null;
    const embedSrc = `https://www.youtube.com/embed/${VUON_TRACK.id}?rel=0&playsinline=1`;
    const currentTrack = VUON_TRACK;

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
        <TempleBackground src="/video/vuon-tinh-tam-flow.mp4" />
        <TempleSceneControls fullscreen={fullscreen} />
    </div>
);

const VuonTinhTamPage = () => {
    const fullscreen = useTempleFullscreen();

    // Khi roi ve che do "rap" (khong co Fullscreen API, thuong gap tren
    // dien thoai), dua scene thang ra document.body de position:fixed
    // luon tinh theo viewport — khong bi khung cuon .mobile-content
    // (overflow-y:auto) co lai lam canh hien nho.
    const gardenScene = <GardenScene sceneRef={fullscreen.sceneRef} fullscreen={fullscreen} />;

    return (
        <div className="temple-page vuon-tinh-tam-page">
            {fullscreen.isFallback ? createPortal(gardenScene, document.body) : gardenScene}

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

                <NpcMemory npcId="chua" />

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
