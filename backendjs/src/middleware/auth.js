/**
 * Auth Middleware - NO-AUTH MODE
 * Bypass toàn bộ authentication.
 * User identity được xác định qua header x-user-id (do frontend tạo từ localStorage).
 * Fallback: "anonymous"
 */

const authenticateToken = (req, res, next) => {
    req.user = {
        id: req.headers['x-user-id'] || 'anonymous',
        role: 'user'
    };
    next();
};

const requireAdmin = (req, res, next) => {
    // Admin routes disabled in no-auth mode
    return res.status(403).json({ success: false, message: 'Admin access disabled in no-auth mode' });
};

module.exports = { authenticateToken, requireAdmin };
