import React from 'react';
import { Link } from 'react-router-dom';
import TempleSceneControls, { TempleFullscreenButton } from './TempleSceneControls';
import useTempleFullscreen from './useTempleFullscreen';
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
        id: 'battu',
        title: 'Điện Bát Tự',
        path: '/',
        short: 'Bát Tự',
        teacher: 'Thầy Can Chi',
        image: '/images/chua/dien-bat-tu.jpg',
        desc: 'Nhập ngày giờ sinh để xem lá số Tứ Trụ.',
        accent: '#fbbf24',
        map: { x: 87, y: 50 }
    },
    {
        id: 'xemngay',
        title: 'Quầy Xem Ngày',
        path: '/xemngay',
        short: 'Xem Ngày',
        teacher: 'Thầy Hoàng Đạo',
        image: '/images/chua/quay-xem-ngay.jpg',
        desc: 'Chọn ngày tốt cho việc lớn, việc nhỏ.',
        accent: '#4ade80',
        map: { x: 31, y: 67 }
    },
    {
        id: 'vanhomnay',
        title: 'Quầy Vận Hôm Nay',
        path: '/van-hom-nay',
        short: 'Vận Hôm Nay',
        teacher: 'Thầy Thời Vận',
        image: '/images/chua/quay-van-hom-nay.jpg',
        desc: 'Xem vận may, việc nên và nên tránh trong ngày.',
        accent: '#fb923c',
        map: { x: 36, y: 84 }
    },
    {
        id: 'duyenso',
        title: 'Quầy Tình Duyên',
        path: '/duyenso',
        short: 'Tình Duyên',
        teacher: 'Thầy Duyên Khởi',
        image: '/images/chua/quay-tinh-duyen.jpg',
        desc: 'So duyên hai người, xem hợp hay không hợp.',
        accent: '#f472b6',
        map: { x: 64, y: 84 }
    },
    {
        id: 'xinque',
        title: 'Quầy Xin Quẻ',
        path: '/xinque',
        short: 'Xin Quẻ',
        teacher: 'Thầy Quẻ Cát',
        image: '/images/chua/quay-xin-que.jpg',
        desc: 'Gieo quẻ, hỏi một việc đang băn khoăn.',
        accent: '#60a5fa',
        map: { x: 71, y: 66 }
    },
    {
        id: 'tuvan',
        title: 'Phòng Hỏi Thầy',
        path: '/tuvan',
        short: 'Hỏi Thầy',
        teacher: 'Thầy Huyền Cơ Bát Tự + Thầy Mệnh Mèo GenZ',
        image: '/images/chua/phong-hoi-thay.jpg',
        desc: 'Đặt câu hỏi riêng, được hai thầy luận giải.',
        accent: '#e2c044',
        map: { x: 50, y: 89 }
    }
];

const ChuaPage = () => {
    const fullscreen = useTempleFullscreen();

    return (
        <>
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
