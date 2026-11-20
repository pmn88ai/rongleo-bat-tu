/**
 * Quy đổi Âm lịch Việt Nam ↔ Dương lịch — thuật toán Hồ Ngọc Đức.
 *
 * Chuẩn dùng cho lịch Việt Nam: múi giờ UTC+7 (kinh tuyến 105°E).
 * Thuật toán gốc: https://www.informatik.uni-leipzig.de/~duc/amlich/
 *
 * Lưu ý: lịch Việt Nam có thể lệch 1 ngày so với lịch Trung Hoa ở một số
 * tháng (do khác múi giờ/kinh tuyến tính ngày sóc). Vì vậy khi khách nhập
 * ngày âm Việt, phải quy đổi âm Việt → dương bằng module này; KHÔNG dùng
 * lịch Trung Hoa để quy đổi ngày âm Việt.
 */

const VN_TIMEZONE = 7;

const PI = Math.PI;

function jdFromDate(dd, mm, yy) {
    const a = Math.floor((14 - mm) / 12);
    const y = yy + 4800 - a;
    const m = mm + 12 * a - 3;
    let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y
        + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    if (jd < 2299161) {
        jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y
            + Math.floor(y / 4) - 32083;
    }
    return jd;
}

function jdToDate(jd) {
    let a;
    let b;
    let c;
    let d;
    let e;
    let m;
    if (jd > 2299160) {
        a = jd + 32044;
        b = Math.floor((4 * a + 3) / 146097);
        c = a - Math.floor((146097 * b) / 4);
    } else {
        b = 0;
        c = jd + 32082;
    }
    d = Math.floor((4 * c + 3) / 1461);
    e = c - Math.floor((1461 * d) / 4);
    m = Math.floor((5 * e + 2) / 153);
    const day = e - Math.floor((153 * m + 2) / 5) + 1;
    const month = m + 3 - 12 * Math.floor(m / 10);
    const year = 100 * b + d - 4800 + Math.floor(m / 10);
    return { day, month, year };
}

function newMoon(k) {
    const T = k / 1236.85;
    const T2 = T * T;
    const T3 = T2 * T;
    const dr = PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr)
        + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));

    let deltat;
    if (T < -11) {
        deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3
            - 0.000000081 * T * T3;
    } else {
        deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    }
    return Jd1 + C1 - deltat;
}

function sunLongitude(jdn) {
    const T = (jdn - 2451545.0) / 36525;
    const T2 = T * T;
    const dr = PI / 180;
    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M)
        + 0.000290 * Math.sin(dr * 3 * M);
    let L = (L0 + DL) * dr;
    L -= PI * 2 * Math.floor(L / (PI * 2));
    return L;
}

function getNewMoonDay(k, timeZone) {
    return Math.floor(newMoon(k) + 0.5 + timeZone / 24);
}

function getSunLongitude(dayNumber, timeZone) {
    return Math.floor(sunLongitude(dayNumber - 0.5 - timeZone / 24) / PI * 6);
}

function getLunarMonth11(yy, timeZone) {
    const off = jdFromDate(31, 12, yy) - 2415021;
    const k = Math.floor(off / 29.530588853);
    let nm = getNewMoonDay(k, timeZone);
    if (getSunLongitude(nm, timeZone) >= 9) {
        nm = getNewMoonDay(k - 1, timeZone);
    }
    return nm;
}

function getLeapMonthOffset(a11, timeZone) {
    const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last = 0;
    let i = 1;
    let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    do {
        last = arc;
        i += 1;
        arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    } while (arc !== last && i < 14);
    return i - 1;
}

/**
 * Dương lịch → Âm lịch Việt.
 * @returns {{day:number, month:number, year:number, isLeap:boolean}}
 */
function solarToLunar(day, month, year, timeZone = VN_TIMEZONE) {
    const dayNumber = jdFromDate(day, month, year);
    const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);

    let a11 = getLunarMonth11(year, timeZone);
    let b11 = a11;
    let lunarYear;
    if (a11 >= monthStart) {
        lunarYear = year;
        a11 = getLunarMonth11(year - 1, timeZone);
    } else {
        lunarYear = year + 1;
        b11 = getLunarMonth11(year + 1, timeZone);
    }

    const lunarDay = dayNumber - monthStart + 1;
    const diff = Math.floor((monthStart - a11) / 29);
    let lunarLeap = 0;
    let lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
        const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
        if (diff >= leapMonthDiff) {
            lunarMonth = diff + 10;
            if (diff === leapMonthDiff) lunarLeap = 1;
        }
    }
    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;

    return {
        day: lunarDay,
        month: lunarMonth,
        year: lunarYear,
        isLeap: lunarLeap === 1
    };
}

/**
 * Âm lịch Việt → Dương lịch.
 * Trả về null nếu ngày/tháng không tồn tại (vd xin tháng nhuận không đúng,
 * hoặc ngày 30 của tháng chỉ có 29 ngày).
 * @returns {{day:number, month:number, year:number}|null}
 */
function lunarToSolar(day, month, year, isLeap = false, timeZone = VN_TIMEZONE) {
    if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
        return null;
    }
    if (day < 1 || day > 30 || month < 1 || month > 12) return null;
    if (year < 1800 || year > 2199) return null;

    let a11;
    let b11;
    if (month < 11) {
        a11 = getLunarMonth11(year - 1, timeZone);
        b11 = getLunarMonth11(year, timeZone);
    } else {
        a11 = getLunarMonth11(year, timeZone);
        b11 = getLunarMonth11(year + 1, timeZone);
    }

    const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    let off = month - 11;
    if (off < 0) off += 12;
    if (b11 - a11 > 365) {
        const leapOff = getLeapMonthOffset(a11, timeZone);
        let leapMonth = leapOff - 2;
        if (leapMonth < 0) leapMonth += 12;
        if (isLeap && month !== leapMonth) return null;
        if (isLeap || off >= leapOff) off += 1;
    } else if (isLeap) {
        return null;
    }

    const monthStart = getNewMoonDay(k + off, timeZone);
    const solar = jdToDate(monthStart + day - 1);

    const check = solarToLunar(solar.day, solar.month, solar.year, timeZone);
    if (check.day !== day || check.month !== month
        || check.year !== year || check.isLeap !== Boolean(isLeap)) {
        return null;
    }
    return solar;
}

/**
 * Số ngày của một tháng âm Việt (29 hoặc 30).
 */
function lunarMonthDays(month, year, isLeap = false, timeZone = VN_TIMEZONE) {
    const first = lunarToSolar(1, month, year, isLeap, timeZone);
    if (!first) return null;
    let days = 29;
    if (lunarToSolar(30, month, year, isLeap, timeZone)) days = 30;
    return days;
}

module.exports = {
    VN_TIMEZONE,
    jdFromDate,
    jdToDate,
    solarToLunar,
    lunarToSolar,
    lunarMonthDays
};
