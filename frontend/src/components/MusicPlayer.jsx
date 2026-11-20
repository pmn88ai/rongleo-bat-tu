import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import './MusicPlayer.css';

const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
};

const MusicPlayer = () => {
    const location = useLocation();
    const {
        tracks, currentTrackId, selectTrack, trackError,
        isPlaying, duration, currentTime, volume, expanded,
        setExpanded, toggle, seek, setVolume, available, pause
    } = useMusicPlayer();

    const isTempleRoute = location.pathname === '/chanh-dien' || location.pathname === '/vuon-tinh-tam';
    const keepsMusicAlive = isTempleRoute || location.pathname === '/chua';

    useEffect(() => {
        if (!keepsMusicAlive && isPlaying) pause();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    if (!isTempleRoute) return null;

    if (!available) {
        return (
            <div className="music-player-missing" role="status">
                Không tải được nhạc YouTube. Kiểm tra kết nối mạng.
            </div>
        );
    }

    if (!expanded) {
        return (
            <button
                className={`music-fab ${isPlaying ? 'is-playing' : ''}`}
                onClick={() => {
                    if (!isPlaying) toggle();
                    setExpanded(true);
                }}
                title="Mở thanh nhạc"
                aria-label="Mở thanh nhạc"
            >
                <span className="music-fab-icon">{isPlaying ? '❚❚' : '▶'}</span>
            </button>
        );
    }

    return (
        <div className="music-bar" role="region" aria-label="Thanh nhạc thiền">
            <button className="music-play-btn" onClick={toggle} aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}>
                {isPlaying ? '❚❚' : '▶'}
            </button>

            <div className="music-bar-main">
                <div className="music-bar-top">
                    <select
                        className="music-track-select"
                        value={currentTrackId}
                        onChange={(e) => selectTrack(e.target.value)}
                        title="Chọn bài nhạc"
                        aria-label="Chọn bài nhạc"
                    >
                        {tracks.map((track) => (
                            <option key={track.id} value={track.id}>{track.title}</option>
                        ))}
                    </select>
                    <span className="music-bar-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                <input
                    className="music-progress"
                    type="range"
                    min="0"
                    max={duration || 1}
                    step="0.1"
                    value={Math.min(currentTime, duration || 1)}
                    onChange={(e) => seek(parseFloat(e.target.value))}
                    aria-label="Tiến trình bài nhạc"
                />
                {trackError && (
                    <span className="music-track-error" role="status">{trackError}</span>
                )}
            </div>

            <div className="music-volume">
                <span aria-hidden="true">🔊</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    aria-label="Âm lượng"
                />
            </div>

            <button className="music-collapse-btn" onClick={() => setExpanded(false)} aria-label="Thu nhỏ thanh nhạc">
                ✕
            </button>
        </div>
    );
};

export default MusicPlayer;
