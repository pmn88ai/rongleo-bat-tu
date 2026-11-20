/**
 * MusicPlayerContext
 * Một trình phát YouTube duy nhất sống ở cấp app, nên chuyển giữa Chánh điện và
 * Vườn tịnh tâm không bị dừng hay phát lại từ đầu. Nhạc chạy qua YouTube
 * (không tốn băng thông của mình) và được điều khiển từ thanh nhạc.
 *
 * Danh sách nhạc nằm DUY NHẤT ở mảng TRACKS bên dưới. Thêm bài mới = thêm 1 dòng
 * { id: '<YouTube video id>', title: '<tên hiển thị>' } vào TRACKS.
 */
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const MusicPlayerContext = createContext(null);

export const TRACKS = [
    { id: 'jKoznZSMX6s', title: 'Nhạc piano + tiếng nước chảy 2 tiếng' }
];

const DEFAULT_TRACK = TRACKS[0];

const embedSrcFor = (track) =>
    `https://www.youtube.com/embed/${track.id}?rel=0&playsinline=1`;

const YT_API_SRC = 'https://www.youtube.com/iframe_api';
let ytApiPromise = null;

const loadYouTubeApi = () => {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('No window'));
    }
    if (window.YT && typeof window.YT.Player === 'function') {
        return Promise.resolve(window.YT);
    }
    if (ytApiPromise) return ytApiPromise;

    ytApiPromise = new Promise((resolve, reject) => {
        const previousReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (typeof previousReady === 'function') previousReady();
            if (window.YT && typeof window.YT.Player === 'function') resolve(window.YT);
            else reject(new Error('YouTube API unavailable'));
        };

        if (!document.querySelector(`script[src="${YT_API_SRC}"]`)) {
            const script = document.createElement('script');
            script.src = YT_API_SRC;
            script.async = true;
            script.onerror = () => reject(new Error('Cannot load YouTube API'));
            document.head.appendChild(script);
        }
    });

    return ytApiPromise;
};

export const MusicPlayerProvider = ({ children }) => {
    const playerRef = useRef(null);
    const hostRef = useRef(null);
    const initPromiseRef = useRef(null);
    const pendingPlayRef = useRef(false);
    const readyRef = useRef(false);
    const volumeRef = useRef(0.65);
    const mountedRef = useRef(true);
    const tickRef = useRef(null);

    const currentTrackRef = useRef(DEFAULT_TRACK);
    const pendingTrackRef = useRef(null);
    const previousTrackRef = useRef(null);
    const previousWasPlayingRef = useRef(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolumeState] = useState(0.65);
    const [expanded, setExpanded] = useState(false);
    const [available, setAvailable] = useState(true);
    const [ready, setReady] = useState(false);
    const [currentTrackId, setCurrentTrackId] = useState(DEFAULT_TRACK.id);
    const [trackError, setTrackError] = useState(null);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            window.clearInterval(tickRef.current);
            const player = playerRef.current;
            playerRef.current = null;
            readyRef.current = false;
            if (player && typeof player.destroy === 'function') {
                try { player.destroy(); } catch (e) { /* ignore */ }
            }
            if (hostRef.current) {
                hostRef.current.remove();
                hostRef.current = null;
            }
            initPromiseRef.current = null;
            pendingPlayRef.current = false;
            pendingTrackRef.current = null;
            previousTrackRef.current = null;
        };
    }, []);

    useEffect(() => {
        tickRef.current = window.setInterval(() => {
            const player = playerRef.current;
            if (!readyRef.current || !player || typeof player.getCurrentTime !== 'function') return;
            const t = player.getCurrentTime();
            if (Number.isFinite(t)) setCurrentTime(t);
        }, 500);

        return () => {
            window.clearInterval(tickRef.current);
            tickRef.current = null;
        };
    }, []);

    const createPlayer = useCallback(() => {
        if (initPromiseRef.current) return initPromiseRef.current;

        const startTrack = currentTrackRef.current;

        initPromiseRef.current = loadYouTubeApi()
            .then((YT) => new Promise((resolve, reject) => {
                if (!mountedRef.current) {
                    reject(new Error('Unmounted'));
                    return;
                }

                const host = document.createElement('div');
                host.setAttribute('aria-hidden', 'true');
                host.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;';
                document.body.appendChild(host);
                hostRef.current = host;

                const player = new YT.Player(host, {
                    videoId: startTrack.id,
                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                        disablekb: 1,
                        loop: 1,
                        playlist: startTrack.id,
                        playsinline: 1,
                        rel: 0
                    },
                    events: {
                        onReady: (event) => {
                            playerRef.current = event.target;
                            readyRef.current = true;
                            setReady(true);
                            event.target.setVolume(Math.round(volumeRef.current * 100));
                            if (typeof event.target.setLoop === 'function') event.target.setLoop(true);
                            const d = event.target.getDuration();
                            if (Number.isFinite(d) && d > 0) setDuration(d);
                            resolve(event.target);
                            if (pendingPlayRef.current) {
                                pendingPlayRef.current = false;
                                event.target.playVideo();
                            }
                        },
                        onStateChange: (event) => {
                            if (event.data === YT.PlayerState.PLAYING) {
                                pendingTrackRef.current = null;
                                previousTrackRef.current = null;
                                setIsPlaying(true);
                                const d = event.target.getDuration();
                                if (Number.isFinite(d) && d > 0) setDuration(d);
                            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                                setIsPlaying(false);
                            }
                        },
                        onError: () => {
                            const failedTrack = pendingTrackRef.current;
                            const previousTrack = previousTrackRef.current;
                            pendingTrackRef.current = null;
                            previousTrackRef.current = null;

                            if (failedTrack && previousTrack) {
                                currentTrackRef.current = previousTrack;
                                setCurrentTrackId(previousTrack.id);
                                setTrackError(`Không phát được "${failedTrack.title}". Vẫn giữ bài đang phát.`);
                                const p = playerRef.current;
                                if (p && typeof p.loadVideoById === 'function') {
                                    p.loadVideoById(previousTrack.id);
                                    if (previousWasPlayingRef.current && typeof p.playVideo === 'function') {
                                        p.playVideo();
                                    }
                                }
                                return;
                            }

                            setAvailable(false);
                            reject(new Error('YouTube player error'));
                        }
                    }
                });

                playerRef.current = player;
            }))
            .catch((error) => {
                initPromiseRef.current = null;
                if (mountedRef.current) setAvailable(false);
                throw error;
            });

        return initPromiseRef.current;
    }, []);

    const play = useCallback(() => {
        const startPlayback = () => {
            const player = playerRef.current;
            if (readyRef.current && player && typeof player.playVideo === 'function') {
                player.playVideo();
            } else {
                pendingPlayRef.current = true;
            }
        };

        if (!initPromiseRef.current) {
            pendingPlayRef.current = true;
            createPlayer().catch(() => { /* handled via available state */ });
            return;
        }

        startPlayback();
    }, [createPlayer]);

    const pause = useCallback(() => {
        pendingPlayRef.current = false;
        const player = playerRef.current;
        if (readyRef.current && player && typeof player.pauseVideo === 'function') {
            player.pauseVideo();
        }
    }, []);

    const toggle = useCallback(() => {
        const player = playerRef.current;
        if (readyRef.current && player && typeof player.getPlayerState === 'function' && player.getPlayerState() === 1) {
            pause();
            return;
        }
        play();
    }, [pause, play]);

    const selectTrack = useCallback((trackId) => {
        const nextTrack = TRACKS.find((track) => track.id === trackId);
        if (!nextTrack) return;
        if (nextTrack.id === currentTrackRef.current.id) return;

        const previousTrack = currentTrackRef.current;
        const player = playerRef.current;

        setTrackError(null);
        setDuration(0);
        setCurrentTime(0);
        currentTrackRef.current = nextTrack;
        setCurrentTrackId(nextTrack.id);

        if (!readyRef.current || !player || typeof player.loadVideoById !== 'function') {
            pendingPlayRef.current = true;
            if (!initPromiseRef.current) createPlayer().catch(() => { /* handled via available state */ });
            return;
        }

        pendingTrackRef.current = nextTrack;
        previousTrackRef.current = previousTrack;
        previousWasPlayingRef.current = typeof player.getPlayerState === 'function' && player.getPlayerState() === 1;

        player.loadVideoById(nextTrack.id);
        if (typeof player.playVideo === 'function') player.playVideo();
    }, [createPlayer]);

    const seek = useCallback((seconds) => {
        const next = Math.max(0, seconds);
        const player = playerRef.current;
        if (readyRef.current && player && typeof player.seekTo === 'function') {
            player.seekTo(next, true);
            setCurrentTime(next);
        }
    }, []);

    const setVolume = useCallback((next) => {
        const value = Math.max(0, Math.min(1, next));
        volumeRef.current = value;
        setVolumeState(value);
        const player = playerRef.current;
        if (readyRef.current && player && typeof player.setVolume === 'function') {
            player.setVolume(Math.round(value * 100));
        }
    }, []);

    const currentTrack = TRACKS.find((track) => track.id === currentTrackId) || DEFAULT_TRACK;

    return (
        <MusicPlayerContext.Provider value={{
            title: currentTrack.title,
            src: embedSrcFor(currentTrack),
            embedSrc: embedSrcFor(currentTrack),
            currentTrack,
            currentTrackId,
            tracks: TRACKS,
            selectTrack,
            trackError,
            available,
            ready,
            isPlaying,
            duration,
            currentTime,
            volume,
            expanded,
            setExpanded,
            play,
            pause,
            toggle,
            seek,
            setVolume
        }}>
            {children}
        </MusicPlayerContext.Provider>
    );
};

export const useMusicPlayer = () => {
    const context = useContext(MusicPlayerContext);
    if (!context) throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
    return context;
};
