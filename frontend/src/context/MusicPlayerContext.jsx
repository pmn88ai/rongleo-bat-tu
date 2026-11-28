/**
 * MusicPlayerContext
 * Một trình phát duy nhất sống ở cấp app, nên chuyển giữa Chánh điện và
 * Vườn tịnh tâm không bị dừng hay phát lại từ đầu. Điều khiển từ thanh nhạc.
 *
 * Danh sách nhạc nằm DUY NHẤT ở mảng TRACKS bên dưới. Hai loại bài:
 *   - kind 'file'    : file nhạc tự host trong /public/audio (HTML5 <audio>, chỉ tải khi bấm phát,
 *                      trình duyệt tải dần theo đoạn đang nghe — không tải cả file một lần).
 *   - kind 'youtube' : video YouTube (id), phát ẩn qua YouTube IFrame API.
 * `room` = đường dẫn gian chùa mà bài thuộc về: vào gian nào thì thanh nhạc chọn bài của gian đó
 * (đang phát thì đổi bài luôn).
 */
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const MusicPlayerContext = createContext(null);

export const TRACKS = [
    {
        id: 'chanh-dien-36p',
        kind: 'file',
        src: '/audio/chanh-dien-36p.m4a',
        title: 'Chánh điện — chuông, mõ, sáo (36 phút)',
        room: '/chanh-dien'
    },
    {
        id: 'jKoznZSMX6s',
        kind: 'youtube',
        title: 'Nhạc piano + tiếng nước chảy 2 tiếng',
        room: '/vuon-tinh-tam'
    }
];

const DEFAULT_TRACK = TRACKS[0];

export const trackForRoom = (pathname) => TRACKS.find((track) => track.room === pathname) || null;

const embedSrcFor = (track) =>
    track.kind === 'youtube' ? `https://www.youtube.com/embed/${track.id}?rel=0&playsinline=1` : track.src;

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
    // ---- YouTube ----
    const playerRef = useRef(null);
    const hostRef = useRef(null);
    const initPromiseRef = useRef(null);
    const pendingPlayRef = useRef(false);
    const readyRef = useRef(false);
    const pendingYtIdRef = useRef(null);      // bài YouTube cần nạp khi player sẵn sàng

    // ---- file (HTML5 audio) ----
    const audioRef = useRef(null);

    const volumeRef = useRef(0.65);
    const mountedRef = useRef(true);
    const tickRef = useRef(null);
    const currentTrackRef = useRef(DEFAULT_TRACK);

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolumeState] = useState(0.65);
    const [expanded, setExpanded] = useState(false);
    const [available, setAvailable] = useState(true);
    const [ready, setReady] = useState(false);
    const [currentTrackId, setCurrentTrackId] = useState(DEFAULT_TRACK.id);
    const [trackError, setTrackError] = useState(null);

    const isYt = () => currentTrackRef.current.kind === 'youtube';

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
            const audio = audioRef.current;
            if (audio) {
                audio.pause();
                audio.removeAttribute('src');
                audioRef.current = null;
            }
            initPromiseRef.current = null;
            pendingPlayRef.current = false;
        };
    }, []);

    // thời gian của bài YouTube (file dùng sự kiện timeupdate)
    useEffect(() => {
        tickRef.current = window.setInterval(() => {
            if (!isYt()) return;
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

    // ---------------------------------------------------------------- file
    const getAudio = useCallback(() => {
        if (audioRef.current) return audioRef.current;
        const audio = new Audio();
        audio.preload = 'none';                // chỉ tải khi bấm phát
        audio.loop = true;
        audio.volume = volumeRef.current;
        audio.addEventListener('play', () => { if (!isYt()) setIsPlaying(true); });
        audio.addEventListener('pause', () => { if (!isYt()) setIsPlaying(false); });
        audio.addEventListener('timeupdate', () => { if (!isYt()) setCurrentTime(audio.currentTime); });
        audio.addEventListener('loadedmetadata', () => {
            if (!isYt() && Number.isFinite(audio.duration)) setDuration(audio.duration);
        });
        audio.addEventListener('error', () => {
            if (isYt() || !audio.getAttribute('src')) return;
            setIsPlaying(false);
            setTrackError(`Không tải được "${currentTrackRef.current.title}". Kiểm tra kết nối mạng.`);
        });
        audioRef.current = audio;
        return audio;
    }, []);

    const playFile = useCallback((track) => {
        const audio = getAudio();
        if (audio.getAttribute('src') !== track.src) {
            audio.setAttribute('src', track.src);
            audio.load();
        }
        setReady(true);
        const p = audio.play();
        if (p && typeof p.catch === 'function') {
            p.catch(() => { if (mountedRef.current) setIsPlaying(false); });
        }
    }, [getAudio]);

    // ---------------------------------------------------------------- YouTube
    const createPlayer = useCallback((startId) => {
        if (initPromiseRef.current) return initPromiseRef.current;

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
                    videoId: startId,
                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                        disablekb: 1,
                        loop: 1,
                        playlist: startId,
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
                            resolve(event.target);
                            const want = pendingYtIdRef.current;
                            pendingYtIdRef.current = null;
                            if (want && want !== startId && typeof event.target.loadVideoById === 'function') {
                                event.target.loadVideoById(want);
                            }
                            if (pendingPlayRef.current && isYt()) {
                                pendingPlayRef.current = false;
                                event.target.playVideo();
                            }
                        },
                        onStateChange: (event) => {
                            if (!isYt()) return;
                            if (event.data === YT.PlayerState.PLAYING) {
                                setIsPlaying(true);
                                const d = event.target.getDuration();
                                if (Number.isFinite(d) && d > 0) setDuration(d);
                            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                                setIsPlaying(false);
                            }
                        },
                        onError: () => {
                            if (!isYt()) return;
                            setIsPlaying(false);
                            setTrackError(`Không phát được "${currentTrackRef.current.title}" (YouTube).`);
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

    const playYt = useCallback((track) => {
        const player = playerRef.current;
        if (!initPromiseRef.current) {
            pendingPlayRef.current = true;
            createPlayer(track.id).catch(() => { /* handled via available state */ });
            return;
        }
        if (!readyRef.current || !player) {
            pendingPlayRef.current = true;
            pendingYtIdRef.current = track.id;
            return;
        }
        const nowId = typeof player.getVideoData === 'function' ? (player.getVideoData() || {}).video_id : null;
        if (nowId && nowId !== track.id && typeof player.loadVideoById === 'function') {
            player.loadVideoById(track.id);
        }
        if (typeof player.playVideo === 'function') player.playVideo();
    }, [createPlayer]);

    const pauseYt = () => {
        pendingPlayRef.current = false;
        const player = playerRef.current;
        if (readyRef.current && player && typeof player.pauseVideo === 'function') player.pauseVideo();
    };

    // ---------------------------------------------------------------- chung
    const play = useCallback(() => {
        setTrackError(null);
        const track = currentTrackRef.current;
        if (track.kind === 'file') playFile(track);
        else playYt(track);
    }, [playFile, playYt]);

    const pause = useCallback(() => {
        if (audioRef.current) audioRef.current.pause();
        pauseYt();
        setIsPlaying(false);
    }, []);

    const toggle = useCallback(() => {
        if (isYt()) {
            const player = playerRef.current;
            if (readyRef.current && player && typeof player.getPlayerState === 'function' && player.getPlayerState() === 1) {
                pause();
                return;
            }
        } else if (audioRef.current && !audioRef.current.paused) {
            pause();
            return;
        }
        play();
    }, [pause, play]);

    /** Đổi bài. `autoplay` mặc định true (người dùng chọn); khi đổi gian thì phát tiếp chỉ nếu đang phát. */
    const selectTrack = useCallback((trackId, { autoplay = true } = {}) => {
        const nextTrack = TRACKS.find((track) => track.id === trackId);
        if (!nextTrack || nextTrack.id === currentTrackRef.current.id) return;

        if (audioRef.current) audioRef.current.pause();
        pauseYt();
        setIsPlaying(false);
        setTrackError(null);
        setDuration(0);
        setCurrentTime(0);
        currentTrackRef.current = nextTrack;
        setCurrentTrackId(nextTrack.id);

        if (autoplay) {
            if (nextTrack.kind === 'file') playFile(nextTrack);
            else playYt(nextTrack);
        }
    }, [playFile, playYt]);

    const seek = useCallback((seconds) => {
        const next = Math.max(0, seconds);
        if (isYt()) {
            const player = playerRef.current;
            if (readyRef.current && player && typeof player.seekTo === 'function') {
                player.seekTo(next, true);
                setCurrentTime(next);
            }
            return;
        }
        const audio = audioRef.current;
        if (audio && audio.getAttribute('src')) {
            audio.currentTime = next;
            setCurrentTime(next);
        }
    }, []);

    const setVolume = useCallback((next) => {
        const value = Math.max(0, Math.min(1, next));
        volumeRef.current = value;
        setVolumeState(value);
        if (audioRef.current) audioRef.current.volume = value;
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
