/**
 * Shared helpers for all Vercel API route handlers.
 * Replaces Express middleware: CORS, error handling, userId injection.
 */

'use strict';

process.env.TZ = 'Asia/Ho_Chi_Minh';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-user-id'
};

/**
 * withHandler(fn) — wraps a Vercel handler function with:
 *  - CORS preflight response
 *  - CORS headers on all responses
 *  - req.userId from x-user-id header (fallback: 'anonymous')
 *  - top-level error catch
 *
 * Usage:
 *   module.exports = withHandler(async function(req, res) { ... });
 */
function withHandler(fn) {
    return async function(req, res) {
        if (req.method === 'OPTIONS') {
            res.writeHead(204, CORS_HEADERS);
            res.end();
            return;
        }

        Object.keys(CORS_HEADERS).forEach(function(key) {
            res.setHeader(key, CORS_HEADERS[key]);
        });

        req.userId = req.headers['x-user-id'] || 'anonymous';

        try {
            await fn(req, res);
        } catch(error) {
            console.error('[Handler Error]', req.method, req.url, error.message);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal server error', message: error.message });
            }
        }
    };
}

/**
 * parseIntParam(val, defaultVal) — parse a query string value as integer.
 * Returns defaultVal if NaN.
 */
function parseIntParam(val, defaultVal) {
    const n = parseInt(val);
    return isNaN(n) ? defaultVal : n;
}

module.exports = { withHandler: withHandler, parseIntParam: parseIntParam, CORS_HEADERS: CORS_HEADERS };
