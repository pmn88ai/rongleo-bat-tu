/**
 * Moon Sign Calculator (Simplified)
 *
 * Calculates an approximate moon zodiac sign based on date.
 *
 * LIMITATIONS:
 * - Uses a simplified 2.3-day-per-sign cycle from a known reference date.
 * - Does NOT use ephemeris data. Accuracy is ±1 sign.
 * - For professional accuracy, use Swiss Ephemeris or similar.
 *
 * Confidence: LOW — provided for personality context, NOT for astrological prediction.
 *
 * Reference: Moon position on 2000-01-01 was approximately in Virgo.
 * Moon completes 12-sign cycle in ~27.3 days (~2.275 days per sign).
 */

const MOON_CYCLE_DAYS = 27.321661; // Sidereal lunar month
const SIGNS_PER_CYCLE = 12;
const DAYS_PER_SIGN = MOON_CYCLE_DAYS / SIGNS_PER_CYCLE; // ~2.277 days

// Moon was approximately in Virgo (index 5) on 2000-01-01 00:00 UTC
// Index order: Aries=0, Taurus=1, ..., Pisces=11
const REFERENCE_DATE = new Date(2000, 0, 1, 0, 0, 0);
const REFERENCE_SIGN_INDEX = 5; // Virgo

const MOON_SIGNS = [
    { id: 'aries',       name: 'Aries',       nameVN: 'Bạch Dương', symbol: '♈', element: 'Fire' },
    { id: 'taurus',      name: 'Taurus',      nameVN: 'Kim Ngưu',   symbol: '♉', element: 'Earth' },
    { id: 'gemini',      name: 'Gemini',       nameVN: 'Song Tử',   symbol: '♊', element: 'Air' },
    { id: 'cancer',      name: 'Cancer',      nameVN: 'Cự Giải',   symbol: '♋', element: 'Water' },
    { id: 'leo',         name: 'Leo',         nameVN: 'Sư Tử',     symbol: '♌', element: 'Fire' },
    { id: 'virgo',       name: 'Virgo',       nameVN: 'Xử Nữ',     symbol: '♍', element: 'Earth' },
    { id: 'libra',       name: 'Libra',       nameVN: 'Thiên Bình', symbol: '♎', element: 'Air' },
    { id: 'scorpio',     name: 'Scorpio',     nameVN: 'Bọ Cạp',    symbol: '♏', element: 'Water' },
    { id: 'sagittarius', name: 'Sagittarius', nameVN: 'Nhân Mã',    symbol: '♐', element: 'Fire' },
    { id: 'capricorn',   name: 'Capricorn',   nameVN: 'Ma Kết',    symbol: '♑', element: 'Earth' },
    { id: 'aquarius',    name: 'Aquarius',    nameVN: 'Bảo Bình',  symbol: '♒', element: 'Air' },
    { id: 'pisces',      name: 'Pisces',      nameVN: 'Song Ngư',  symbol: '♓', element: 'Water' },
];

/**
 * Get approximate moon sign for a given birth date
 * @param {number} year
 * @param {number} month — 1-12
 * @param {number} day — 1-31
 * @returns {object|null} sign data + confidence note
 */
function getMoonSign(year, month, day) {
    if (!year || !month || !day) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    if (isNaN(birthDate.getTime())) return null;

    // Calculate days since reference
    const diffMs = birthDate.getTime() - REFERENCE_DATE.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Calculate moon sign index
    // Moon moves forward ~1 sign every DAYS_PER_SIGN days
    let signIndex = Math.floor(diffDays / DAYS_PER_SIGN);
    // Normalize to 0-11
    signIndex = ((signIndex % SIGNS_PER_CYCLE) + SIGNS_PER_CYCLE) % SIGNS_PER_CYCLE;

    // Apply reference offset
    const finalIndex = ((signIndex + REFERENCE_SIGN_INDEX) % SIGNS_PER_CYCLE + SIGNS_PER_CYCLE) % SIGNS_PER_CYCLE;

    const sign = MOON_SIGNS[finalIndex];

    return {
        ...sign,
        _confidence: 'low',
        _warning: 'Approximate calculation ±1 sign. For professional accuracy, use Swiss Ephemeris.',
    };
}

module.exports = {
    getMoonSign,
    MOON_SIGNS,
};
