import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import TempleSceneControls, { TempleFullscreenButton } from './TempleSceneControls';
import useTempleFullscreen from './useTempleFullscreen';
import NpcMemory from './NpcMemory';
import './ChuaPage.css';
import './TempleScene.css';

const PLACES = [
    {
        id: 'chanhdien',
        title: 'Chánh Điện',
        path: '/chanh-dien',
        short: 'Chánh Điện',
        teacher: 'Không gian Phật',
        image: '/images/chua/chanh-dien.jpg',
        desc: 'Không gian Phật, nhang khói và nhạc thiền — lắng lòng trước khi hỏi.',
        accent: '#e2c044',
        map: { x: 50, y: 44 }
    },
    {
        id: 'vuontinhtam',
        title: 'Vườn Tịnh Tâm',
        path: '/vuon-tinh-tam',
        short: 'Vườn Tịnh Tâm',
        teacher: 'Không gian tĩnh tâm',
        image: '/images/chua/vuon-tinh-tam.jpg',
        desc: 'Suối, vườn đá, cây lá và khung video nhạc piano của Leo.',
        accent: '#6ec8a0',
        map: { x: 50, y: 13 }
    },
    {
        id: 'tangkinhcac',
        title: 'Tàng Kinh Các',
        path: '/dientich',
        short: 'Tàng Kinh Các',
        teacher: 'Kho điển tịch cổ',
        image: '/images/chua/ban-do-chua.jpg',
        desc: 'Lầu kinh lưu giữ điển tích cổ học, lời dạy và kinh nghiệm luận mệnh.',
        accent: '#14b8a6',
        map: { x: 14, y: 46 }
    },
    {
        id: 'tracuu',
        title: 'Tra Cứu',
        path: '/tra-cuu',
        short: 'Tra cứu',
        teacher: 'Quầy tra cứu tổng hợp',
        image: '/images/chua/quay-xem-ngay.jpg',
        desc: 'Lá số, phân tích, vận hạn, xem ngày, thần số, tình duyên, xin quẻ, tarot và hỏi thầy — gom chung một quầy.',
        accent: '#fbbf24',
        map: { x: 87, y: 50 }
    }
];

const ChuaPage = () => {
    const fullscreen = useTempleFullscreen();

    // Khi roi ve che do "rap" (khong co Fullscreen API, thuong gap tren
    // dien thoai), dua scene thang ra document.body de position:fixed
    // luon tinh theo viewport — khong bi khung cuon .mobile-content
    // (overflow-y:auto) co lai lam canh hien nho.
    const sceneBg = (
        <div className="chua-scene-bg" ref={fullscreen.sceneRef}>
            <video
                className="chua-scene-video"
                src="/video/cong-chua-smoke.mp4"
                poster="/images/chua/nen-cong-chua.jpg"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-hidden="true"
                tabIndex={-1}
            />
            <TempleSceneControls fullscreen={fullscreen} />
        </div>
    );

    return (
        <>
            {fullscreen.isFallback ? createPortal(sceneBg, document.body) : sceneBg}

            <div className="chua-page chua-content fade-in">
                <div className="chua-fs-slot">
                    <TempleFullscreenButton onClick={fullscreen.enter} />
                </div>

                <header className="chua-hero glass-card">
                    <span className="chua-kicker">RongLeo • Bản đồ chùa</span>
                    <h1 className="chua-title">Vào Chùa Xem</h1>
                    <p className="chua-subtitle">
                        Đi một vòng sân chùa, ghé từng quầy — mỗi quầy có một thầy phụ trách.
                    </p>
                </header>

                <NpcMemory npcId="chua" showGuestInvite={false} />

                <nav className="chua-quick" aria-label="Xem nhanh">
                    <span className="chua-quick-label">Xem nhanh</span>
                    <div className="chua-quick-links">
                        {PLACES.map(place => (
                            <Link key={place.id} to={place.path} className="chua-quick-link">
                                {place.short}
                            </Link>
                        ))}
                    </div>
                </nav>

                <section className="chua-atlas glass-card" aria-label="Bản đồ chùa nhìn từ trên cao">
                    <div className="chua-atlas-frame">
                        <img
                            className="chua-atlas-image"
                            src="/images/chua/ban-do-chua.jpg"
                            alt="Toàn cảnh chùa nhìn từ trên cao, chánh điện ở giữa, các điện và quầy xung quanh"
                        />
                        <div className="chua-atlas-shade" aria-hidden="true" />

                        {PLACES.map(place => (
                            <Link
                                key={place.id}
                                to={place.path}
                                className={`chua-pin chua-pin--${place.id}`}
                                style={{ left: `${place.map.x}%`, top: `${place.map.y}%`, '--pin-accent': place.accent }}
                                aria-label={`${place.title} — ${place.teacher}`}
                            >
                                <span className="chua-pin-dot" aria-hidden="true" />
                                <span className="chua-pin-tip">
                                    <span className="chua-pin-name">{place.title}</span>
                                    <span className="chua-pin-teacher">{place.teacher}</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                    <p className="chua-atlas-caption">
                        Bấm vào điểm đánh dấu để đi tới khu đó — nhìn từ trên cao thấy toàn cảnh chùa.
                    </p>
                </section>

                <section className="chua-gallery" aria-label="Các khu trong chùa">
                    {PLACES.map(place => (
                        <Link
                            key={place.id}
                            to={place.path}
                            className="chua-card"
                            style={{ '--card-accent': place.accent }}
                        >
                            <span className="chua-card-media">
                                <img
                                    src={place.image}
                                    alt={`Không gian ${place.title}`}
                                    loading="lazy"
                                />
                            </span>
                            <span className="chua-card-body">
                                <span className="chua-card-title">{place.title}</span>
                                <span className="chua-card-teacher">{place.teacher}</span>
                                <span className="chua-card-desc">{place.desc}</span>
                                <span className="chua-card-cta">Vào →</span>
                            </span>
                        </Link>
                    ))}
                </section>

                <p className="chua-login-note">
                    Đăng nhập ở góc trên để lưu hồ sơ — lần sau vào quầy không phải gõ lại ngày giờ sinh.
                </p>
            </div>
        </>
    );
};

export default ChuaPage;
