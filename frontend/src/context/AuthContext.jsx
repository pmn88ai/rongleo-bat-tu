/**
 * AuthContext - NO-AUTH MODE
 * Không có login/register/token.
 * User identity được xác định bằng uid sinh từ localStorage (anonymous tracking).
 * isAuthenticated = true để toàn bộ app chạy bình thường.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Tạo hoặc lấy uid từ localStorage
const getOrCreateUserId = () => {
    let uid = localStorage.getItem('uid');
    if (!uid) {
        uid = crypto.randomUUID();
        localStorage.setItem('uid', uid);
    }
    return uid;
};

export const AuthProvider = ({ children }) => {
    const [userId] = useState(() => getOrCreateUserId());

    // User mặc định - luôn tồn tại
    const user = {
        id: userId,
        name: 'Mệnh chủ',
        credits: 9999,
        is_admin: false
    };

    return (
        <AuthContext.Provider value={{
            user,
            token: null,
            loading: false,
            isAuthenticated: true,
            login: () => Promise.resolve(),
            register: () => Promise.resolve(),
            logout: () => {},
            refreshUser: () => {},
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
