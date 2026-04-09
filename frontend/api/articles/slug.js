'use strict';

const { withHandler } = require('../_helpers');

// Static require — Vercel bundles at build time
let articlesData;
try {
    articlesData = require('../../lib/data/articles.json');
} catch(e) {
    articlesData = { articles: [] };
}

// GET /api/articles/slug?slug=xxx
// Anti-bug shield: chấp nhận cả ?slug= và path param nếu có
module.exports = withHandler(async function(req, res) {
    const slug = req.query.slug || '';

    if (!slug) {
        return res.status(400).json({ success: false, error: 'Missing slug parameter' });
    }

    const articles = (articlesData && articlesData.articles) || [];
    const article  = articles.find(function(a) { return a.slug === slug; });

    if (!article) {
        return res.status(404).json({ success: false, error: 'Article not found' });
    }

    const related = articles
        .filter(function(a) {
            return a.category_slug === article.category_slug &&
                   a.slug !== slug &&
                   a.is_published !== false;
        })
        .slice(0, 3);

    return res.status(200).json({
        success: true,
        article: article,
        related: related
    });
});
