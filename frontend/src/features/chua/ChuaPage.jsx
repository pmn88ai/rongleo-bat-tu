import React from 'react';
import { Link } from 'react-router-dom';
import './ChuaPage.css';

const STALLS = [
    {
        id: 'tuvi',
        title: 'Điện Tử Vi',
        path: '/tuvi',
        short: 'Tử Vi',
        desc: 'An sao 12 cung theo ngày âm và giờ sinh.',
        npcs: [
            {
                initial: 'T',
                name: 'Thầy Tinh Tú',
                line: 'Ta coi sao, đoán vận — mời con vào điện.'
            }
        ]
    },
    {
        id: 'battu',
        title: 'Điện Bát Tự',
        path: '/',
        short: 'Bát Tự',
        desc: 'Nhập ngày giờ sinh để xem lá số Tứ Trụ.',
        npcs: [
            {
                initial: 'C',
                name: 'Thầy Can Chi',
                line: 'Bát Tự là gốc — đưa ngày giờ đây, ta lập lá số.'
            }
        ]
    },
    {
        id: 'xemngay',
        title: 'Quầy Xem Ngày',
        path: '/xemngay',
        short: 'Xem Ngày',
        desc: 'Chọn ngày tốt cho việc lớn, việc nhỏ.',
        npcs: [
            {
                initial: 'Đ',
                name: 'Thầy Hoàng Đạo',
                line: 'Ngày nào nên làm, ngày nào nên hoãn — ta xem cho.'
            }
        ]
    },
    {
        id: 'vanhomnay',
        title: 'Quầy Vận Hôm Nay',
        path: '/van-hom-nay',
        short: 'Vận Hôm Nay',
        desc: 'Xem vận may, việc nên và nên tránh trong ngày.',
        npcs: [
            {
                initial: 'V',
                name: 'Thầy Thời Vận',
                line: 'Hôm nay thế nào, ta nói gọn một câu.'
            }
        ]
    },
    {
        id: 'duyenso',
        title: 'Quầy Tình Duyên',
        path: '/duyenso',
        short: 'Tình Duyên',
        desc: 'So duyên hai người, xem hợp hay không hợp.',
        npcs: [
            {
                initial: 'D',
                name: 'Thầy Duyên Khởi',
                line: 'Duyên đến hay chưa, cứ đưa hai lá số ta xem.'
            }
        ]
    },
    {
        id: 'xinque',
        title: 'Quầy Xin Quẻ',
        path: '/xinque',
        short: 'Xin Quẻ',
        desc: 'Gieo quẻ, hỏi một việc đang băn khoăn.',
        npcs: [
            {
                initial: 'Q',
                name: 'Thầy Quẻ Cát',
                line: 'Lòng thành thì quẻ ứng — mời con gieo một quẻ.'
            }
        ]
    },
    {
        id: 'tuvan',
        title: 'Phòng Hỏi Thầy',
        path: '/tuvan',
        short: 'Hỏi Thầy',
        desc: 'Đặt câu hỏi riêng, được hai thầy luận giải.',
        npcs: [
            {
                initial: 'H',
                name: 'Thầy Huyền Cơ Bát Tự',
                line: '35 năm kinh nghiệm, nhân văn, uyên bác.'
            },
            {
                initial: 'M',
                name: 'Thầy Mệnh Mèo GenZ',
                line: 'Hài hước, cực viral, chuyên gia pressing vận mệnh.'
            }
        ]
    }
];

const CourtyardMark = () => (
    <svg
        className="chua-yard-svg"
        viewBox="0 0 220 220"
        role="img"
        aria-label="Sân chùa ở giữa bản đồ"
    >
        <circle className="chua-yard-halo" cx="110" cy="110" r="104" />
        <circle className="chua-yard-ring" cx="110" cy="110" r="88" />
        <path className="chua-yard-line" d="M34 164 H186" />
        <path className="chua-yard-line" d="M52 178 H168" />
        <path className="chua-yard-roof" d="M36 96 L110 56 L184 96" />
        <path className="chua-yard-eave" d="M46 94 Q110 112 174 94" />
        <path className="chua-yard-body" d="M70 120 V96 H150 V120" />
        <path className="chua-yard-body" d="M70 120 H150 V160 H70 Z" />
        <path className="chua-yard-door" d="M98 160 V130 Q110 120 122 130 V160" />
        <path className="chua-yard-line" d="M70 140 H92 M128 140 H150" />
        <circle className="chua-yard-lamp" cx="62" cy="150" r="5" />
        <circle className="chua-yard-lamp" cx="158" cy="150" r="5" />
        <path className="chua-yard-line" d="M62 145 V130 M158 145 V130" />
        <text className="chua-yard-text" x="110" y="202" textAnchor="middle">
            SÂN CHÙA
        </text>
    </svg>
);

const ChuaPage = () => {
    return (
        <div className="chua-page fade-in">
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
                    {STALLS.map(stall => (
                        <Link key={stall.id} to={stall.path} className="chua-quick-link">
                            {stall.short}
                        </Link>
                    ))}
                </div>
            </nav>

            <div className="chua-map">
                <div className="chua-courtyard" aria-hidden="true">
                    <CourtyardMark />
                </div>

                {STALLS.map(stall => (
                    <article
                        key={stall.id}
                        className={`chua-stall glass-card chua-stall--${stall.id}`}
                    >
                        <div className="chua-stall-head">
                            <h2 className="chua-stall-title">{stall.title}</h2>
                            <span className="chua-stall-dot" aria-hidden="true" />
                        </div>
                        <p className="chua-stall-desc">{stall.desc}</p>

                        <div className="chua-npc-list">
                            {stall.npcs.map(npc => (
                                <div className="chua-npc" key={npc.name}>
                                    <span className="chua-npc-avatar" aria-hidden="true">
                                        {npc.initial}
                                    </span>
                                    <div className="chua-npc-body">
                                        <span className="chua-npc-name">{npc.name}</span>
                                        <span className="chua-npc-line">{npc.line}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link to={stall.path} className="chua-stall-btn">
                            Vào xem
                        </Link>
                    </article>
                ))}
            </div>

            <p className="chua-login-note">
                Đăng nhập để lưu hồ sơ, lần sau khỏi gõ lại — sắp có.
            </p>
        </div>
    );
};

export default ChuaPage;
