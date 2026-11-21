import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PersonalizedDate from './PersonalizedDate';
import AuspiciousDatePicker from './AuspiciousDatePicker';
import NpcMemory from '../chua/NpcMemory';
import './XemNgayPage.css';

const MODES = [
    {
        id: 'check',
        label: 'Kiểm ngày',
        icon: '🔍',
        desc: 'Nhập một ngày để xem tốt/xấu theo mệnh chủ.'
    },
    {
        id: 'find',
        label: 'Tìm ngày tốt',
        icon: '🗓️',
        desc: 'Lọc ngày lành, giờ tốt trong khoảng thời gian.'
    }
];

const XemNgayPage = ({ data, userData }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const mode = searchParams.get('mode') === 'find' ? 'find' : 'check';
    const activeMode = MODES.find((item) => item.id === mode);

    const changeMode = (nextMode) => {
        if (nextMode === mode) return;
        setSearchParams(nextMode === 'find' ? { mode: 'find' } : {}, { replace: true });
    };

    return (
        <div className="xemngay-page fade-in">
            <header className="xemngay-header glass-card">
                <div className="xemngay-heading">
                    <h2 className="xemngay-title">📅 Quầy Xem Ngày</h2>
                    <p className="xemngay-subtitle">{activeMode.desc}</p>
                </div>
                <div className="xemngay-mode-switch" role="tablist" aria-label="Chế độ xem ngày">
                    {MODES.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={mode === item.id}
                            className={`xemngay-mode-btn ${mode === item.id ? 'active' : ''}`}
                            onClick={() => changeMode(item.id)}
                        >
                            <span aria-hidden="true">{item.icon}</span> {item.label}
                        </button>
                    ))}
                </div>
            </header>

            <NpcMemory npcId="hoang_dao" />

            <div className="xemngay-body">
                {mode === 'find' ? (
                    <AuspiciousDatePicker userData={userData} hideTitle={true} />
                ) : (
                    <PersonalizedDate data={data} userData={userData} />
                )}
            </div>
        </div>
    );
};

export default XemNgayPage;
