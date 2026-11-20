import { useCallback, useEffect, useRef, useState } from 'react';

const FULLSCREEN_BODY_CLASS = 'temple-fullscreen-active';

/**
 * Đưa khung cảnh chùa lên toàn màn hình bằng Fullscreen API.
 * Nếu trình duyệt không hỗ trợ (hoặc chặn), tự chuyển sang chế độ "rạp"
 * bằng CSS: ẩn mọi phần giao diện, khung cảnh phủ kín viewport.
 */
const useTempleFullscreen = () => {
    const sceneRef = useRef(null);
    const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
    const [isFallback, setIsFallback] = useState(false);

    const active = isNativeFullscreen || isFallback;

    useEffect(() => {
        const syncFullscreenState = () => {
            const doc = document;
            const element = doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement || null;
            setIsNativeFullscreen(Boolean(element) && element === sceneRef.current);
            if (element) setIsFallback(false);
        };

        document.addEventListener('fullscreenchange', syncFullscreenState);
        document.addEventListener('webkitfullscreenchange', syncFullscreenState);
        document.addEventListener('MSFullscreenChange', syncFullscreenState);

        return () => {
            document.removeEventListener('fullscreenchange', syncFullscreenState);
            document.removeEventListener('webkitfullscreenchange', syncFullscreenState);
            document.removeEventListener('MSFullscreenChange', syncFullscreenState);
        };
    }, []);

    useEffect(() => {
        document.body.classList.toggle(FULLSCREEN_BODY_CLASS, active);
        return () => document.body.classList.remove(FULLSCREEN_BODY_CLASS);
    }, [active]);

    useEffect(() => {
        if (!isFallback) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') setIsFallback(false);
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isFallback]);

    const enter = useCallback(() => {
        const element = sceneRef.current;
        if (!element) return;

        const request = element.requestFullscreen
            || element.webkitRequestFullscreen
            || element.msRequestFullscreen;

        if (!request) {
            setIsFallback(true);
            return;
        }

        try {
            const result = request.call(element);
            if (result && typeof result.catch === 'function') {
                result.catch(() => setIsFallback(true));
            }
        } catch (error) {
            setIsFallback(true);
        }
    }, []);

    const exit = useCallback(() => {
        setIsFallback(false);

        const doc = document;
        const fullscreenElement = doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
        if (!fullscreenElement) return;

        const exitFullscreen = doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        if (!exitFullscreen) return;

        try {
            const result = exitFullscreen.call(doc);
            if (result && typeof result.catch === 'function') {
                result.catch(() => { /* already leaving */ });
            }
        } catch (error) {
            /* already leaving */
        }
    }, []);

    return { sceneRef, active, isNativeFullscreen, isFallback, enter, exit };
};

export default useTempleFullscreen;
