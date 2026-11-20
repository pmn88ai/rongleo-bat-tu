/**
 * MusicPlayerContext
 * Một thẻ audio duy nhất sống ở cấp app, nên chuyển giữa Chánh điện và
 * Vườn tịnh tâm không bị dừng hay phát lại từ đầu.
 */
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const MusicPlayerContext = createContext(null);

const TRACK = {
    title: 'Thiền piano — RongLeo',
    src: '/audio/thien.mp3'
};

export const MusicPlayerProvider = ({ children }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolumeState] = useState(0.65);
    const [expanded, setExpanded] = useState(false);
    const [available, setAvailable] = useState(true);

    useEffect(() => {
        const audio = new Audio(TRACK.src);
        audio.loop = true;
        audio.preload = 'metadata';
        audio.volume = volume;
        audioRef.current = audio;

        const onTime = () => setCurrentTime(audio.currentTime || 0);
        const onMeta = () => setDuration(audio.duration || 0);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onError = () => setAvailable(false);

        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('loadedmetadata', onMeta);
        audio.addEventListener('durationchange', onMeta);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('error', onError);

        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('loadedmetadata', onMeta);
            audio.removeEventListener('durationchange', onMeta);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('error', onError);
            audioRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const play = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio) return;
        try {
            await audio.play();
        } catch (e) {
            setIsPlaying(false);
        }
    }, []);

    const pause = useCallback(() => {
        const audio = audioRef.current;
        if (audio) audio.pause();
    }, []);

    const toggle = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) play();
        else pause();
    }, [pause, play]);

    const seek = useCallback((seconds) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 0));
        setCurrentTime(audio.currentTime);
    }, []);

    const setVolume = useCallback((next) => {
        const value = Math.max(0, Math.min(1, next));
        setVolumeState(value);
        if (audioRef.current) audioRef.current.volume = value;
    }, []);

    return (
        <MusicPlayerContext.Provider value={{
            title: TRACK.title,
            src: TRACK.src,
            available,
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
