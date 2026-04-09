'use strict';

const { withHandler, parseIntParam } = require('../_helpers');

// Static require — Vercel bundles this at build time
// Nếu file chưa tồn tại thì fallback graceful
let articlesData;
try {
    articlesData = require('../../lib/data/articles.json');
} catch(e) {
    articlesData = { articles: [] };
}

function loadArticles() {
    return articlesData || { articles: [] };
}

module.exports = withHandler(async function(req, res) {
    const q = req.query;
    const page     = parseIntParam(q.page, 1);
    const limit    = Math.min(parseIntParam(q.limit, 10), 50); // clamp tối đa 50
    const category = q.category || 'all';

    const data = loadArticles();
    let articles = (data.articles || []).filter(function(a) {
        return a.is_published !== false;
    });

    if (category && category !== 'all') {
        articles = articles.filter(function(a) {
            return a.category_slug === category;
        });
    }

    const total  = articles.length;
    const offset = (page - 1) * limit;
    const paged  = articles.slice(offset, offset + limit);

    return res.status(200).json({
        success: true,
        articles: paged,
        pagination: {
            page:       page,
            limit:      limit,
            total:      total,
            totalPages: Math.max(1, Math.ceil(total / limit))
        }
    });
});
