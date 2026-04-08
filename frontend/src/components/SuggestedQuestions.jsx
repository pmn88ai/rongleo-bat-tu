import React, { useState } from 'react';
import { apiClient } from '../services/apiClient';

// Gợi ý mặc định — không cần đăng nhập
const defaultSuggestions = [
    { text: "Năm nay tôi có cơ hội thăng tiến trong sự nghiệp không?", persona: "huyen_co" },
    { text: "Tình duyên của tôi trong năm này sẽ như thế nào?", persona: "huyen_co" },
    { text: "Hướng nhà nào tốt nhất cho tôi để an cư lập nghiệp?", persona: "huyen_co" },
    { text: "Vận mệnh tài chính của tôi năm nay có khởi sắc không?", persona: "huyen_co" }
];

const SuggestedQuestions = () => {
    const suggestions = defaultSuggestions;
    const [processing, setProcessing] = useState(false);

    const handleSuggestClick = async (questionText, persona) => {
        // Kiểm tra đã có bazi_params trong sessionStorage chưa
        const savedParams = sessionStorage.getItem('bazi_params');
        if (!savedParams) {
            alert('Vui lòng nhập thông tin ngày sinh trước khi sử dụng gợi ý.');
            return;
        }

        setProcessing(true);
        try {
            const params = JSON.parse(savedParams);
            const result = await apiClient.analyze(params);

            if (result) {
                sessionStorage.setItem('bazi_data', JSON.stringify(result));
                localStorage.setItem('pending_question', JSON.stringify({
                    text: questionText,
                    persona: persona,
                    timestamp: Date.now()
                }));
                window.location.href = '/tuvan';
            }
        } catch (err) {
            console.error('Failed to analyze:', err);
            alert('Không thể phân tích lá số. Vui lòng thử lại.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="suggested-questions-widget glass-card">
            <h3 className="widget-title">
                <span className="sparkle">✨</span> Gợi ý dành cho bạn
            </h3>
            <p className="widget-desc">Những câu hỏi phổ biến từ Thầy Huyền Cơ</p>

            {processing && (
                <div className="suggestions-loader">Đang phân tích lá số...</div>
            )}

            <div className="suggestions-grid">
                {suggestions.map((suggestion, idx) => (
                    <div
                        key={idx}
                        className={`suggestion-item-card hover-lift ${processing ? 'disabled' : ''}`}
                        onClick={() => !processing && handleSuggestClick(suggestion.text, suggestion.persona)}
                    >
                        <div className="suggestion-icon">🏮</div>
                        <div className="suggestion-body">
                            <p className="suggestion-text">{suggestion.text}</p>
                            <span className="suggestion-meta">
                                Từ Thầy {suggestion.persona === 'menh_meo' ? 'Mệnh Mèo' : 'Huyền Cơ'}
                            </span>
                        </div>
                        <div className="suggestion-arrow">→</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestedQuestions;
