/**
 * Interpretation Types & Metadata Model
 *
 * Defines structured shapes for interpretation objects.
 * Does NOT change any existing output — only adds metadata foundation.
 *
 * Usage:
 *   const { normalizeInterpretation, CATEGORIES, SEVERITY } = require('./types/interpretation.types');
 *   const structured = normalizeInterpretation(rawTextArray, { category: 'personality', ... });
 */

// ─── Category Taxonomy ───────────────────────────────────────────────────────

const CATEGORIES = Object.freeze({
    PERSONALITY:     { id: 'personality',     label: 'Tính cách',       icon: '👤' },
    CAREER:          { id: 'career',          label: 'Sự nghiệp',       icon: '💼' },
    FINANCE:         { id: 'finance',         label: 'Tài lộc',         icon: '💰' },
    RELATIONSHIP:    { id: 'relationship',    label: 'Tình cảm',        icon: '❤️' },
    HEALTH:          { id: 'health',          label: 'Sức khỏe',        icon: '🏥' },
    FAMILY:          { id: 'family',          label: 'Gia đình',        icon: '👨‍👩‍👧‍👦' },
    EDUCATION:       { id: 'education',       label: 'Học vấn',         icon: '📚' },
    SPIRITUAL:       { id: 'spiritual',       label: 'Tâm linh',        icon: '🕯️' },
    TIMING:          { id: 'timing',          label: 'Thời vận',        icon: '📅' },
    SHEN_SHA:        { id: 'shen_sha',        label: 'Thần sát',        icon: '⭐' },
    ELEMENT:         { id: 'element',         label: 'Ngũ hành',        icon: '🔥' },
    CLASSIC:         { id: 'classic',         label: 'Cổ văn',          icon: '📜' },
});

// ─── Severity Levels ────────────────────────────────────────────────────────

const SEVERITY = Object.freeze({
    POSITIVE: 'positive',
    NEGATIVE: 'negative',
    WARNING:  'warning',
    INFO:     'info',
    NEUTRAL:  'neutral',
});

// ─── Confidence / Certainty ─────────────────────────────────────────────────

const CONFIDENCE = Object.freeze({
    HIGH:       'high',
    MEDIUM:     'medium',
    LOW:        'low',
    CALCULATED: 'calculated',
});

const CERTAINTY_BASIS = Object.freeze({
    EXACT_MATCH:  'exact_match',
    RULE_BASED:   'rule_based',
    AI_GENERATED: 'ai_generated',
    STATISTICAL:  'statistical',
    FALLBACK:     'fallback',
});

// ─── Category Lookup ─────────────────────────────────────────────────────────

const CATEGORY_MAP = Object.values(CATEGORIES).reduce((map, cat) => {
    map[cat.id] = cat;
    return map;
}, {});

const getCategory = (id) => CATEGORY_MAP[id] || CATEGORIES.PERSONALITY;

// ─── Normalizer ──────────────────────────────────────────────────────────────

let _idCounter = 0;

/**
 * Normalize raw interpretation output into structured metadata object.
 *
 * Wraps existing text arrays/modules WITHOUT modifying their content.
 * Adds traceability fields for future AI/audit use.
 *
 * @param {string|string[]|object} raw — Existing interpretation output
 * @param {object} options
 * @param {string} options.category — Category id from CATEGORIES
 * @param {string} [options.title] — Human-readable title
 * @param {string} [options.severity] — 'info' | 'warning' | 'positive' | 'negative' | 'neutral'
 * @param {string} [options.confidence] — 'high' | 'medium' | 'low' | 'calculated'
 * @param {string[]} [options.tags] — Keywords for search/filter
 * @param {string[]} [options.sourceRules] — Rules that generated this interpretation
 * @param {string} [options.sourceModule] — Module name that produced this
 * @returns {object} — Structured interpretation object
 */
function normalizeInterpretation(raw, options = {}) {
    _idCounter += 1;

    const {
        category = 'personality',
        title = '',
        severity = SEVERITY.INFO,
        confidence = CONFIDENCE.MEDIUM,
        tags = [],
        sourceRules = [],
        sourceModule = 'unknown',
    } = options;

    // Normalize content to string array
    let content = [];
    if (Array.isArray(raw)) {
        content = raw.filter(line => typeof line === 'string' && line.trim().length > 0);
    } else if (typeof raw === 'string') {
        content = [raw];
    } else if (raw && typeof raw === 'object') {
        content = [JSON.stringify(raw)];
    }

    // Extract a summary (first meaningful line)
    const summary = content.find(line => line.length > 10 && !line.startsWith('=') && !line.startsWith('[')) || content[0] || '';

    const cat = getCategory(category);

    return {
        // Core
        id: `interpretation_${_idCounter}`,
        category: cat.id,
        categoryLabel: cat.label,
        categoryIcon: cat.icon,

        // Content
        title: title || cat.label,
        summary: summary.substring(0, 200),
        content,
        tags: [...new Set([cat.id, ...tags])],

        // Quality
        severity,
        confidence,
        certainty: {
            basis: confidence === 'high' ? CERTAINTY_BASIS.EXACT_MATCH
                : confidence === 'calculated' ? CERTAINTY_BASIS.RULE_BASED
                : CERTAINTY_BASIS.FALLBACK,
        },

        // Traceability
        sourceRules,
        sourceData: {
            module: sourceModule,
            version: '1.0.0',
        },

        // Timing
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
    };
}

// ─── Export ──────────────────────────────────────────────────────────────────

module.exports = {
    CATEGORIES,
    CATEGORY_MAP,
    SEVERITY,
    CONFIDENCE,
    CERTAINTY_BASIS,
    getCategory,
    normalizeInterpretation,
};
