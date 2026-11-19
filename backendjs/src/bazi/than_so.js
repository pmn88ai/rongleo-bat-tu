/**
 * Thần số Pythagoras — module tối thiểu phục vụ "Vận hôm nay".
 *
 * Nguồn quy tắc: BRIEF_VAN_HOM_NAY_20261119.md (mục "Nội dung Vận hôm nay").
 *   - Năm cá nhân   = rút gọn (ngày sinh + tháng sinh + năm hiện tại)
 *   - Tháng cá nhân = rút gọn (năm cá nhân + tháng hiện tại)
 *   - Ngày cá nhân  = rút gọn (tháng cá nhân + ngày hiện tại)
 *   - Rút gọn bằng cách cộng các chữ số tới 1 chữ số,
 *     GIỮ số master 11/22 ở bước cuối (không rút tiếp).
 *
 * Module này chỉ tính ngày cá nhân; không làm thần số đầy đủ (bước 3 mới làm).
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

module.exports = {
    MASTER_NUMBERS,
    sumDigits,
    reduceNumber,
    personalYear,
    personalMonth,
    personalDay,
    computePersonalNumbers
};
