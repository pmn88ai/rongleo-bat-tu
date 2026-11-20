import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useMenhProfile } from '../../context/MenhProfileContext';
import './ThanSoHocPage.css';

const ThanSoHocPage = () => {
    const { profile } = useMenhProfile();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNumerology = useCallback(async () => {
        if (!profile || !profile.year || !profile.month || !profile.day) return;
        const name = (profile.name || '').trim();
        if (!name) {
            setResult(null);
            setError('Hồ sơ mệnh chưa có họ tên đầy đủ — thần số học cần họ tên để tính các số từ tên.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await apiClient.get('/than-so-hoc', {
                name,
                year: profile.year,
                month: profile.month,
                day: profile.day
            });
            setResult(data);
        } catch (err) {
            setResult(null);
            setError(err.message || 'Không thể tính thần số học.');
        } finally {
            setLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        fetchNumerology();
    }, [fetchNumerology]);

    return (
        <div className="than-so-page fade-in">
            <header className="than-so-hero glass-card">
                <div className="than-so-hero-main">
                    <span className="than-so-kicker">Hệ Pythagore • chuẩn quốc tế</span>
                    <h2 className="than-so-title">🔢 Điện Thần Số</h2>
                    <p className="than-so-subtitle">
                        Tính từ ngày sinh và họ tên trong hồ sơ mệnh — không gọi AI, chỉ công thức và nghĩa tĩnh.
                    </p>
                </div>
                {result && (
                    <div className="than-so-meta">
                        <div className="than-so-meta-row">
                            <span className="than-so-meta-label">Họ tên chuẩn hoá</span>
                            <span className="than-so-meta-value">{result.ho_ten_chuan_hoa || '—'}</span>
                        </div>
                        <div className="than-so-meta-row">
                            <span className="than-so-meta-label">Ngày sinh</span>
                            <span className="than-so-meta-value">
                                {result.ngay_sinh.day}/{result.ngay_sinh.month}/{result.ngay_sinh.year}
                            </span>
                        </div>
                        <div className="than-so-meta-row">
                            <span className="than-so-meta-label">Năm hiện tại</span>
                            <span className="than-so-meta-value">{result.nam_hien_tai}</span>
                        </div>
                    </div>
                )}
            </header>

            {(!profile || !profile.year) && (
                <div className="than-so-message glass-card">
                    <p>Chưa có hồ sơ mệnh. Nhập ngày sinh và họ tên trước khi xem thần số học.</p>
                    <Link to="/ho-so-menh?next=%2Fthan-so-hoc" className="premium-button small">Nhập hồ sơ mệnh</Link>
                </div>
            )}

            {profile && profile.year && !(profile.name || '').trim() && (
                <div className="than-so-message glass-card">
                    <p>Hồ sơ mệnh chưa có họ tên đầy đủ — cần họ tên để tính Số sứ mệnh, Số linh hồn và Số nhân cách.</p>
                    <Link to="/ho-so-menh?next=%2Fthan-so-hoc" className="premium-button small">Bổ sung họ tên</Link>
                </div>
            )}

            {loading && (
                <div className="than-so-state glass-card">
                    <span className="than-so-spinner" aria-hidden="true"></span>
                    <p>Đang tính các con số Pythagore...</p>
                </div>
            )}

            {error && !loading && (
                <div className="than-so-state than-so-state--error glass-card">
                    <p>⚠️ {error}</p>
                    {profile && (profile.name || '').trim() && (
                        <button type="button" className="premium-button small" onClick={fetchNumerology}>Thử lại</button>
                    )}
                </div>
            )}

            {!loading && result && (
                <>
                    <section className="than-so-grid" aria-label="Các con số thần số học">
                        {result.cac_so.map((item) => (
                            <article key={item.key} className="than-so-card glass-card">
                                <div className="than-so-card-head">
                                    <span className="than-so-card-icon" aria-hidden="true">{item.icon}</span>
                                    <span className="than-so-card-name">{item.ten}</span>
                                </div>
                                <div className="than-so-number">{item.so}</div>
                                {item.tieu_de && <h3 className="than-so-card-title">{item.tieu_de}</h3>}
                                <p className="than-so-card-meaning">{item.y_nghia}</p>
                                <p className="than-so-card-formula">{item.cach_tinh}</p>
                            </article>
                        ))}
                    </section>

                    <footer className="than-so-note glass-card">
                        <p><strong>Quy ước hệ:</strong> {result.quy_uoc}</p>
                        <p className="than-so-note-calc">{result.he_thong} — tính toán + nghĩa tĩnh, không gọi AI.</p>
                    </footer>
                </>
            )}
        </div>
    );
};

export default ThanSoHocPage;
