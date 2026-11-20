/**
 * MenhProfileContext
 * Một "Hồ sơ mệnh" duy nhất, nhập một lần và dùng cho mọi mục tra cứu.
 * - Khách vãng lai: lưu ở localStorage (key menh_profile).
 * - Người đã đăng nhập: đọc/ghi thêm qua AuthContext.savedProfile (/api/auth/me + /api/auth/profile),
 *   không dựng lại cơ chế đăng nhập.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const MenhProfileContext = createContext(null);

const STORAGE_KEY = 'menh_profile';

export const normalizeProfile = (raw) => {
    if (!raw) return null;
    const year = Number(raw.year);
    const month = Number(raw.month);
    const day = Number(raw.day);
    if (!year || !month || !day) return null;
    return {
        name: raw.name || '',
        gender: raw.gender || 'Nam',
        year,
        month,
        day,
        hour: raw.hour ?? 0,
        minute: raw.minute ?? 0,
        calendar: raw.calendar || 'solar'
    };
};

export const profileSignature = (raw) => {
    const p = normalizeProfile(raw);
    if (!p) return '';
    return [p.name, p.gender, p.year, p.month, p.day, p.hour, p.minute, p.calendar].join('|');
};

const readStored = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? normalizeProfile(JSON.parse(raw)) : null;
    } catch (e) {
        return null;
    }
};

const writeStored = (profile) => {
    try {
        if (profile) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        // ignore quota / private mode
    }
};

const toBaziData = (profile) => {
    const { name, ...baziData } = profile;
    return { name, baziData };
};

export const MenhProfileProvider = ({ children }) => {
    const { savedProfile, isAuthenticated, updateProfile } = useAuth();
    const [profile, setProfile] = useState(() => readStored() || normalizeProfile(savedProfile));
    const syncedRef = useRef('');

    // Khi trạng thái đăng nhập / hồ sơ server đổi: ưu tiên hồ sơ server.
    // Nếu server chưa có hồ sơ mà đang có hồ sơ khách thì đẩy một lần lên server.
    useEffect(() => {
        if (!isAuthenticated) return;
        const server = normalizeProfile(savedProfile);
        if (server) {
            const key = `server:${profileSignature(server)}`;
            if (syncedRef.current === key) return;
            syncedRef.current = key;
            setProfile(server);
            writeStored(server);
            return;
        }
        if (profile) {
            const key = `push:${profileSignature(profile)}`;
            if (syncedRef.current === key) return;
            syncedRef.current = key;
            updateProfile(toBaziData(profile)).catch(() => {});
        }
    }, [isAuthenticated, savedProfile, profile, updateProfile]);

    const saveProfile = useCallback((data) => {
        const next = normalizeProfile(data);
        if (!next) return null;
        setProfile(next);
        writeStored(next);
        // Hồ sơ mới -> bỏ kết quả phân tích cũ để lần vào tool kế tiếp tính lại theo hồ sơ mới.
        try {
            sessionStorage.removeItem('bazi_data');
            sessionStorage.removeItem('bazi_params');
            sessionStorage.removeItem('bazi_profile_sig');
            sessionStorage.removeItem('homepage_form_data');
        } catch (e) {
            // ignore
        }
        if (isAuthenticated) {
            updateProfile(toBaziData(next)).catch(() => {});
        }
        return next;
    }, [isAuthenticated, updateProfile]);

    const clearProfile = useCallback(() => {
        setProfile(null);
        writeStored(null);
        try {
            sessionStorage.removeItem('bazi_data');
            sessionStorage.removeItem('bazi_params');
            sessionStorage.removeItem('bazi_profile_sig');
        } catch (e) {
            // ignore
        }
    }, []);

    return (
        <MenhProfileContext.Provider value={{
            profile,
            hasProfile: !!(profile && profile.year && profile.month && profile.day),
            saveProfile,
            clearProfile
        }}>
            {children}
        </MenhProfileContext.Provider>
    );
};

export const useMenhProfile = () => {
    const context = useContext(MenhProfileContext);
    if (!context) {
        throw new Error('useMenhProfile must be used within a MenhProfileProvider');
    }
    return context;
};

export default MenhProfileContext;
