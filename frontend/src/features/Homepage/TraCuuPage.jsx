import React from 'react';
import { Link } from 'react-router-dom';
import { ROOM_GROUPS, TEMPLE_LINKS, getRoomsByGroup } from '../../config/rooms';
import { useMenhProfile } from '../../context/MenhProfileContext';

const TraCuuPage = () => {
    const { profile, hasProfile } = useMenhProfile();

    return (
        <div className="tra-cuu-page fade-in">
            <header className="tra-cuu-header glass-card">
                <h2 className="tra-cuu-title">Tra cứu &amp; Xin quẻ</h2>
                {hasProfile ? (
                    <p className="tra-cuu-subtitle">
                        Đang dùng hồ sơ mệnh: <strong>{profile.name || 'Mệnh chủ'}</strong>
                        {' — '}
                        {profile.day}/{profile.month}/{profile.year} · {profile.hour}h · {profile.gender}.
                        {' '}
                        <Link to="/ho-so-menh" className="tra-cuu-edit-link">Sửa hồ sơ</Link>
                    </p>
                ) : (
                    <p className="tra-cuu-subtitle">
                        Chưa có hồ sơ mệnh.{' '}
                        <Link to="/ho-so-menh" className="tra-cuu-edit-link">Nhập một lần</Link>
                        {' '}rồi dùng cho mọi mục bên dưới.
                    </p>
                )}
            </header>

            <div className="tra-cuu-sections" aria-label="Các mục tra cứu">
                {ROOM_GROUPS.map((group) => {
                    const rooms = getRoomsByGroup(group.id);
                    if (rooms.length === 0) return null;
                    return (
                        <section key={group.id} className="tra-cuu-section" aria-label={group.label}>
                            <h3 className="tra-cuu-section-title">
                                <span aria-hidden="true">{group.icon}</span> {group.label}
                            </h3>
                            <div className="tra-cuu-grid">
                                {rooms.map((room) => (
                                    <Link
                                        key={room.id}
                                        to={room.path}
                                        className="tra-cuu-card"
                                        style={{ '--card-accent': room.accent, '--card-glow': room.glow }}
                                    >
                                        <span
                                            className="tra-cuu-card-media"
                                            style={{ backgroundImage: `url(${room.image})` }}
                                            aria-hidden="true"
                                        />
                                        <span className="tra-cuu-card-body">
                                            <span className="tra-cuu-card-title">
                                                <span className="tra-cuu-card-icon" aria-hidden="true">{room.icon}</span>
                                                {room.label}
                                            </span>
                                            <span className="tra-cuu-card-room">{room.title}</span>
                                            <span className="tra-cuu-card-desc">{room.desc}</span>
                                            <span className="tra-cuu-card-cta">Vào →</span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            <section className="tra-cuu-temple glass-card" aria-label="Đi dạo chùa">
                <span className="tra-cuu-temple-label">Đi dạo chùa</span>
                <div className="tra-cuu-temple-links">
                    {TEMPLE_LINKS.map((link) => (
                        <Link key={link.id} to={link.path} className="tra-cuu-temple-link">
                            <span aria-hidden="true">{link.icon}</span> {link.shortLabel}
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default TraCuuPage;
