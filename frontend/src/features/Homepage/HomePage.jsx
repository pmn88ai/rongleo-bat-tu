import React from 'react';
import { Link } from 'react-router-dom';
import { useMenhProfile } from '../../context/MenhProfileContext';

const HomePage = () => {
    const { hasProfile } = useMenhProfile();

    return (
        <div className="home-doors fade-in">
            <header className="home-doors-header">
                <span className="home-doors-kicker">RongLeo</span>
                <h1 className="home-doors-title">MỆNH LÝ AI</h1>
                <p className="home-doors-subtitle">Chọn một lối vào — đi dạo chùa, hoặc tra cứu theo hồ sơ mệnh.</p>
            </header>

            <div className="home-doors-grid">
                <Link to="/chua" className="home-door home-door--temple">
                    <span className="home-door-media" aria-hidden="true" />
                    <span className="home-door-body">
                        <span className="home-door-step">Cửa 1</span>
                        <span className="home-door-title">Đi dạo chùa</span>
                        <span className="home-door-desc">
                            Vào thẳng sân chùa: chánh điện, vườn tịnh tâm, nhạc thiền và các quầy.
                            Không cần nhập gì.
                        </span>
                        <span className="home-door-cta">Vào chùa →</span>
                    </span>
                </Link>

                <Link
                    to={hasProfile ? '/tra-cuu' : '/ho-so-menh'}
                    className="home-door home-door--lookup"
                >
                    <span className="home-door-media" aria-hidden="true" />
                    <span className="home-door-body">
                        <span className="home-door-step">Cửa 2</span>
                        <span className="home-door-title">Tra cứu &amp; Xin quẻ</span>
                        <span className="home-door-desc">
                            Nhập hồ sơ mệnh một lần, dùng chung cho lá số, xem ngày, duyên số,
                            tử vi, gieo quẻ và mọi mục tra cứu.
                        </span>
                        <span className="home-door-cta">
                            {hasProfile ? 'Vào tra cứu →' : 'Nhập hồ sơ mệnh →'}
                        </span>
                    </span>
                </Link>
            </div>

            <p className="home-doors-note">
                {hasProfile
                    ? 'Hồ sơ mệnh đã có — mọi mục tra cứu sẽ dùng chung, không phải nhập lại.'
                    : 'Khách vãng lai vẫn dùng được ngay; hồ sơ được lưu trên máy này.'}
            </p>
        </div>
    );
};

export default HomePage;
