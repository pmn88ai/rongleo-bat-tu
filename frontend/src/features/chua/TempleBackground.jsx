import React, { useState } from 'react';

/**
 * Nền video lặp tuỳ chọn. Chỉ cần thả file vào public/video/<name>.mp4
 * là trang tự dùng; nếu file chưa có, video tự ẩn và nền CSS/SVG bên dưới hiển thị.
 */
const TempleBackground = ({ src, className = '' }) => {
    const [ready, setReady] = useState(false);

    return (
        <video
            className={`temple-bg-video ${ready ? 'is-ready' : ''} ${className}`}
            src={src}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
            onCanPlay={() => setReady(true)}
            onError={() => setReady(false)}
        />
    );
};

export default TempleBackground;
