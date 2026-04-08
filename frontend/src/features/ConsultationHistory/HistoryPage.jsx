import React from 'react';
import { useNavigate } from 'react-router-dom';
import ConsultationHistoryContainer from './ConsultationHistoryContainer';

const HistoryPage = () => {
    const navigate = useNavigate();

    return (
        <div className="history-page fade-in">
            <div className="page-header glass-card">
                <div className="header-info">
                    <h2 className="mystical-welcome-text">NHẬT KÝ HUYỀN CƠ</h2>
                    <p>Lưu giữ những lời khuyên và phân tích duyên số của bạn</p>
                </div>
            </div>

            <div className="history-container-wrapper glass-card">
                <ConsultationHistoryContainer onBack={() => navigate(-1)} />
            </div>
        </div>
    );
};

export default HistoryPage;
