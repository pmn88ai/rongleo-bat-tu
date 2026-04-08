/**
 * getUserId - Lấy anonymous uid từ localStorage.
 * Được dùng để attach vào header "x-user-id" trong mọi API call.
 */
export const getUserId = () => {
    let uid = localStorage.getItem('uid');
    if (!uid) {
        uid = crypto.randomUUID();
        localStorage.setItem('uid', uid);
    }
    return uid;
};

/**
 * getAuthHeaders - Headers chuẩn để attach vào fetch requests.
 */
export const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': getUserId()
});
