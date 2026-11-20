/**
 * getUserId - Lấy uid dùng cho header "x-user-id".
 * Người đã đăng nhập dùng id tài khoản (để lịch sử gắn đúng user).
 * Khách dùng anonymous uid sinh từ localStorage.
 */
export const getUserId = () => {
    try {
        const authUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
        if (authUser && authUser.id !== undefined && authUser.id !== null) {
            return String(authUser.id);
        }
    } catch (e) {
        // fall through
    }

    let uid = localStorage.getItem('uid');
    if (!uid) {
        uid = localStorage.getItem('anon_uid');
        if (!uid) {
            uid = crypto.randomUUID();
            localStorage.setItem('anon_uid', uid);
        }
        localStorage.setItem('uid', uid);
    }
    return uid;
};

/**
 * getAuthHeaders - Headers chuẩn để attach vào fetch requests.
 */
export const getAuthHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
        'x-user-id': getUserId()
    };
    const token = localStorage.getItem('auth_token');
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
};
