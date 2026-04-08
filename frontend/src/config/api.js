/**
 * API Configuration
 * Automatically detects environment and sets API base URL
 */

// Detect if running on production (not localhost)
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// API host: production dùng cùng host, dev dùng localhost:8888
const API_HOST = isProduction
    ? `${window.location.protocol}//${window.location.hostname}`
    : 'http://localhost:3000';

// Export API endpoints
export const API_CONFIG = {
    HOST: API_HOST,
    BASE_URL: `${API_HOST}/api`,
    AUTH: `${API_HOST}/api/auth`,
    CONSULTANT: `${API_HOST}/api/consultant`,
    ADMIN: `${API_HOST}/api/admin`,
    BAZI: `${API_HOST}/api/bazi`,
};

// For debugging
console.log('[API Config] Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('[API Config] API Host:', API_HOST);

export default API_CONFIG;
