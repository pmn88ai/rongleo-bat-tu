/**
 * Auth Middleware
 * - Development: x-user-id header bypass (no-auth mode, local dev friendly)
 * - Production:  x-user-id bypass rejected (must use proper JWT auth)
 */

const isProduction = () => process.env.NODE_ENV === 'production';

const authenticateToken = (req, res, next) => {
    if (isProduction()) {
        // Production: reject x-user-id bypass, require real auth
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Please use proper authentication in production mode.'
        });
    }

    // Development: x-user-id header bypass
    req.user = {
        id: req.headers['x-user-id'] || 'anonymous',
        role: 'user'
    };
    next();
};

const requireAdmin = (req, res, next) => {
    if (isProduction()) {
        return res.status(403).json({
            error: 'Admin access disabled',
            message: 'Admin functionality requires proper authentication.'
        });
    }

    // Development: admin routes disabled in no-auth mode
    return res.status(403).json({
        success: false,
        message: 'Admin access disabled in no-auth mode. Set NODE_ENV=production for production.'
    });
};

module.exports = { authenticateToken, requireAdmin };
