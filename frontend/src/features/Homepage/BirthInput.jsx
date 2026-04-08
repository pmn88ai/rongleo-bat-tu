import React, { useState, useEffect } from 'react';
import QuickDivination from './QuickDivination';
import DatePicker from './DatePicker';
import Toast from '../../components/Toast';
import RecentCustomers from '../../components/RecentCustomers';
import SuggestedQuestions from '../../components/SuggestedQuestions';
import SampleShowcase from '../../components/SampleShowcase';
import ArticlesSection from '../../components/ArticlesSection';

const BirthInput = ({ onAnalyze, loading }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState(() => {
        const savedForm = sessionStorage.getItem('homepage_form_data');
        if (savedForm) {
            try { return JSON.parse(savedForm); } catch (e) {}
        }
        return { name: '', gender: 'Nam', year: 1990, month: 6, day: 15, hour: 10, minute: 0, calendar: 'solar' };
    });

    useEffect(() => {
        sessionStorage.setItem('homepage_form_data', JSON.stringify(formData));
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = name === 'hour' ? (parseInt(value) || 0) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleDatePickerChange = (date) => {
        setFormData(prev => ({ ...prev, year: date.year, month: date.month, day: date.day }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.year || !formData.month || !formData.day) {
            setToast({ message: 'Vui lòng chọn ngày sinh.', type: 'warning' });
            return;
        }
        onAnalyze(formData);
    };

    const formatSelectedDate = () => {
        const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const date = new Date(formData.year, formData.month - 1, formData.day);
        return `${weekdays[date.getDay()]}, ${formData.day}/${formData.month}/${formData.year}`;
    };

    return (
        <div className="input-form-container fade-in">
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            <header className="branding-header">
                <h2 className="brand-title">MỆNH LÝ AI</h2>
                <p className="brand-tagline">Bát Tự • Tứ Trụ • Luận Giải Chuyên Sâu</p>
            </header>

            <form onSubmit={handleSubmit} className="modular-form glass-card">
                <div className="form-grid">
                    <div className="input-group full-width">
                        <label>Họ và Tên</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nhập tên của bạn..."
                            className="glass-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Giới tính</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="glass-input">
                            <option value="Nam">Nam Mệnh</option>
                            <option value="Nữ">Nữ Mệnh</option>
                        </select>
                    </div>

                    <div className="input-group date-picker-trigger-group" style={{ gridColumn: 'span 2' }}>
                        <label>Ngày sinh (Dương lịch)</label>
                        <button
                            type="button"
                            className="glass-input date-picker-trigger"
                            onClick={() => setShowDatePicker(true)}
                        >
                            📅 {formatSelectedDate()}
                        </button>
                        {showDatePicker && (
                            <DatePicker
                                value={formData}
                                onChange={handleDatePickerChange}
                                onClose={() => setShowDatePicker(false)}
                            />
                        )}
                    </div>

                    <div className="input-group tooltip-wrapper full-width">
                        <label>Giờ sinh</label>
                        <select name="hour" value={formData.hour} onChange={handleChange} className="glass-input">
                            <option value={0}>Tý (子) • 23:00 - 01:00</option>
                            <option value={1}>Sửu (丑) • 01:00 - 03:00</option>
                            <option value={3}>Dần (寅) • 03:00 - 05:00</option>
                            <option value={5}>Mão (卯) • 05:00 - 07:00</option>
                            <option value={7}>Thìn (辰) • 07:00 - 09:00</option>
                            <option value={9}>Tỵ (巳) • 09:00 - 11:00</option>
                            <option value={11}>Ngọ (午) • 11:00 - 13:00</option>
                            <option value={13}>Mùi (未) • 13:00 - 15:00</option>
                            <option value={15}>Thân (申) • 15:00 - 17:00</option>
                            <option value={17}>Dậu (酉) • 17:00 - 19:00</option>
                            <option value={19}>Tuất (戌) • 19:00 - 21:00</option>
                            <option value={21}>Hợi (亥) • 21:00 - 23:00</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className={`premium-button start-button ${loading ? 'is-loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? (
                        <><span className="btn-spinner">⏳</span> ĐANG PHÂN TÍCH LÁ SỐ...</>
                    ) : 'XEM LÁ SỐ NGAY'}
                </button>
            </form>

            <QuickDivination />

            <SuggestedQuestions />

            <SampleShowcase />

            <ArticlesSection />

            <RecentCustomers />
        </div>
    );
};

export default BirthInput;
