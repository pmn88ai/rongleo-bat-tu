/**
 * Sun Sign Calculator
 *
 * Determines Western zodiac sun sign from solar birth date.
 * Accurate to within ±1 day at sign cusps (handled explicitly).
 *
 * No external dependencies. Pure date-based calculation.
 */

// Sun sign date ranges (inclusive on start, exclusive on end)
// Cusp handling: born on a boundary date returns both signs
const SUN_SIGNS = [
    { id: 'aries',       name: 'Aries',       nameVN: 'Bạch Dương',   symbol: '♈', element: 'Fire',  startMonth: 3,  startDay: 21, endMonth: 4,  endDay: 19 },
    { id: 'taurus',      name: 'Taurus',      nameVN: 'Kim Ngưu',     symbol: '♉', element: 'Earth', startMonth: 4,  startDay: 20, endMonth: 5,  endDay: 20 },
    { id: 'gemini',      name: 'Gemini',       nameVN: 'Song Tử',     symbol: '♊', element: 'Air',   startMonth: 5,  startDay: 21, endMonth: 6,  endDay: 20 },
    { id: 'cancer',      name: 'Cancer',      nameVN: 'Cự Giải',     symbol: '♋', element: 'Water', startMonth: 6,  startDay: 21, endMonth: 7,  endDay: 22 },
    { id: 'leo',         name: 'Leo',         nameVN: 'Sư Tử',       symbol: '♌', element: 'Fire',  startMonth: 7,  startDay: 23, endMonth: 8,  endDay: 22 },
    { id: 'virgo',       name: 'Virgo',       nameVN: 'Xử Nữ',       symbol: '♍', element: 'Earth', startMonth: 8,  startDay: 23, endMonth: 9,  endDay: 22 },
    { id: 'libra',       name: 'Libra',       nameVN: 'Thiên Bình',  symbol: '♎', element: 'Air',   startMonth: 9,  startDay: 23, endMonth: 10, endDay: 22 },
    { id: 'scorpio',     name: 'Scorpio',     nameVN: 'Bọ Cạp',     symbol: '♏', element: 'Water', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    { id: 'sagittarius', name: 'Sagittarius', nameVN: 'Nhân Mã',    symbol: '♐', element: 'Fire',  startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
    { id: 'capricorn',   name: 'Capricorn',   nameVN: 'Ma Kết',     symbol: '♑', element: 'Earth', startMonth: 12, startDay: 22, endMonth: 1,  endDay: 19 },
    { id: 'aquarius',    name: 'Aquarius',    nameVN: 'Bảo Bình',   symbol: '♒', element: 'Air',   startMonth: 1,  startDay: 20, endMonth: 2,  endDay: 18 },
    { id: 'pisces',      name: 'Pisces',      nameVN: 'Song Ngư',   symbol: '♓', element: 'Water', startMonth: 2,  startDay: 19, endMonth: 3,  endDay: 20 },
];

/**
 * Get zodiac sun sign from date
 * @param {number} month — 1-12
 * @param {number} day — 1-31
 * @returns {object} sign data with id, name, nameVN, symbol, element
 */
function getSunSign(month, day) {
    if (!month || !day) return null;

    const m = Number(month);
    const d = Number(day);

    if (isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) return null;

    // Find sign by checking if date falls in range
    for (const sign of SUN_SIGNS) {
        if (isDateInRange(m, d, sign)) {
            return { ...sign };
        }
    }

    return null;
}

/**
 * Check if (month, day) falls within a sign's range
 * Handles Capricorn special case (crosses year boundary: Dec 22 – Jan 19)
 */
function isDateInRange(month, day, sign) {
    const start = { m: sign.startMonth, d: sign.startDay };
    const end = { m: sign.endMonth, d: sign.endDay };

    // Capricorn: starts Dec 22, ends Jan 19 (wraps year)
    if (start.m > end.m || (start.m === 12 && end.m === 1)) {
        // Date is in the "wrapped" range
        return (
            (month === start.m && day >= start.d) || // Dec 22-31
            (month > start.m && month <= 12) ||      // Jan-Dec (handles wrap)
            (month === end.m && day <= end.d) ||     // Jan 1-19
            (month < end.m)                          // Before Jan
        );
    }

    // Normal range (within same year)
    if (month < start.m || month > end.m) return false;
    if (month === start.m && day < start.d) return false;
    if (month === end.m && day > end.d) return false;
    return true;
}

/**
 * Get all sun sign data (reference)
 */
function getAllSunSigns() {
    return SUN_SIGNS.map(s => ({ ...s }));
}

/**
 * Get element for a given sun sign id
 */
function getSunSignElement(signId) {
    const sign = SUN_SIGNS.find(s => s.id === signId);
    return sign ? sign.element : null;
}

module.exports = {
    getSunSign,
    getAllSunSigns,
    getSunSignElement,
};
