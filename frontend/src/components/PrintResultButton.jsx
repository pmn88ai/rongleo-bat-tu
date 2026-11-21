import React from 'react';

const PrintResultButton = ({ label = 'In / Lưu PDF', className = '' }) => (
    <button
        type="button"
        className={`print-result-btn ${className}`.trim()}
        onClick={() => window.print()}
        title="In hoặc lưu phần kết quả ra PDF"
    >
        🖨️ {label}
    </button>
);

export default PrintResultButton;
