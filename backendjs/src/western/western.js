/**
 * Western Astrology Module — Lightweight Foundation
 *
 * Provides sun sign, moon sign (approximate), and basic personality traits
 * based on Western zodiac. Completely independent from BaZi engine.
 *
 * SCOPE:
 * - Sun sign (accurate, ±1 day cusp handling)
 * - Moon sign (approximate, ±1 sign accuracy)
 * - Personality traits (sun sign based)
 * - Element/Modality analysis
 *
 * EXCLUDED (by design):
 * - Rising sign (requires birth location + exact time, out of scope)
 * - Houses, transits, progressions
 * - Synastry / compatibility scoring
 * - Predictive astrology
 *
 * CONFIDENCE: "basic" — for personality context, NOT for professional prediction.
 *
 * USAGE:
 *   const western = require('./western');
 *   const result = western.analyze(1990, 1, 1, 12);
 *   // → { western_astrology: { sun_sign: {...}, moon_sign: {...}, elements: {...}, summary: {...} } }
 */

const { getSunSign, getAllSunSigns, getSunSignElement } = require('./signs/sun');
const { getMoonSign } = require('./signs/moon');
const { getSignPersonality } = require('./utils/personality');

/**
 * Analyze birth date from a Western astrology perspective
 * @param {number} year
 * @param {number} month — 1-12
 * @param {number} day — 1-31
 * @param {number} [hour] — 0-23 (optional, moon sign only)
 * @returns {object} western_astrology analysis
 */
function analyze(year, month, day, hour) {
    // 1. Sun sign
    const sunSign = getSunSign(month, day);
    const sunPersonality = sunSign ? getSignPersonality(sunSign.id) : null;

    // 2. Moon sign (approximate)
    const moonSign = getMoonSign(year, month, day);

    // 3. Build element distribution
    const elements = _buildElementDistribution(sunSign, moonSign);

    // 4. Build summary
    const summary = _buildSummary(sunSign, moonSign, elements);

    return {
        western_astrology: {
            _confidence: 'basic',
            _disclaimer: 'This is a basic Western astrology reference. Not for professional astrological prediction.',
            sun_sign: sunSign ? {
                id: sunSign.id,
                name: sunSign.name,
                nameVN: sunSign.nameVN,
                symbol: sunSign.symbol,
                element: sunSign.element,
                personality: sunPersonality ? {
                    traits: sunPersonality.traits,
                    traitsVN: sunPersonality.traitsVN,
                    communication: sunPersonality.communication,
                    communicationVN: sunPersonality.communicationVN,
                    emotion: sunPersonality.emotion,
                    emotionVN: sunPersonality.emotionVN,
                } : null,
            } : null,
            moon_sign: moonSign ? {
                id: moonSign.id,
                name: moonSign.name,
                nameVN: moonSign.nameVN,
                symbol: moonSign.symbol,
                element: moonSign.element,
                _confidence: moonSign._confidence,
                _warning: moonSign._warning,
            } : null,
            rising_sign: null,
            _risingNote: 'Rising sign requires birth location. Not implemented in this version.',
            elements: elements,
            summary: summary,
        },
    };
}

/**
 * Build element distribution from sun and moon signs
 */
function _buildElementDistribution(sunSign, moonSign) {
    const elementCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };

    if (sunSign) elementCounts[sunSign.element] = (elementCounts[sunSign.element] || 0) + 1;
    if (moonSign) elementCounts[moonSign.element] = (elementCounts[moonSign.element] || 0) + 1;

    const total = Object.values(elementCounts).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(elementCounts)
        .map(([element, count]) => ({
            element,
            count,
            percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Build a short summary text
 */
function _buildSummary(sunSign, moonSign, elements) {
    const dominantElement = elements[0];

    const parts = [];
    if (sunSign) {
        parts.push(`Sun in ${sunSign.name} (${sunSign.element})`);
    }
    if (moonSign) {
        parts.push(`Moon in ${moonSign.name} (${moonSign.element})`);
    }
    if (dominantElement && dominantElement.count > 0) {
        parts.push(`Dominant element: ${dominantElement.element}`);
    }

    return {
        text: parts.join('. ') + '.',
        textVN: _buildVNSummary(sunSign, moonSign, dominantElement),
        components: parts,
    };
}

function _buildVNSummary(sunSign, moonSign, dominantElement) {
    const parts = [];
    if (sunSign) {
        parts.push(`Mặt Trời ở ${sunSign.nameVN} (${sunSign.element})`);
    }
    if (moonSign) {
        parts.push(`Mặt Trăng ở ${moonSign.nameVN} (${moonSign.element})`);
    }
    if (dominantElement && dominantElement.count > 0) {
        const elVN = { Fire: 'Lửa', Earth: 'Đất', Air: 'Khí', Water: 'Nước' };
        parts.push(`Nguyên tố chủ đạo: ${elVN[dominantElement.element] || dominantElement.element}`);
    }
    return parts.join('. ') + '.';
}

module.exports = {
    analyze,
    // Expose sub-modules for direct access
    getSunSign,
    getMoonSign,
    getSignPersonality,
    getAllSunSigns,
};
