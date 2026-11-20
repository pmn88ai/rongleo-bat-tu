import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

/**
 * Nút "Luận giải" trong trang /laso.
 * Một cửa luận giải duy nhất: điều hướng sang /tuvan (Phòng Hỏi Thầy).
 * Trang /tuvan dùng chung hồ sơ mệnh (MenhProfileContext) nên không bắt nhập lại.
 */
const ComprehensiveInterpretation = ({ data }) => {
    const navigate = useNavigate();
    const [showFAB, setShowFAB] = useState(false);

    useEffect(() => {
        const handleScroll = (e) => {
            const scrollY = e.target === window ? window.scrollY : e.target.scrollTop;
            setShowFAB(scrollY > 400);
        };
        const scrollContainer = document.querySelector('.mobile-content') || window;
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    const goToConsultant = () => {
        navigate('/tuvan');
    };

    return (
        <>
            <button
                className="chart-action-btn premium-pulse"
                onClick={goToConsultant}
                disabled={!data}
            >
                🔮 Luận giải
            </button>

            {/* Mobile Sticky Header Bar */}
            {createPortal(
                <div className={`sticky-action-header mobile-only ${showFAB ? 'visible' : ''}`}>
                    <button
                        className="sticky-action-btn consult-mode"
                        onClick={goToConsultant}
                        disabled={!data}
                    >
                        <span className="sticky-btn-icon">💬</span>
                        <span className="sticky-btn-text">Tư vấn</span>
                    </button>
                </div>,
                document.body
            )}

            {/* Desktop Floating Button */}
            {createPortal(
                <div className={`desktop-floating-container desktop-only ${showFAB ? 'visible' : ''}`}>
                    <button
                        className="desktop-floating-btn consult-mode"
                        onClick={goToConsultant}
                        disabled={!data}
                    >
                        <span className="floating-btn-icon">💬</span>
                        <div className="floating-content">
                            <span className="floating-btn-text">Tư vấn chi tiết</span>
                        </div>
                    </button>
                </div>,
                document.body
            )}
        </>
    );
};

export default ComprehensiveInterpretation;
