import React, { useMemo, useState } from 'react';
import { Solar, Lunar } from 'lunar-javascript';
import './TuViPage.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

const GIO_CHI_OPTIONS = [
    { value: 'Tý', label: 'Tý (子) • 23:00 - 01:00' },
    { value: 'Sửu', label: 'Sửu (丑) • 01:00 - 03:00' },
    { value: 'Dần', label: 'Dần (寅) • 03:00 - 05:00' },
    { value: 'Mão', label: 'Mão (卯) • 05:00 - 07:00' },
    { value: 'Thìn', label: 'Thìn (辰) • 07:00 - 09:00' },
    { value: 'Tỵ', label: 'Tỵ (巳) • 09:00 - 11:00' },
    { value: 'Ngọ', label: 'Ngọ (午) • 11:00 - 13:00' },
    { value: 'Mùi', label: 'Mùi (未) • 13:00 - 15:00' },
    { value: 'Thân', label: 'Thân (申) • 15:00 - 17:00' },
    { value: 'Dậu', label: 'Dậu (酉) • 17:00 - 19:00' },
    { value: 'Tuất', label: 'Tuất (戌) • 19:00 - 21:00' },
    { value: 'Hợi', label: 'Hợi (亥) • 21:00 - 23:00' }
];

const GAN_CN_TO_VN = {
    '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu',
    '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý'
};

/**
 * Can của năm âm lịch, lấy từ lunar-javascript (không tự đoán).
 */
function canNamFromLunarYear(year) {
    try {
        const lunar = Lunar.fromYmd(Number(year), 1, 1);
        const ganCn = lunar.getYearInGanZhi().charAt(0);
        return GAN_CN_TO_VN[ganCn] || null;
    } catch {
        return null;
    }
}

const TuViPage = () => {
    const [solar, setSolar] = useState({ year: 1990, month: 6, day: 15 });
    const [form, setForm] = useState({
        ngay_am: 23,
        thang_am: 5,
        nam_am: 1990,
        gio_chi: 'Ngọ',
        gioi_tinh: 'Nam'
    });
    const [khongRoGio, setKhongRoGio] = useState(false);
    const [convertNote, setConvertNote] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const canNam = useMemo(() => canNamFromLunarYear(form.nam_am), [form.nam_am]);

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setForm(prev => ({
            ...prev,
            [field]: field === 'gio_chi' || field === 'gioi_tinh' ? value : Number(value)
        }));
    };

    const handleSolarChange = (field) => (event) => {
        setSolar(prev => ({ ...prev, [field]: Number(event.target.value) }));
    };

    const handleConvert = () => {
        setError(null);
        setConvertNote(null);
        try {
            const lunar = Solar.fromYmd(solar.year, solar.month, solar.day).getLunar();
            const month = lunar.getMonth();
            const isLeap = month < 0;
            const next = {
                ngay_am: lunar.getDay(),
                thang_am: Math.abs(month),
                nam_am: lunar.getYear(),
                gio_chi: form.gio_chi,
                gioi_tinh: form.gioi_tinh
            };
            setForm(next);
            setResult(null);

            const can = canNamFromLunarYear(next.nam_am);
            let note = `Đã đổi ${String(solar.day).padStart(2, '0')}/${String(solar.month).padStart(2, '0')}/${solar.year} dương → ${next.ngay_am}/${next.thang_am}/${next.nam_am} âm (Can năm: ${can || 'chưa xác định được'}).`;
            if (isLeap) {
                note += ' Ngày này rơi vào THÁNG NHUẬN — bộ ca kiểm định chưa có tháng nhuận nên lá số chưa được kiểm chứng.';
            }
            setConvertNote(note);
        } catch {
            setError('Ngày dương không hợp lệ. Vui lòng kiểm tra lại.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (khongRoGio) {
            setError('Cần giờ sinh để an sao — chưa có bảng 12 giờ, vui lòng chọn giờ gần đúng (không tự đoán giờ).');
            return;
        }
        if (!canNam) {
            setError('Chưa xác định được Can năm từ năm âm đã nhập.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const params = new URLSearchParams({
                ngay_am: String(form.ngay_am),
                thang_am: String(form.thang_am),
                gio_chi: form.gio_chi,
                can_nam: canNam,
                gioi_tinh: form.gioi_tinh
            });
            const response = await fetch(`${API_BASE}/api/tu-vi?${params.toString()}`);
            const body = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(body?.error || 'Có lỗi xảy ra khi an sao Tử vi.');
            }
            setResult(body);
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi an sao Tử vi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tuv-page fade-in">
            <header className="tuv-header glass-card">
                <h1 className="tuv-title">🔮 Tử Vi</h1>
                <p className="tuv-subtitle">
                    An sao Tử vi theo ngày âm + giờ Chi + Can năm: Mệnh, Thân, Cục, 14 chính tinh và Tứ Hóa.
                    Đây chỉ là phép tính an sao, không phải luận giải.
                </p>
            </header>

            <form className="tuv-form glass-card" onSubmit={handleSubmit}>
                <div className="tuv-convert">
                    <div className="tuv-convert-fields">
                        <div className="tuv-field">
                            <label>Ngày dương</label>
                            <input type="number" min="1" max="31" className="glass-input" value={solar.day} onChange={handleSolarChange('day')} />
                        </div>
                        <div className="tuv-field">
                            <label>Tháng dương</label>
                            <input type="number" min="1" max="12" className="glass-input" value={solar.month} onChange={handleSolarChange('month')} />
                        </div>
                        <div className="tuv-field">
                            <label>Năm dương</label>
                            <input type="number" min="1900" max="2100" className="glass-input" value={solar.year} onChange={handleSolarChange('year')} />
                        </div>
                        <div className="tuv-field tuv-field-action">
                            <label>&nbsp;</label>
                            <button type="button" className="tuv-convert-btn" onClick={handleConvert}>
                                Đổi từ ngày dương
                            </button>
                        </div>
                    </div>
                    <p className="tuv-hint">
                        Đổi dương → âm bằng lịch Việt Nam. Ngày âm theo lịch Việt Nam có thể lệch 1 ngày so với
                        lịch Trung Hoa ở một số tháng — lá số này chưa kiểm chứng độ lệch đó.
                    </p>
                    {convertNote && <p className="tuv-note">{convertNote}</p>}
                </div>

                <div className="tuv-form-grid">
                    <div className="tuv-field">
                        <label>Ngày âm (1–30)</label>
                        <input type="number" min="1" max="30" className="glass-input" value={form.ngay_am} onChange={handleChange('ngay_am')} />
                    </div>

                    <div className="tuv-field">
                        <label>Tháng âm (1–12)</label>
                        <input type="number" min="1" max="12" className="glass-input" value={form.thang_am} onChange={handleChange('thang_am')} />
                    </div>

                    <div className="tuv-field">
                        <label>Năm âm</label>
                        <input type="number" min="1900" max="2100" className="glass-input" value={form.nam_am} onChange={handleChange('nam_am')} />
                        <span className="tuv-derived">Can năm: <b>{canNam || 'chưa xác định được'}</b> (tính từ năm dương bằng lunar-javascript)</span>
                    </div>

                    <div className="tuv-field">
                        <label>Giờ sinh (Chi)</label>
                        <select className="glass-input" value={form.gio_chi} disabled={khongRoGio} onChange={handleChange('gio_chi')}>
                            {GIO_CHI_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <label className="tuv-checkbox">
                            <input
                                type="checkbox"
                                checked={khongRoGio}
                                onChange={e => setKhongRoGio(e.target.checked)}
                            />
                            Không rõ giờ sinh
                        </label>
                    </div>

                    <div className="tuv-field">
                        <label>Giới tính</label>
                        <select className="glass-input" value={form.gioi_tinh} onChange={handleChange('gioi_tinh')}>
                            <option value="Nam">Nam Mệnh</option>
                            <option value="Nữ">Nữ Mệnh</option>
                        </select>
                        <span className="tuv-derived tuv-derived-muted">
                            Giới tính được nhận nhưng chưa dùng khi an sao (giống nguồn Python).
                        </span>
                    </div>
                </div>

                {khongRoGio && (
                    <p className="tuv-hint tuv-hint-warn">
                        Không có giờ sinh thì không an sao được. Chưa có bảng 12 giờ nên bạn cần chọn giờ gần đúng —
                        hệ thống không tự đoán giờ.
                    </p>
                )}

                <button type="submit" className="premium-button tuv-submit" disabled={loading || khongRoGio}>
                    {loading ? '⏳ Đang an sao...' : 'AN SAO TỬ VI'}
                </button>
            </form>

            {error && <div className="error-toast glass-card tuv-error">⚠️ {error}</div>}

            {result && (
                <div className="tuv-results">
                    <section className="tuv-summary glass-card">
                        <div className="tuv-card-label">
                            <span>Tổng quan lá số</span>
                            <span className="tuv-tag">TÍNH</span>
                        </div>
                        <div className="tuv-summary-grid">
                            <div className="tuv-summary-item">
                                <span>Mệnh</span>
                                <strong>{result.menh.chi}</strong>
                                <em>{result.menh.can_chi} — nạp âm {result.menh.nap_am}</em>
                            </div>
                            <div className="tuv-summary-item">
                                <span>Thân</span>
                                <strong>{result.than.chi}</strong>
                                <em>{result.than.dong_cung ? 'Mệnh Thân đồng cung' : `Can ${result.cung.find(c => c.chi === result.than.chi)?.can || ''} ${result.than.chi}`}</em>
                            </div>
                            <div className="tuv-summary-item">
                                <span>Cục</span>
                                <strong>{result.cuc.so}</strong>
                                <em>{result.cuc.ten}</em>
                            </div>
                            <div className="tuv-summary-item">
                                <span>Tử Vi</span>
                                <strong>{result.tu_vi}</strong>
                                <em>Vị trí sao Tử Vi</em>
                            </div>
                        </div>

                        <div className="tuv-hoa">
                            <span className="tuv-hoa-title">Tứ Hóa năm {result.input.can_nam}</span>
                            <div className="tuv-hoa-list">
                                {Object.entries(result.tu_hoa).map(([hoa, sao]) => (
                                    <span className="tuv-hoa-item" key={hoa}>
                                        <b>{hoa}</b> {sao}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="tuv-board glass-card">
                        <div className="tuv-card-label">
                            <span>12 cung chức năng</span>
                            <span className="tuv-tag">TÍNH</span>
                        </div>
                        <div className="tuv-cung-grid">
                            {result.cung.map((cung) => (
                                <article className={`tuv-cung ${cung.cung === 'Mệnh' ? 'tuv-cung-menh' : ''}`} key={cung.cung}>
                                    <header>
                                        <span className="tuv-cung-name">{cung.cung}</span>
                                        <span className="tuv-cung-chi">{cung.can} {cung.chi}</span>
                                    </header>
                                    {cung.sao.length === 0 ? (
                                        <p className="tuv-cung-empty">—</p>
                                    ) : (
                                        <ul className="tuv-sao-list">
                                            {cung.sao.map((sao) => (
                                                <li key={sao.ten}>
                                                    <span>{sao.ten}</span>
                                                    {sao.tu_hoa && <span className="tuv-hoa-badge">{sao.tu_hoa.replace('Hóa ', '')}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>

                    <div className="glass-card tuv-limits">
                        <h3>Giới hạn</h3>
                        <ul>
                            <li>Chỉ an sao: Mệnh/Thân, Cục, 14 chính tinh, Tứ Hóa. Không luận giải.</li>
                            <li>Chưa có phụ tinh, Tuần/Triệt, độ sáng sao (nguồn Python chưa có).</li>
                            <li>Không lưu hồ sơ; kết quả chỉ dùng trong phiên xem này.</li>
                            <li>Ngày âm theo lịch Việt Nam có thể lệch 1 ngày so với lịch Trung Hoa ở một số tháng — chưa kiểm chứng độ lệch.</li>
                            <li>Chưa có ca tháng nhuận và ca giờ Tý sát ranh giới 23:00.</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TuViPage;
