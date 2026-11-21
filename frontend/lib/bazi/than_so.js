/**
 * Thần số Pythagoras.
 *
 * Nguồn quy tắc: BRIEF_VAN_HOM_NAY_20261119.md + TASK-GOM-MUC-THAN-SO-HOC-20261120.md.
 *   - Năm cá nhân   = rút gọn (ngày sinh + tháng sinh + năm hiện tại)
 *   - Tháng cá nhân = rút gọn (năm cá nhân + tháng hiện tại)
 *   - Ngày cá nhân  = rút gọn (tháng cá nhân + ngày hiện tại)
 *   - Rút gọn bằng cách cộng các chữ số tới 1 chữ số,
 *     GIỮ số master 11/22 ở bước cuối (không rút tiếp).
 *
 * Phần thần số đầy đủ dùng hệ Pythagore chuẩn quốc tế:
 *   A=1 B=2 C=3 D=4 E=5 F=6 G=7 H=8 I=9
 *   J=1 K=2 L=3 M=4 N=5 O=6 P=7 Q=8 R=9
 *   S=1 T=2 U=3 V=4 W=5 X=6 Y=7 Z=8
 * Tên tiếng Việt được bỏ dấu (à→a, đ→d…) rồi mới tính, bỏ khoảng trắng khi cộng.
 * Nguyên âm dùng cho Số linh hồn: A, E, I, O, U (Y tính là phụ âm — quy ước của hệ).
 */

const MASTER_NUMBERS = [11, 22];

function sumDigits(n) {
    let total = 0;
    let value = Math.abs(Math.trunc(n));
    while (value > 0) {
        total += value % 10;
        value = Math.floor(value / 10);
    }
    return total;
}

/**
 * Rút gọn một số về 1 chữ số; giữ nguyên 11/22 (master) và không rút tiếp.
 */
function reduceNumber(n) {
    if (!Number.isFinite(n)) {
        throw new TypeError('reduceNumber cần một số hữu hạn');
    }
    let value = Math.abs(Math.trunc(n));
    while (value > 9 && !MASTER_NUMBERS.includes(value)) {
        value = sumDigits(value);
    }
    return value;
}

function requirePositiveInt(value, label) {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) {
        throw new TypeError(`${label} phải là số nguyên dương`);
    }
    return n;
}

/**
 * Năm cá nhân = rút gọn (ngày sinh + tháng sinh + năm hiện tại).
 */
function personalYear({ day, month, year }) {
    const d = requirePositiveInt(day, 'Ngày sinh');
    const m = requirePositiveInt(month, 'Tháng sinh');
    const y = requirePositiveInt(year, 'Năm hiện tại');
    return reduceNumber(d + m + y);
}

/**
 * Tháng cá nhân = rút gọn (năm cá nhân + tháng hiện tại).
 */
function personalMonth(yearNumber, month) {
    const y = requirePositiveInt(yearNumber, 'Năm cá nhân');
    const m = requirePositiveInt(month, 'Tháng hiện tại');
    return reduceNumber(y + m);
}

/**
 * Ngày cá nhân = rút gọn (tháng cá nhân + ngày hiện tại).
 */
function personalDay(monthNumber, day) {
    const m = requirePositiveInt(monthNumber, 'Tháng cá nhân');
    const d = requirePositiveInt(day, 'Ngày hiện tại');
    return reduceNumber(m + d);
}

/**
 * Tính đủ bộ số cá nhân cho một ngày xem.
 *
 * @param {{day:number, month:number, year:number}} birth ngày sinh
 * @param {{day:number, month:number, year:number}} today ngày xem
 */
function computePersonalNumbers(birth, today) {
    const nam = personalYear({
        day: birth.day,
        month: birth.month,
        year: today.year
    });
    const thang = personalMonth(nam, today.month);
    const ngay = personalDay(thang, today.day);

    return {
        nam_ca_nhan: nam,
        thang_ca_nhan: thang,
        ngay_ca_nhan: ngay
    };
}

// ─── Hệ Pythagore đầy đủ ─────────────────────────────────────────────────────

const PYTHAGOREAN_VALUES = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
    J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
    S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
};

const VOWEL_LETTERS = ['A', 'E', 'I', 'O', 'U'];
const CONSONANT_LETTERS = Object.keys(PYTHAGOREAN_VALUES).filter(
    (letter) => !VOWEL_LETTERS.includes(letter)
);

/**
 * Bỏ dấu tiếng Việt: à→a, ă→a, â→a, đ→d, ê→e, ô→o, ơ→o, ư→u…
 * Dùng NFD + xoá dấu kết hợp, xử lý riêng đ/Đ vì Unicode không tách được.
 */
function stripDiacritics(text) {
    return String(text == null ? '' : text)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

/**
 * Chuẩn hoá họ tên về chữ A–Z, viết hoa, gộp khoảng trắng.
 */
function normalizeName(name) {
    return stripDiacritics(name)
        .toUpperCase()
        .replace(/[^A-Z\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function letterValue(letter) {
    return PYTHAGOREAN_VALUES[letter] || 0;
}

function sumLetters(letters) {
    return String(letters || '')
        .split('')
        .reduce((total, letter) => total + letterValue(letter), 0);
}

/**
 * Cộng giá trị các chữ cái, rút gọn từng từ rồi cộng các số đã rút gọn.
 * Giữ master 11/22 ở cả cấp từ và cấp tổng.
 */
function reduceLettersByWords(letters) {
    const words = String(letters || '').trim().split(/\s+/).filter(Boolean);
    const wordNumbers = words.map((word) => reduceNumber(sumLetters(word)));
    const total = wordNumbers.reduce((sum, value) => sum + value, 0);
    return reduceNumber(total);
}

/** Số đường đời: rút gọn tổng các chữ số ngày + tháng + năm sinh. */
function lifePath({ day, month, year }) {
    const d = requirePositiveInt(day, 'Ngày sinh');
    const m = requirePositiveInt(month, 'Tháng sinh');
    const y = requirePositiveInt(year, 'Năm sinh');
    return reduceNumber(sumDigits(d) + sumDigits(m) + sumDigits(y));
}

/** Số sứ mệnh: toàn bộ họ tên. */
function destinyNumber(name) {
    return reduceLettersByWords(normalizeName(name));
}

/** Số linh hồn: chỉ các nguyên âm A/E/I/O/U. */
function soulNumber(name) {
    const letters = normalizeName(name)
        .split(/\s+/)
        .map((word) => word.split('').filter((letter) => VOWEL_LETTERS.includes(letter)).join(''))
        .filter(Boolean)
        .join(' ');
    return reduceLettersByWords(letters);
}

/** Số nhân cách: chỉ các phụ âm. */
function personalityNumber(name) {
    const letters = normalizeName(name)
        .split(/\s+/)
        .map((word) => word.split('').filter((letter) => CONSONANT_LETTERS.includes(letter)).join(''))
        .filter(Boolean)
        .join(' ');
    return reduceLettersByWords(letters);
}

/** Số ngày sinh: rút gọn ngày sinh, giữ 11/22. */
function birthdayNumber(day) {
    return reduceNumber(requirePositiveInt(day, 'Ngày sinh'));
}

/**
 * Tính đủ bộ số thần số học Pythagore.
 *
 * @param {{name:string, day:number, month:number, year:number, currentYear?:number}} input
 */
function computeNumerology({ name, day, month, year, currentYear } = {}) {
    const normalized = normalizeName(name);
    const d = requirePositiveInt(day, 'Ngày sinh');
    const m = requirePositiveInt(month, 'Tháng sinh');
    const y = requirePositiveInt(year, 'Năm sinh');
    const current = currentYear == null ? new Date().getFullYear() : requirePositiveInt(currentYear, 'Năm hiện tại');

    return {
        he_thong: 'Pythagore',
        quy_uoc: 'A=1 … Z=8; bỏ dấu tiếng Việt (đ→d); nguyên âm A/E/I/O/U (Y là phụ âm); giữ nguyên số chủ 11 và 22, không rút gọn thêm.',
        ho_ten_goc: String(name == null ? '' : name).trim(),
        ho_ten_chuan_hoa: normalized,
        ngay_sinh: { day: d, month: m, year: y },
        nam_hien_tai: current,
        cac_so: {
            duong_doi: lifePath({ day: d, month: m, year: y }),
            su_menh: destinyNumber(name),
            linh_hon: soulNumber(name),
            nhan_cach: personalityNumber(name),
            ngay_sinh: birthdayNumber(d),
            nam_ca_nhan: personalYear({ day: d, month: m, year: current })
        }
    };
}

module.exports = {
    MASTER_NUMBERS,
    sumDigits,
    reduceNumber,
    personalYear,
    personalMonth,
    personalDay,
    computePersonalNumbers,
    PYTHAGOREAN_VALUES,
    VOWEL_LETTERS,
    CONSONANT_LETTERS,
    stripDiacritics,
    normalizeName,
    sumLetters,
    reduceLettersByWords,
    lifePath,
    destinyNumber,
    soulNumber,
    personalityNumber,
    birthdayNumber,
    computeNumerology
};
