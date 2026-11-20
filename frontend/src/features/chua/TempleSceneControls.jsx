import React from 'react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export const TempleFullscreenButton = ({ onClick }) => (
    <button
        type="button"
        className="temple-fs-btn"
        onClick={onClick}
        title="Xem toàn màn hình"
        aria-label="Bật chế độ toàn màn hình"
    >
        <span aria-hidden="true">⛶</span>
        Toàn màn hình
    </button>
);

const TempleSceneControls = ({ fullscreen }) => {
    const { isPlaying, toggle } = useMusicPlayer();

    if (!fullscreen.active) return null;

    return (
        <div className="temple-fs-controls">
            <button
                type="button"
                className="temple-fs-control"
                onClick={fullscreen.exit}
                title="Thoát toàn màn hình"
                aria-label="Thoát toàn màn hình"
            >
                <span aria-hidden="true">✕</span>
            </button>
            <button
                type="button"
                className={`temple-fs-control ${isPlaying ? 'is-playing' : ''}`}
                onClick={toggle}
                title={isPlaying ? 'Dừng nhạc' : 'Phát nhạc'}
                aria-label={isPlaying ? 'Dừng nhạc' : 'Phát nhạc'}
            >
                <span aria-hidden="true">{isPlaying ? '❚❚' : '▶'}</span>
            </button>
        </div>
    );
};

export default TempleSceneControls;
