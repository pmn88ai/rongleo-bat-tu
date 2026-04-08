import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { getUserId } from '../utils/getUserId';

const ComprehensiveInterpretation = ({ data }) => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [selectedPersona, setSelectedPersona] = useState('huyen_co');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [followUpQuestions, setFollowUpQuestions] = useState([]);
    const [error, setError] = useState(null);
    const [showFAB, setShowFAB] = useState(false);
    const [fabMode, setFabMode] = useState('interpret');

    // Toggle FAB mode every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setFabMode(prev => prev === 'interpret' ? 'consult' : 'interpret');
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Monitor scroll for Floating Action Button
    useEffect(() => {
        const handleScroll = (e) => {
            const scrollY = e.target === window ? window.scrollY : e.target.scrollTop;
            setShowFAB(scrollY > 400);
        };
        const scrollContainer = document.querySelector('.mobile-content') || window;
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    const personas = [
        {
            id: 'huyen_co',
            name: 'Thầy Huyền Cơ Bát Tự',
            icon: '🧙‍♂️',
            desc: 'Phong cách cổ kính, uyên thâm, đầy chiêm nghiệm Đông phương.',
            style: 'Trang trọng, dẫn dắt từ triết lý, trích dẫn kinh điển.'
        },
        {
            id: 'menh_meo',
            name: 'Thầy Mệnh Mèo GenZ',
            icon: '🐱',
            desc: 'Hài hước, gần gũi, dùng ngôn ngữ Gen Z để giải thích.',
            style: 'Vui vẻ, dùng từ lóng, ví von đời thường, nhiều emoji.'
        }
    ];

    // Progress steps for loading animation
    const [progressStep, setProgressStep] = useState(0);
    const progressSteps = [
        { icon: '🔮', text: 'Đang đọc Tứ Trụ của bạn...' },
        { icon: '📊', text: 'Phân tích Ngũ Hành và Thập Thần...' },
        { icon: '⭐', text: 'Tra cứu Thần Sát quan trọng...' },
        { icon: '📅', text: 'Tính toán vận hạn theo thời gian...' },
        { icon: '✍️', text: 'Thầy đang viết luận giải cho bạn...' },
        { icon: '🎯', text: 'Đang hoàn thiện gợi ý và lời khuyên...' }
    ];

    useEffect(() => {
        if (!loading) { setProgressStep(0); return; }
        const interval = setInterval(() => {
            setProgressStep(prev => (prev + 1) % progressSteps.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [loading]);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${API_CONFIG.CONSULTANT}/comprehensive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId()
                },
                body: JSON.stringify({
                    chartData: data,
                    persona: selectedPersona
                })
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Có lỗi xảy ra');
            }

            setResult(responseData.interpretation);
            setFollowUpQuestions(responseData.followUpQuestions || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const currentPersona = personas.find(p => p.id === selectedPersona);

    return (
        <>
            <button
                className="chart-action-btn premium-pulse"
                onClick={() => setShowModal(true)}
                disabled={!data}
            >
                🔮 Luận giải
            </button>

            {/* Mobile Sticky Header Bar */}
            {createPortal(
                <div className={`sticky-action-header mobile-only ${showFAB && !showModal ? 'visible' : ''}`}>
                    <button
                        className={`sticky-action-btn ${!showModal && fabMode === 'consult' ? 'consult-mode' : ''}`}
                        onClick={() => {
                            if (fabMode === 'consult') {
                                navigate('/tuvan');
                            } else {
                                setShowModal(true);
                            }
                        }}
                        disabled={!data}
                    >
                        <span className="sticky-btn-icon">
                            {fabMode === 'consult' ? '💬' : '🔮'}
                        </span>
                        <span className="sticky-btn-text">
                            {fabMode === 'consult' ? 'Tư vấn' : 'Luận giải'}
                        </span>
                    </button>
                </div>,
                document.body
            )}

            {/* Desktop Floating Button */}
            {createPortal(
                <div className={`desktop-floating-container desktop-only ${showFAB && !showModal ? 'visible' : ''}`}>
                    <button
                        className={`desktop-floating-btn ${!showModal && fabMode === 'consult' ? 'consult-mode' : ''}`}
                        onClick={() => {
                            if (fabMode === 'consult') {
                                navigate('/tuvan');
                            } else {
                                setShowModal(true);
                            }
                        }}
                        disabled={!data}
                    >
                        <span className="floating-btn-icon">
                            {fabMode === 'consult' ? '💬' : '🔮'}
                        </span>
                        <div className="floating-content">
                            <span className="floating-btn-text">
                                {fabMode === 'consult' ? 'Tư vấn chi tiết' : 'Luận giải tổng thể'}
                            </span>
                        </div>
                    </button>
                </div>,
                document.body
            )}

            {showModal && (
                <div className="comprehensive-modal-overlay" onClick={() => !loading && setShowModal(false)}>
                    <div className="comprehensive-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => !loading && setShowModal(false)}>✕</button>

                        {!result ? (
                            loading ? (
                                <div className="loading-progress-view">
                                    <div className="loading-animation">
                                        <div className="loading-icon">{progressSteps[progressStep].icon}</div>
                                        <div className="loading-pulse"></div>
                                    </div>
                                    <h2 className="modal-title">{currentPersona.icon} {currentPersona.name} đang xem lá số...</h2>
                                    <p className="loading-text">{progressSteps[progressStep].text}</p>
                                    <div className="loading-steps">
                                        {progressSteps.map((step, idx) => (
                                            <div
                                                key={idx}
                                                className={`step-dot ${idx <= progressStep ? 'active' : ''} ${idx === progressStep ? 'current' : ''}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="loading-hint">Vui lòng chờ giây lát, Thầy đang dùng linh lực để thấu thị vận mệnh của bạn...</p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="modal-title">🔮 Tổng Hợp Luận Giải Lá Số</h2>
                                    <p className="modal-desc">
                                        Toàn bộ thông tin trong lá số của bạn sẽ được tổng hợp thành một bản luận giải
                                        đầy đủ, chi tiết theo phong cách của Thầy bạn chọn.
                                    </p>

                                    <div className="persona-selection">
                                        <h3>Chọn phong cách Thầy:</h3>
                                        <div className="persona-options">
                                            {personas.map(p => (
                                                <div
                                                    key={p.id}
                                                    className={`persona-option ${selectedPersona === p.id ? 'active' : ''}`}
                                                    onClick={() => setSelectedPersona(p.id)}
                                                >
                                                    <div className="persona-icon">{p.icon}</div>
                                                    <div className="persona-details">
                                                        <h4>{p.name}</h4>
                                                        <p>{p.desc}</p>
                                                    </div>
                                                    {selectedPersona === p.id && <div className="check-mark">✓</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {error && <div className="error-message">⚠️ {error}</div>}

                                    <div className="modal-actions">
                                        <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                            Hủy
                                        </button>
                                        <button
                                            className="btn-generate"
                                            onClick={handleGenerate}
                                            disabled={loading}
                                        >
                                            {currentPersona.icon} Xin {currentPersona.name} Luận Giải
                                        </button>
                                    </div>
                                </>
                            )
                        ) : (
                            <div className="result-view">
                                <h2 className="modal-title">{currentPersona.icon} Luận Giải Từ {currentPersona.name}</h2>
                                <div className="result-content">
                                    {result.split('\n').map((para, idx) => {
                                        const trimmed = para.trim();
                                        if (!trimmed) return null;

                                        const renderContent = (text) => {
                                            if (!text) return '';
                                            const parts = text.split(/(\*\*.*?\*\*)/g);
                                            return parts.map((part, i) => {
                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                                                }
                                                return part;
                                            });
                                        };

                                        if (/^[-=_]{2,}$/.test(trimmed)) return null;

                                        const isHeading = trimmed.startsWith('**') ||
                                            trimmed.startsWith('#') ||
                                            /^\d+\.\s*[A-ZÀ-Ỹ]/.test(trimmed) ||
                                            /^\*\*\d+\./.test(trimmed);

                                        const cleanText = trimmed
                                            .replace(/^\*\*|\*\*$/g, '')
                                            .replace(/^#+\s*/, '')
                                            .replace(/\*\*/g, '');

                                        const handleQuestionClick = (q) => {
                                            const cleanQ = q.replace(/^\d+\.\s*/, '').replace(/^✨|🔹\s*/, '').trim();
                                            setShowModal(false);
                                            navigate('/tuvan', {
                                                state: { prefilledQuestion: cleanQ, fromComprehensive: true }
                                            });
                                        };

                                        const looksLikeQuestion = (trimmed.endsWith('?') && trimmed.length < 150) ||
                                            /^\d+\./.test(trimmed) && trimmed.includes('?');

                                        if (looksLikeQuestion) {
                                            return (
                                                <button key={idx} className="inline-question-btn" onClick={() => handleQuestionClick(trimmed)}>
                                                    <span className="icon">❓</span>
                                                    <span className="text">{renderContent(trimmed.replace(/^\d+\.\s*/, ''))}</span>
                                                </button>
                                            );
                                        }

                                        if (isHeading) {
                                            return (
                                                <div key={idx} className="section-heading">✨ {cleanText}</div>
                                            );
                                        }

                                        if ((trimmed.startsWith('-') || trimmed.startsWith('•')) && trimmed.length > 2) {
                                            const listContent = trimmed.replace(/^[-•]\s*/, '').trim();
                                            if (listContent && listContent !== '-' && listContent !== '--') {
                                                if (listContent.endsWith('?')) {
                                                    return (
                                                        <button key={idx} className="inline-question-btn list-variant" onClick={() => handleQuestionClick(listContent)}>
                                                            <span className="icon">🔹</span>
                                                            <span className="text">{renderContent(listContent)}</span>
                                                        </button>
                                                    );
                                                }
                                                return <div key={idx} className="list-item">🔹 {renderContent(listContent)}</div>;
                                            }
                                            return null;
                                        }

                                        return <p key={idx}>{renderContent(para)}</p>;
                                    })}
                                </div>

                                {followUpQuestions.length > 0 && (
                                    <div className="follow-up-section">
                                        <h4 className="follow-up-title">
                                            💡 {currentPersona.icon} Gợi ý câu hỏi tiếp theo:
                                        </h4>
                                        <div className="follow-up-items">
                                            {followUpQuestions.map((q, qidx) => (
                                                <button
                                                    key={qidx}
                                                    className="follow-up-btn"
                                                    onClick={() => {
                                                        setShowModal(false);
                                                        navigate('/tuvan', {
                                                            state: { prefilledQuestion: q, fromComprehensive: true }
                                                        });
                                                    }}
                                                >
                                                    <span className="question-text">✨ {q}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => { setResult(null); setFollowUpQuestions([]); setShowModal(false); }}>
                                        Đóng
                                    </button>
                                    <button className="btn-generate" onClick={() => { setResult(null); setFollowUpQuestions([]); }}>
                                        🔄 Tạo lại
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ComprehensiveInterpretation;
