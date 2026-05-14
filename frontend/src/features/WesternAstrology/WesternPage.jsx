import React from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Element Name Mapping (Vietnamese + Icon) ───────────────────────────────

const ELEMENT_META = {
    Fire:  { icon: '🔥', labelVN: 'Lửa' },
    Earth: { icon: '🌍', labelVN: 'Đất' },
    Air:   { icon: '💨', labelVN: 'Khí' },
    Water: { icon: '🌊', labelVN: 'Nước' },
};

// ─── Element Bar Component ───────────────────────────────────────────────────

const ElementBar = ({ element, count, total }) => {
    const meta = ELEMENT_META[element] || { icon: '❓', labelVN: element };
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="element-bar-row">
            <span className="element-bar-label">
                {meta.icon} {meta.labelVN} ({element})
            </span>
            <div className="element-bar-track">
                <div
                    className="element-bar-fill"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="element-bar-count">{count}/{total}</span>
        </div>
    );
};

// ─── Empty State ─────────────────────────────────────────────────────────────

const NoDataMessage = () => {
    const navigate = useNavigate();
    return (
        <div className="tab-pane fade-in">
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                <h3>Chưa có dữ liệu</h3>
                <p style={{ color: '#8892b0', margin: '1rem 0' }}>
                    Vui lòng nhập ngày sinh để xem Tử Vi Phương Tây.
                </p>
                <button
                    className="premium-button"
                    onClick={() => navigate('/')}
                >
                    NHẬP NGÀY SINH
                </button>
            </div>
        </div>
    );
};

// ─── Main Page Component ─────────────────────────────────────────────────────

const WesternPage = ({ userData }) => {
    // userData = inputParams from useBaziApi
    const hasInput = userData && userData.year && userData.month && userData.day;

    if (!hasInput) {
        return <NoDataMessage />;
    }

    // We need the API data. If the user has already run analysis, the data will
    // be in sessionStorage (restored by useBaziApi on mount). If not, we show
    // a prompt to analyze first.
    //
    // Use sessionStorage directly since WesternPage may mount before useBaziApi restores.
    // This avoids needing the full `data` prop from App.jsx.
    const rawData = (() => {
        try {
            return JSON.parse(sessionStorage.getItem('bazi_data') || 'null');
        } catch { return null; }
    })();

    const western = rawData?.western_astrology;
    const hasWestern = western && western.sun_sign;

    if (!hasWestern) {
        return (
            <div className="tab-pane fade-in">
                <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <h3>Tử Vi Phương Tây</h3>
                    <p style={{ color: '#8892b0', margin: '1rem 0' }}>
                        Vui lòng xem lá số Bát Tự trước, sau đó quay lại trang này.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#6b7394' }}>
                        Dữ liệu Tử Vi Tây được lấy từ kết quả phân tích Bát Tự.
                    </p>
                </div>
            </div>
        );
    }

    const sun = western.sun_sign;
    const moon = western.moon_sign;
    const elements = western.elements || [];
    const summary = western.summary || {};
    const totalElementCount = elements.reduce((s, e) => s + e.count, 0);

    // Personality
    const personality = sun.personality;
    const moonConfidence = moon?._confidence === 'low';

    return (
        <div className="tab-pane fade-in western-page">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="western-header glass-card">
                <h2>⭐ Tử Vi Phương Tây</h2>
                <p className="western-subtitle">
                    Đối chiếu Sun/Moon/Rising với nền tảng Bát Tự để hiểu thêm xu hướng tính cách.
                </p>
                <p className="western-disclaimer">
                    ⚠️ Kết quả chỉ mang tính tham khảo. Moon sign đang dùng thuật toán gần đúng;
                    Rising sign cần nơi sinh để tính chính xác.
                </p>
            </div>

            {/* ── Card 1: Ba Ngôi Sao Chính ──────────────────────────────── */}
            <div className="glass-card western-section">
                <h3 className="western-section-title">✨ Ba ngôi sao chính</h3>
                <div className="western-three-stars">
                    {/* Sun */}
                    <div className="western-star-card">
                        <div className="western-star-icon">{sun.symbol}</div>
                        <div className="western-star-name">{sun.nameVN} ({sun.name})</div>
                        <div className="western-star-role">Mặt Trời</div>
                        <div className="western-star-element">Nguyên tố: {sun.element}</div>
                    </div>

                    {/* Moon */}
                    <div className="western-star-card">
                        <div className="western-star-icon">{moon?.symbol || '🌙'}</div>
                        <div className="western-star-name">{moon?.nameVN || moon?.name || '—'}</div>
                        <div className="western-star-role">Mặt Trăng</div>
                        <div className="western-star-element">Nguyên tố: {moon?.element || '—'}</div>
                        {moonConfidence && (
                            <div className="western-star-note">⚠️ Gần đúng</div>
                        )}
                    </div>

                    {/* Rising */}
                    <div className="western-star-card">
                        <div className="western-star-icon">🌅</div>
                        <div className="western-star-name">—</div>
                        <div className="western-star-role">Thăng (Rising)</div>
                        <div className="western-star-note">
                            Cần nơi sinh để tính chính xác
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Card 2: Nguyên Tố Nổi Bật ──────────────────────────────── */}
            <div className="glass-card western-section">
                <h3 className="western-section-title">🔥 Nguyên tố nổi bật</h3>
                {elements.length > 0 ? (
                    <div className="western-elements">
                        {elements.map((el) => (
                            <ElementBar
                                key={el.element}
                                element={el.element}
                                count={el.count}
                                total={totalElementCount}
                            />
                        ))}
                        <p className="western-element-note">
                            Dựa trên Mặt Trời + Mặt Trăng. Phân bố này chỉ mang tính chất tham khảo nhanh.
                        </p>
                    </div>
                ) : (
                    <p style={{ color: '#8892b0' }}>Chưa có dữ liệu nguyên tố.</p>
                )}
            </div>

            {/* ── Card 3: Gợi Ý Tính Cách ────────────────────────────────── */}
            <div className="glass-card western-section">
                <h3 className="western-section-title">💡 Gợi ý tính cách</h3>

                {personality ? (
                    <>
                        {/* Traits */}
                        <div className="western-traits-block">
                            <h4>Đặc điểm chính</h4>
                            <div className="western-trait-tags">
                                {(personality.traitsVN || personality.traits || []).map((t, i) => (
                                    <span key={i} className="western-tag">{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Communication */}
                        <div className="western-traits-block">
                            <h4>Phong cách giao tiếp</h4>
                            <p>{personality.communicationVN || personality.communication}</p>
                        </div>

                        {/* Emotion */}
                        <div className="western-traits-block">
                            <h4>Xu hướng cảm xúc</h4>
                            <p>{personality.emotionVN || personality.emotion}</p>
                        </div>
                    </>
                ) : null}

                {/* Summary from backend */}
                {summary.textVN || summary.text ? (
                    <div className="western-traits-block">
                        <h4>Tổng quan</h4>
                        <p>{summary.textVN || summary.text}</p>
                    </div>
                ) : null}

                {/* Confidence warning */}
                <div className="western-warning">
                    <strong>⚠️ Lưu ý:</strong>{' '}
                    Moon sign hiện dùng thuật toán gần đúng (±1 cung), chỉ nên xem tham khảo.
                    Rising sign chưa được tính do thiếu thông tin nơi sinh.
                </div>
            </div>
        </div>
    );
};

export default WesternPage;
