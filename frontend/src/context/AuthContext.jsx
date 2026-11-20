/**
 * AuthContext
 * Đăng nhập/đăng ký thật qua API /api/auth (JWT đã có sẵn trong backendjs).
 * Khách không đăng nhập vẫn dùng app bình thường với uid anonymous.
 *
 * localStorage:
 *  - auth_token / auth_user : phiên đăng nhập
 *  - anon_uid               : uid khách (giữ nguyên khi đăng nhập/đăng xuất)
 *  - saved_profile          : hồ sơ Bát Tự đã lưu để tự điền ở các quầy
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../config/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const ANON_KEY = 'anon_uid';
const PROFILE_KEY = 'saved_profile';

const readJSON = (key) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
};

const getOrCreateAnonId = () => {
    let uid = localStorage.getItem(ANON_KEY);
    if (!uid) {
        uid = crypto.randomUUID();
        localStorage.setItem(ANON_KEY, uid);
    }
    return uid;
};

// Đồng bộ uid dùng cho header x-user-id: ưu tiên id người đã đăng nhập
const syncUid = (user) => {
    if (user && user.id !== undefined && user.id !== null) {
        localStorage.setItem('uid', String(user.id));
    } else {
        localStorage.setItem('uid', getOrCreateAnonId());
    }
};

const splitProfile = (baziData, fallbackName = '') => {
    if (!baziData) return null;
    return {
        name: fallbackName || baziData.name || '',
        gender: baziData.gender || 'Nam',
        year: baziData.year,
        month: baziData.month,
        day: baziData.day,
        hour: baziData.hour ?? 0,
        minute: baziData.minute ?? 0,
        calendar: baziData.calendar || 'solar'
    };
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
    const [user, setUser] = useState(() => {
        const stored = readJSON(USER_KEY);
        if (stored) syncUid(stored);
        else syncUid(null);
        return stored;
    });
    const [loading, setLoading] = useState(false);

    const persistAuth = useCallback((nextToken, nextUser) => {
        if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
        else localStorage.removeItem(TOKEN_KEY);

        if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        else localStorage.removeItem(USER_KEY);

        setToken(nextToken || null);
        setUser(nextUser || null);
        syncUid(nextUser);

        if (nextUser && nextUser.bazi_data) {
            localStorage.setItem(PROFILE_KEY, JSON.stringify({
                name: nextUser.name || '',
                ...nextUser.bazi_data
            }));
        }
    }, []);

    const refreshUser = useCallback(async () => {
        const currentToken = localStorage.getItem(TOKEN_KEY);
        if (!currentToken) return null;
        try {
            const res = await fetch(`${API_CONFIG.AUTH}/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`,
                    'x-user-id': localStorage.getItem('uid') || ''
                }
            });
            if (!res.ok) throw new Error('Unauthorized');
            const data = await res.json();
            if (data.user) {
                // /me với khách anonymous trả id chuỗi -> giữ id số đã lưu khi đăng nhập
                const nextUser = { ...user, ...data.user };
                if (nextUser.id === 'anonymous' && user?.id) nextUser.id = user.id;
                persistAuth(currentToken, nextUser);
                return nextUser;
            }
        } catch (e) {
            // Token hỏng/hết hạn -> về khách
            persistAuth(null, null);
        }
        return null;
    }, [persistAuth, user]);

    // Lấy lại hồ sơ mới nhất khi mở app
    useEffect(() => {
        if (localStorage.getItem(TOKEN_KEY)) refreshUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_CONFIG.AUTH}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
            persistAuth(data.token, data.user);
            return data.user;
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, password, name, captchaToken, captchaAnswer) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_CONFIG.AUTH}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, captchaToken, captchaAnswer })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');
            persistAuth(data.token, data.user);
            return data.user;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (localStorage.getItem(TOKEN_KEY)) {
                await fetch(`${API_CONFIG.AUTH}/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
                    }
                });
            }
        } catch (e) {
            // ignore
        }
        persistAuth(null, null);
        localStorage.removeItem(PROFILE_KEY);
    };

    const updateProfile = async ({ name, baziData }) => {
        const currentToken = localStorage.getItem(TOKEN_KEY);
        const mergedBazi = { ...(user?.bazi_data || {}), ...baziData };
        const localProfile = { name: name || user?.name || '', ...mergedBazi };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(localProfile));

        const nextUser = { ...user, name: name || user?.name || '', bazi_data: mergedBazi };
        persistAuth(currentToken, nextUser);

        if (currentToken) {
            try {
                const res = await fetch(`${API_CONFIG.AUTH}/profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`,
                        'x-user-id': localStorage.getItem('uid') || ''
                    },
                    body: JSON.stringify({ name: localProfile.name, baziData: mergedBazi })
                });
                const data = await res.json();
                if (res.ok && data.user) {
                    persistAuth(currentToken, { ...nextUser, ...data.user });
                    return data.user;
                }
            } catch (e) {
                // Vẫn giữ hồ sơ local nếu mất mạng
            }
        }
        return nextUser;
    };

    const savedProfile = user?.bazi_data
        ? splitProfile(user.bazi_data, user.name)
        : splitProfile(readJSON(PROFILE_KEY), readJSON(PROFILE_KEY)?.name);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated: !!(token && user),
            savedProfile,
            login,
            register,
            logout,
            refreshUser,
            updateProfile,
            updateCredits: () => {},
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
