import React from 'react';
import { Link } from 'react-router-dom';
import TempleBackground from './TempleBackground';
import './TempleScene.css';

const MUSIC_VIDEO_SOURCE = (import.meta.env.VITE_MUSIC_VIDEO_URL || '').trim();

const toYouTubeEmbed = (url) => {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('youtu.be')) {
            return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
        }
        if (parsed.hostname.includes('youtube.com')) {
            const id = parsed.searchParams.get('v');
            if (id) return `https://www.youtube.com/embed/${id}`;
            if (parsed.pathname.startsWith('/embed/')) return url;
        }
    } catch (e) {
        return null;
    }
    return null;
};

const MusicVideoCard = () => {
    const isYouTube = /youtu\.?be/.test(MUSIC_VIDEO_SOURCE);
    const embedUrl = isYouTube ? toYouTubeEmbed(MUSIC_VIDEO_SOURCE) : null;

    return (
        <section className="temple-card glass-card music-video-card">
            <h2>Video nhạc của Leo</h2>

            {MUSIC_VIDEO_SOURCE ? (
                isYouTube && embedUrl ? (
                    <div className="music-video-frame">
                        <iframe
                            src={embedUrl}
                            title="Video nhạc piano của Leo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="music-video-frame">
                        <video src={MUSIC_VIDEO_SOURCE} controls playsInline preload="metadata" />
                    </div>
                )
            ) : (
                <div className="music-video-placeholder">
                    <span className="music-video-note">🎹</span>
                    <p>
                        Khung phát video piano đã sẵn. Leo chỉ cần đưa <strong>link YouTube</strong> hoặc
                        <strong> file video local</strong> để cấu hình, không cần sửa giao diện.
                    </p>
                </div>
            )}
        </section>
    );
};

const GardenScene = () => (
    <div className="temple-scene vuon-scene">
        <TempleBackground src="/video/vuon-tinh-tam.mp4" />
        <div className="vuon-sky" />
        <div className="vuon-sun" />

        <svg className="vuon-garden" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <defs>
                <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bfe9ff" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#4f9bb8" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="rockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5c6660" />
                    <stop offset="100%" stopColor="#2b3330" />
                </linearGradient>
            </defs>

            <path
                className="vuon-hill vuon-hill--back"
                d="M0 640 Q220 520 430 610 T900 580 Q1160 530 1440 620 V900 H0 Z"
            />
            <path
                className="vuon-hill vuon-hill--front"
                d="M0 720 Q260 650 520 710 T1020 690 Q1240 660 1440 720 V900 H0 Z"
            />

            <path
                className="vuon-stream"
                d="M520 360 C620 430 470 520 640 600 C790 670 660 760 820 900 L1120 900 C940 750 1080 650 930 560 C790 476 900 420 760 340 Z"
                fill="url(#streamGrad)"
            />
            <path
                className="vuon-stream-shine"
                d="M720 430 C790 500 690 560 800 630 C900 690 840 780 930 880"
            />
            <path
                className="vuon-stream-shine vuon-stream-shine--2"
                d="M660 470 C730 530 640 590 740 660 C830 720 790 800 860 890"
            />

            <g className="vuon-rocks">
                <ellipse cx="330" cy="760" rx="120" ry="52" fill="url(#rockGrad)" />
                <ellipse cx="440" cy="792" rx="82" ry="34" fill="url(#rockGrad)" opacity="0.85" />
                <ellipse cx="1060" cy="774" rx="140" ry="56" fill="url(#rockGrad)" />
                <ellipse cx="930" cy="800" rx="72" ry="30" fill="url(#rockGrad)" opacity="0.8" />
            </g>

            <g className="vuon-grass">
                <path d="M120 900 Q140 810 170 900" />
                <path d="M180 900 Q200 830 230 900" />
                <path d="M250 900 Q268 820 300 900" />
                <path d="M1180 900 Q1200 820 1230 900" />
                <path d="M1260 900 Q1280 830 1310 900" />
                <path d="M1330 900 Q1350 810 1380 900" />
            </g>
        </svg>

        <div className="vuon-tree vuon-tree--left" aria-hidden="true">
            <span className="trunk" />
            <span className="leaf leaf-1" />
            <span className="leaf leaf-2" />
            <span className="leaf leaf-3" />
            <span className="leaf leaf-4" />
        </div>
        <div className="vuon-tree vuon-tree--right" aria-hidden="true">
            <span className="trunk" />
            <span className="leaf leaf-1" />
            <span className="leaf leaf-2" />
            <span className="leaf leaf-3" />
            <span className="leaf leaf-4" />
        </div>
        <div className="vuon-bamboo" aria-hidden="true">
            <span /><span /><span /><span /><span />
        </div>

        <span className="vuon-firefly firefly-1" />
        <span className="vuon-firefly firefly-2" />
        <span className="vuon-firefly firefly-3" />
        <span className="vuon-firefly firefly-4" />
    </div>
);

const VuonTinhTamPage = () => {
    return (
        <div className="temple-page vuon-tinh-tam-page">
            <GardenScene />

            <div className="temple-content">
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
