import React, { useCallback, useEffect, useRef, useState } from 'react';
import DatePicker from '../Homepage/DatePicker';
import VanHomNayShareCard from './VanHomNayShareCard';
import { useMenhProfile } from '../../context/MenhProfileContext';
import './VanHomNayPage.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

const HOUR_OPTIONS = [
    { value: 0, label: 'Tý (子) • 23:00 - 00:59' },
    { value: 1, label: 'Sửu (丑) • 01:00 - 02:59' },
    { value: 3, label: 'Dần (寅) • 03:00 - 04:59' },
    { value: 5, label: 'Mão (卯) • 05:00 - 06:59' },
    { value: 7, label: 'Thìn (辰) • 07:00 - 08:59' },
    { value: 9, label: 'Tỵ (巳) • 09:00 - 10:59' },
    { value: 11, label: 'Ngọ (午) • 11:00 - 12:59' },
    { value: 13, label: 'Mùi (未) • 13:00 - 14:59' },
    { value: 15, label: 'Thân (申) • 15:00 - 16:59' },
    { value: 17, label: 'Dậu (酉) • 17:00 - 18:59' },
    { value: 19, label: 'Tuất (戌) • 19:00 - 20:59' },
    { value: 21, label: 'Hợi (亥) • 21:00 - 22:59' }
];

const LEVEL_CLASS = {
    'thuận': 'vhn-level-good',
    'bình thường': 'vhn-level-neutral',
    'nên tránh việc lớn': 'vhn-level-bad',
    'chưa đủ căn cứ': 'vhn-level-unknown'
};

const formatDate = ({ day, month, year }) => {
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const date = new Date(year, month - 1, day);
    return `${weekdays[date.getDay()]}, ${day}/${month}/${year}`;
};

const VanHomNayPage = () => {
    const { profile } = useMenhProfile();
    const [form, setForm] = useState(() => ({
        year: profile?.year ?? 1990,
        month: profile?.month ?? 6,
        day: profile?.day ?? 15,
        hour: profile?.hour ?? 10,
        gender: profile?.gender || 'Nam',
        khongRoGio: false
    }));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [error, setError] = useState(null);
    const shareCardRef = useRef(null);

    // Hồ sơ mệnh là nguồn chung: tự điền khi có hồ sơ, vẫn cho phép sửa riêng.
    useEffect(() => {
        if (!profile || !profile.year) return;
        setForm(prev => ({
            ...prev,
            year: profile.year,
            month: profile.month,
            day: profile.day,
            hour: profile.hour ?? prev.hour,
            gender: profile.gender || prev.gender
        }));
    }, [profile]);

    const handleDateChange = useCallback((date) => {
        setForm(prev => ({ ...prev, year: date.year, month: date.month, day: date.day }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.year || !form.month || !form.day) {
            setError('Vui lòng chọn ngày sinh.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const params = new URLSearchParams({
                ngay_sinh: `${form.year}-${String(form.month).padStart(2, '0')}-${String(form.day).padStart(2, '0')}`,
                gioi_tinh: form.gender
            });
            if (!form.khongRoGio) {
                params.set('gio_sinh', String(form.hour));
            }

            const response = await fetch(`${API_BASE}/api/van-hom-nay?${params.toString()}`);
            const body = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(body?.error || 'Có lỗi xảy ra khi tính vận hôm nay.');
            }
            setResult(body);
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tính vận hôm nay.');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!result || !shareCardRef.current) return;
        setSharing(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(shareCardRef.current, {
                backgroundColor: '#050505',
                scale: 2,
                useCORS: true
            });

            const fileName = `van-hom-nay-${new Date().toISOString().split('T')[0]}.png`;
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

            if (!blob) throw new Error('Không tạo được ảnh chia sẻ.');

            const file = new File([blob], fileName, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Vận hôm nay — RongLeo',
                    text: 'Vận hôm nay của mình — xem miễn phí tại RongLeo.'
                });
            } else {
                const link = document.createElement('a');
                link.download = fileName;
                link.href = URL.createObjectURL(blob);
                link.click();
                setTimeout(() => URL.revokeObjectURL(link.href), 2000);
            }
        } catch (err) {
            if (err?.name !== 'AbortError') {
                console.error('Share error:', err);
                setError('Không thể tạo ảnh chia sẻ. Vui lòng thử lại.');
            }
        } finally {
            setSharing(false);
        }
    };

    const canChi = result?.ket_qua?.[0]?.noi_dung;
    const thanSo = result?.ket_qua?.[1]?.noi_dung;
    const doiChieu = result?.ket_qua?.[2]?.noi_dung;
    const loiNhan = result?.ket_qua?.[3]?.noi_dung;

    return (
        <div className="vhn-page fade-in">
            <header className="vhn-header glass-card">
                <h1 className="vhn-title">☀️ Vận Hôm Nay</h1>
                <p className="vhn-subtitle">
                    Nhập ngày sinh để xem can chi hôm nay và ngày cá nhân của bạn — miễn phí, không cần đăng nhập.
                </p>
            </header>

            <form className="vhn-form glass-card" onSubmit={handleSubmit}>
                <div className="vhn-form-grid">
                    <div className="vhn-field">
                        <label>Giới tính</label>
                        <select
                            className="glass-input"
                            value={form.gender}
                            onChange={e => setForm(prev => ({ ...prev, gender: e.target.value }))}
                        >
                            <option value="Nam">Nam Mệnh</option>
                            <option value="Nữ">Nữ Mệnh</option>
                        </select>
                    </div>

                    <div className="vhn-field vhn-field-date">
                        <label>Ngày sinh (Dương lịch)</label>
                        <button
                            type="button"
                            className="glass-input vhn-date-trigger"
                            onClick={() => setShowDatePicker(true)}
                        >
                            📅 {formatDate(form)}
                        </button>
                        {showDatePicker && (
                            <DatePicker
                                value={form}
                                onChange={handleDateChange}
                                onClose={() => setShowDatePicker(false)}
                            />
                        )}
                    </div>

                    <div className="vhn-field">
                        <label>Giờ sinh (tùy chọn)</label>
                        <select
                            className="glass-input"
                            value={form.hour}
                            disabled={form.khongRoGio}
                            onChange={e => setForm(prev => ({ ...prev, hour: Number(e.target.value) }))}
                        >
                            {HOUR_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <label className="vhn-checkbox">
                            <input
                                type="checkbox"
                                checked={form.khongRoGio}
                                onChange={e => setForm(prev => ({ ...prev, khongRoGio: e.target.checked }))}
                            />
                            Không rõ giờ sinh
                        </label>
                    </div>
                </div>

                {form.khongRoGio && (
                    <p className="vhn-hint">
                        Không có giờ sinh thì chưa tính phần cần giờ sinh (trụ giờ, đại vận, lưu niên).
                    </p>
                )}

                <button type="submit" className="premium-button vhn-submit" disabled={loading}>
                    {loading ? '⏳ Đang tính...' : 'XEM VẬN HÔM NAY'}
                </button>
            </form>

            {error && <div className="error-toast glass-card vhn-error">⚠️ {error}</div>}

            {result && (
                <div className="vhn-results">
                    <div className="vhn-result-head glass-card">
                        <div>
                            <div className="vhn-result-date">{result.ngay?.thu}, {result.ngay?.duong_lich}</div>
                            <div className="vhn-result-lunar">{result.ngay?.am_lich}</div>
                        </div>
                        <button className="share-btn" onClick={handleShare} disabled={sharing}>
                            {sharing ? '...' : '📤 Chia sẻ thẻ ảnh'}
                        </button>
                    </div>

                    <div className="vhn-grid">
                        <section className="vhn-card glass-card">
                            <div className="vhn-card-label">
                                <span>{result.ket_qua[0].nhan}</span>
                                <span className="vhn-tag">TÍNH</span>
                            </div>
                            <div className="vhn-canchi">{canChi?.can_chi}</div>
                            <p className="vhn-card-note">{result.ket_qua[0].ghi_chu}</p>
                        </section>

                        <section className="vhn-card glass-card">
                            <div className="vhn-card-label">
                                <span>{result.ket_qua[1].nhan}</span>
                                <span className="vhn-tag">TÍNH</span>
                            </div>
                            <div className="vhn-numbers">
                                {[
                                    ['Năm', thanSo?.nam_ca_nhan],
                                    ['Tháng', thanSo?.thang_ca_nhan],
                                    ['Ngày', thanSo?.ngay_ca_nhan]
                                ].map(([label, value]) => (
                                    <div className="vhn-number" key={label}>
                                        <span>{label}</span>
                                        <strong>{value}</strong>
                                    </div>
                                ))}
                            </div>
                            <p className="vhn-card-note">{result.ket_qua[1].ghi_chu}</p>
                        </section>

                        <section className="vhn-card glass-card vhn-card-wide">
                            <div className="vhn-card-label">
                                <span>{result.ket_qua[2].nhan}</span>
                                <span className="vhn-tag vhn-tag-model">MÔ HÌNH TẦNG 1</span>
                            </div>
                            <div className={`vhn-level ${LEVEL_CLASS[doiChieu?.ket_luan] || 'vhn-level-unknown'}`}>
                                {doiChieu?.ket_luan}
                            </div>
                            <div className="vhn-meta">
                                <span>Thập thần can ngày: <b>{doiChieu?.thap_than}</b></span>
                                <span>Ngũ hành ngày: <b>{doiChieu?.ngu_hanh_ngay?.can} / {doiChieu?.ngu_hanh_ngay?.chi}</b></span>
                                <span>Dụng thần: <b>{doiChieu?.dung_than?.length ? doiChieu.dung_than.join(' / ') : 'chưa xác định được'}</b></span>
                            </div>
                            <ul className="vhn-reasons">
                                {(doiChieu?.ly_do || []).map((line, i) => <li key={i}>{line}</li>)}
                            </ul>
                            <p className="vhn-card-note">{result.ket_qua[2].ghi_chu}</p>
                        </section>

                        <section className="vhn-card glass-card vhn-card-wide vhn-message-card">
                            <div className="vhn-card-label">
                                <span>{result.ket_qua[3].nhan}</span>
                                <span className="vhn-tag">MẪU CỐ ĐỊNH</span>
                            </div>
                            <p className="vhn-message">{loiNhan?.cau}</p>
                        </section>
                    </div>

                    <div className="glass-card vhn-limits">
                        <h3>Giới hạn</h3>
                        <ul>
                            {result.gioi_han?.map((line, i) => <li key={i}>{line}</li>)}
                        </ul>
                        <p className="vhn-disclaimer">
                            Thông tin chỉ mang tính định hướng, không thay thế quyết định cá nhân.
                        </p>
                    </div>
                </div>
            )}

            <VanHomNayShareCard ref={shareCardRef} result={result} />
        </div>
    );
};

export default VanHomNayPage;
