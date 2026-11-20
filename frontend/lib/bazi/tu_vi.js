/**
 * An sao Tử vi (chính tinh) — port trung thực từ `tu-vi-goc/an_sao_tu_vi.py`.
 *
 * Phạm vi: Mệnh/Thân, Cục, 14 chính tinh, Tứ Hóa.
 * CHƯA có: phụ tinh, Tuần/Triệt, độ sáng sao (nguồn Python chưa có).
 *
 * Quy ước giữ nguyên như Python:
 *  - ngày/tháng là ÂM LỊCH, giờ là Chi (Tý..Hợi), Can năm là tên tiếng Việt.
 *  - `gioi_tinh` được nhận nhưng KHÔNG dùng (Python cũng không dùng).
 *  - bảng BANG_TU_VI, NAP_AM_60, Ngũ Hổ Độn, Tứ Hóa sao chép nguyên văn.
 */

const { Solar, Lunar } = require('lunar-javascript');
const { ganToVN, zhiToVN } = require('./ganzhi');
const lunarViet = require('./lunar_viet');

const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

// Bảng vị trí sao Tử Vi theo (cục số, ngày âm 1-30) — nguồn thayphucloc.com + thayhungtuvi.com.
// Cục: 2 Thủy, 3 Mộc, 4 Kim, 5 Thổ, 6 Hỏa. Mỗi dòng là 1 cục, 30 ngày.
const BANG_TU_VI = {
    2: 'Sửu Dần Dần Mão Mão Thìn Thìn Tỵ Tỵ Ngọ Ngọ Mùi Mùi Thân Thân Dậu Dậu Tuất Tuất Hợi Hợi Tý Tý Sửu Sửu Dần Dần Mão Mão Thìn'.split(' '),
    3: 'Thìn Sửu Dần Tỵ Dần Mão Ngọ Mão Thìn Mùi Thìn Tỵ Thân Tỵ Ngọ Dậu Ngọ Mùi Tuất Mùi Thân Hợi Thân Dậu Tý Dậu Tuất Sửu Tuất Hợi'.split(' '),
    4: 'Hợi Thìn Sửu Dần Tý Tỵ Dần Mão Sửu Ngọ Mão Thìn Dần Mùi Thìn Tỵ Mão Thân Tỵ Ngọ Thìn Dậu Ngọ Mùi Tỵ Tuất Mùi Thân Ngọ Hợi'.split(' '),
    5: 'Ngọ Hợi Thìn Sửu Dần Mùi Tý Tỵ Dần Mão Thân Sửu Ngọ Mão Thìn Dậu Dần Mùi Thìn Tỵ Tuất Mão Thân Tỵ Ngọ Hợi Thìn Dậu Ngọ Mùi'.split(' '),
    6: 'Dậu Ngọ Hợi Thìn Sửu Dần Tuất Mùi Tý Tỵ Dần Mão Hợi Thân Sửu Ngọ Mão Thìn Tý Dậu Dần Mùi Thìn Tỵ Sửu Tuất Mão Thân Tỵ Ngọ'.split(' ')
};

const NAP_AM_60 = [
    'Hải Trung Kim', 'Lư Trung Hỏa', 'Đại Lâm Mộc', 'Lộ Bàng Thổ', 'Kiếm Phong Kim', 'Sơn Đầu Hỏa',
    'Giản Hạ Thủy', 'Thành Đầu Thổ', 'Bạch Lạp Kim', 'Dương Liễu Mộc', 'Tuyền Trung Thủy', 'Ốc Thượng Thổ',
    'Tích Lịch Hỏa', 'Tùng Bách Mộc', 'Trường Lưu Thủy', 'Sa Trung Kim', 'Sơn Hạ Hỏa', 'Bình Địa Mộc',
    'Bích Thượng Thổ', 'Kim Bạch Kim', 'Phú Đăng Hỏa', 'Thiên Hà Thủy', 'Đại Trạch Thổ', 'Thoa Xuyến Kim',
    'Tang Đố Mộc', 'Đại Khê Thủy', 'Sa Trung Thổ', 'Thiên Thượng Hỏa', 'Thạch Lựu Mộc', 'Đại Hải Thủy'
];

const CUC_SO = { 'Thủy': 2, 'Mộc': 3, 'Kim': 4, 'Thổ': 5, 'Hỏa': 6 };
const CUC_TEN = {
    2: 'Thủy nhị cục',
    3: 'Mộc tam cục',
    4: 'Kim tứ cục',
    5: 'Thổ ngũ cục',
    6: 'Hỏa lục cục'
};

const NGU_HO_DON = {
    'Giáp': 'Bính', 'Kỷ': 'Bính',
    'Ất': 'Mậu', 'Canh': 'Mậu',
    'Bính': 'Canh', 'Tân': 'Canh',
    'Đinh': 'Nhâm', 'Nhâm': 'Nhâm',
    'Mậu': 'Giáp', 'Quý': 'Giáp'
};

// can năm: [Lộc, Quyền, Khoa, Kỵ] — bản mặc định Toàn Tập/Kham Thiên (đã chốt 24/10/2026).
const TU_HOA = {
    'Giáp': ['Liêm Trinh', 'Phá Quân', 'Vũ Khúc', 'Thái Dương'],
    'Ất': ['Thiên Cơ', 'Thiên Lương', 'Tử Vi', 'Thái Âm'],
    'Bính': ['Thiên Đồng', 'Thiên Cơ', 'Văn Xương', 'Liêm Trinh'],
    'Đinh': ['Thái Âm', 'Thiên Đồng', 'Thiên Cơ', 'Cự Môn'],
    'Mậu': ['Tham Lang', 'Thái Âm', 'Hữu Bật', 'Thiên Cơ'],
    'Kỷ': ['Vũ Khúc', 'Tham Lang', 'Thiên Lương', 'Văn Khúc'],
    'Canh': ['Thái Dương', 'Vũ Khúc', 'Thái Âm', 'Thiên Đồng'],
    'Tân': ['Cự Môn', 'Thái Dương', 'Văn Khúc', 'Văn Xương'],
    'Nhâm': ['Thiên Lương', 'Tử Vi', 'Tả Phụ', 'Vũ Khúc'],
    'Quý': ['Phá Quân', 'Cự Môn', 'Thái Âm', 'Tham Lang']
};

const HOA_LABELS = ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'];

const CUNG_CHUC_NANG = [
    'Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch', 'Quan Lộc', 'Nô Bộc',
    'Thiên Di', 'Tật Ách', 'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ'
];

function mod(n, m) {
    return ((n % m) + m) % m;
}

function canNamFromYear(year) {
    const y = Number(year);
    if (!Number.isInteger(y)) return null;
    return CAN[mod(y - 4, 10)];
}

function napAm(can, chi) {
    const ci = CAN.indexOf(can);
    const hi = CHI.indexOf(chi);
    if (ci < 0 || hi < 0) {
        throw new Error(`Can Chi không hợp hoa giáp: ${can} ${chi}`);
    }
    for (let idx = 0; idx < 60; idx += 1) {
        if (idx % 10 === ci && idx % 12 === hi) {
            return NAP_AM_60[Math.floor(idx / 2)];
        }
    }
    throw new Error(`Can Chi không hợp hoa giáp: ${can} ${chi}`);
}

function hanhCuaNapAm(na) {
    for (const h of ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ']) {
        if (na.trimEnd().endsWith(h) || na.includes(` ${h}`)) return h;
    }
    return na.split(' ').pop();
}

function anMenhThan(thang, gioChi) {
    const g = CHI.indexOf(gioChi);
    const menh = mod(2 + (thang - 1) - g, 12);
    const than = mod(2 + (thang - 1) + g, 12);
    return { menh, than };
}

function canCung(canNam, chiIdx) {
    const start = CAN.indexOf(NGU_HO_DON[canNam]);
    const steps = mod(chiIdx - 2, 12);
    return CAN[mod(start + steps, 10)];
}

function validateInput(ngayAm, thangAm, gioChi, canNam) {
    if (!Number.isInteger(ngayAm) || ngayAm < 1 || ngayAm > 30) {
        return 'Ngày âm không hợp lệ: cần số nguyên 1–30';
    }
    if (!Number.isInteger(thangAm) || thangAm < 1 || thangAm > 12) {
        return 'Tháng âm không hợp lệ: cần số nguyên 1–12';
    }
    if (!CHI.includes(gioChi)) {
        return 'Giờ Chi không hợp lệ: cần một trong 12 Chi (Tý..Hợi)';
    }
    if (!CAN.includes(canNam)) {
        return 'Can năm không hợp lệ: cần một trong 10 Can (Giáp..Quý)';
    }
    return null;
}

/**
 * Lập lá số Tử vi (chỉ an sao, không luận giải).
 *
 * @param {object} input
 * @param {number} input.ngay_am 1–30
 * @param {number} input.thang_am 1–12
 * @param {string} input.gio_chi Tý..Hợi
 * @param {string} input.can_nam Giáp..Quý
 * @param {string} [input.gioi_tinh] nhận nhưng không dùng (giống Python)
 */
function lapLaSo(input) {
    const ngayAm = Number(input && input.ngay_am);
    const thangAm = Number(input && input.thang_am);
    const gioChi = input && input.gio_chi;
    const canNam = input && input.can_nam;
    const gioiTinh = (input && input.gioi_tinh) || null;

    const invalid = validateInput(ngayAm, thangAm, gioChi, canNam);
    if (invalid) {
        const err = new Error(invalid);
        err.code = 'INVALID_INPUT';
        throw err;
    }

    const { menh: menhI, than: thanI } = anMenhThan(thangAm, gioChi);
    const canMenh = canCung(canNam, menhI);
    const na = napAm(canMenh, CHI[menhI]);
    const hanh = hanhCuaNapAm(na);
    const cuc = CUC_SO[hanh];
    const tuViChi = BANG_TU_VI[cuc][ngayAm - 1];
    const tv = CHI.indexOf(tuViChi);

    const sao = {};
    sao['Tử Vi'] = tv;
    sao['Liêm Trinh'] = mod(tv + 4, 12);
    sao['Thiên Đồng'] = mod(sao['Liêm Trinh'] + 3, 12);
    sao['Vũ Khúc'] = mod(sao['Thiên Đồng'] + 1, 12);
    sao['Thái Dương'] = mod(sao['Vũ Khúc'] + 1, 12);
    sao['Thiên Cơ'] = mod(sao['Thái Dương'] + 2, 12);

    // Thiên Phủ đối xứng Tử Vi qua trục Dần–Thân: x' = (4 - x) mod 12
    const phu = mod(4 - tv, 12);
    sao['Thiên Phủ'] = phu;
    ['Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát']
        .forEach((ten, i) => { sao[ten] = mod(phu + 1 + i, 12); });
    sao['Phá Quân'] = mod(phu + 10, 12);

    const [loc, quyen, khoa, ky] = TU_HOA[canNam];
    const hoaMap = {
        [loc]: 'Hóa Lộc',
        [quyen]: 'Hóa Quyền',
        [khoa]: 'Hóa Khoa',
        [ky]: 'Hóa Kỵ'
    };

    const cung = CUNG_CHUC_NANG.map((tenCung, k) => {
        const chiIdx = mod(menhI - k, 12);
        const cacSao = Object.keys(sao)
            .filter((ten) => sao[ten] === chiIdx)
            .map((ten) => ({ ten, tu_hoa: hoaMap[ten] || null }));
        return {
            cung: tenCung,
            chi: CHI[chiIdx],
            can: canCung(canNam, chiIdx),
            sao: cacSao
        };
    });

    return {
        input: {
            ngay_am: ngayAm,
            thang_am: thangAm,
            gio_chi: gioChi,
            can_nam: canNam,
            gioi_tinh: gioiTinh
        },
        menh: {
            chi: CHI[menhI],
            can: canMenh,
            can_chi: `${canMenh} ${CHI[menhI]}`,
            nap_am: na
        },
        than: {
            chi: CHI[thanI],
            dong_cung: thanI === menhI
        },
        cuc: {
            so: cuc,
            hanh,
            ten: CUC_TEN[cuc]
        },
        tu_vi: tuViChi,
        sao: Object.fromEntries(Object.entries(sao).map(([ten, vi]) => [ten, CHI[vi]])),
        tu_hoa: {
            'Hóa Lộc': loc,
            'Hóa Quyền': quyen,
            'Hóa Khoa': khoa,
            'Hóa Kỵ': ky
        },
        cung
    };
}

// ─── Đường nhập theo ngày dương / âm Việt / âm Trung Hoa ────────────────────

function invalidInput(message) {
    const err = new Error(message);
    err.code = 'INVALID_INPUT';
    return err;
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

/**
 * Quy ước giờ của iztro: 0 = Tý sớm (00:00–00:59), 1..11 = Sửu..Hợi,
 * 12 = Tý muộn (23:00–23:59).
 */
function timeIndexFromHour(hour) {
    const h = Number(hour);
    if (!Number.isInteger(h) || h < 0 || h > 23) return null;
    if (h === 23) return 12;
    return Math.floor((h + 1) / 2) % 12;
}

function gioChiFromTimeIndex(timeIndex) {
    return CHI[timeIndex === 12 ? 0 : timeIndex];
}

function parseTime(gio, phut) {
    let hour;
    let minute;
    if (typeof gio === 'string' && gio.includes(':')) {
        const parts = gio.trim().split(':');
        hour = Number(parts[0]);
        minute = Number(parts[1] || 0);
    } else {
        hour = Number(gio);
        minute = Number(phut || 0);
    }
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
        throw invalidInput('Giờ không hợp lệ: cần 0–23');
    }
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
        throw invalidInput('Phút không hợp lệ: cần 0–59');
    }
    return { hour, minute };
}

function buildTruNgayGio(nam, thang, ngay, hour, minute, lateTy) {
    let solar;
    if (lateTy) {
        const next = Solar.fromYmd(nam, thang, ngay).next(1);
        solar = Solar.fromYmdHms(next.getYear(), next.getMonth(), next.getDay(), 0, 30, 0);
    } else {
        solar = Solar.fromYmdHms(nam, thang, ngay, hour, minute, 0);
    }
    const eightChar = solar.getLunar().getEightChar();
    const truNgay = {
        can: ganToVN(eightChar.getDayGan()),
        chi: zhiToVN(eightChar.getDayZhi())
    };
    const truGio = {
        can: ganToVN(eightChar.getTimeGan()),
        chi: zhiToVN(eightChar.getTimeZhi())
    };
    truNgay.can_chi = `${truNgay.can} ${truNgay.chi}`;
    truGio.can_chi = `${truGio.can} ${truGio.chi}`;
    return { tru_ngay: truNgay, tru_gio: truGio };
}

/**
 * Lập lá số Tử vi từ ngày DƯƠNG lịch + giờ phút (giờ Việt Nam).
 *
 * Quy ước áp dụng (khớp iztro 2.6.3):
 *  - Giờ Tý muộn 23:00–23:59: tính sang ngày kế tiếp (ngày âm + 1; nếu là
 *    ngày cuối tháng thì về mùng 1 nhưng tháng giữ nguyên), KHÔNG điều chỉnh
 *    tháng nhuận.
 *  - Tháng nhuận: fixLeap = true (mặc định iztro) — nửa đầu (ngày ≤ 15) tính
 *    theo tháng nhuận, nửa sau (ngày > 15) tính sang tháng kế tiếp.
 */
function lapLaSoTuDuongLich(input) {
    const nam = Number(input && (input.nam !== undefined ? input.nam : input.year));
    const thang = Number(input && (input.thang !== undefined ? input.thang : input.month));
    const ngay = Number(input && (input.ngay !== undefined ? input.ngay : input.day));

    if (!Number.isInteger(nam) || nam < 1800 || nam > 2199) {
        throw invalidInput('Năm dương không hợp lệ: cần 1800–2199');
    }
    if (!Number.isInteger(thang) || thang < 1 || thang > 12) {
        throw invalidInput('Tháng dương không hợp lệ: cần 1–12');
    }
    if (!Number.isInteger(ngay) || ngay < 1 || ngay > 31) {
        throw invalidInput('Ngày dương không hợp lệ: cần 1–31');
    }

    const { hour, minute } = parseTime(input && input.gio, input && input.phut);
    const timeIndex = timeIndexFromHour(hour);
    const gioChi = gioChiFromTimeIndex(timeIndex);
    const lateTy = timeIndex === 12;

    let solar;
    let lunar;
    try {
        solar = Solar.fromYmd(nam, thang, ngay);
        lunar = solar.getLunar();
    } catch (error) {
        throw invalidInput(`Ngày dương không tồn tại: ${ngay}/${thang}/${nam}`);
    }

    const lunarYear = lunar.getYear();
    const lunarMonth = Math.abs(lunar.getMonth());
    const lunarDay = lunar.getDay();
    const lunarLeap = lunar.getMonth() < 0;

    let anSaoNgay = lunarDay;
    let anSaoThang = lunarMonth;
    let leapAdjusted = false;

    if (lateTy) {
        // iztro: Tý muộn +1 ngày; nếu vượt ngày cuối tháng thì về mùng 1,
        // tháng giữ nguyên; không áp fixLeap.
        const nextLunar = solar.next(1).getLunar();
        anSaoNgay = nextLunar.getDay() === 1 ? 1 : lunarDay + 1;
    } else if (lunarLeap && lunarDay > 15) {
        anSaoThang = lunarMonth + 1;
        if (anSaoThang > 12) anSaoThang = 1;
        leapAdjusted = true;
    }

    const result = lapLaSo({
        ngay_am: anSaoNgay,
        thang_am: anSaoThang,
        gio_chi: gioChi,
        can_nam: canNamFromYear(lunarYear),
        gioi_tinh: input && input.gioi_tinh
    });

    const tru = buildTruNgayGio(nam, thang, ngay, hour, minute, lateTy);

    let quyUoc;
    if (lateTy) {
        quyUoc = 'gio Ty 23:00-23:59 theo iztro: tinh sang ngay ke tiep (thang giu nguyen, khong fix thang nhuan)';
    } else if (leapAdjusted) {
        quyUoc = 'thang nhuan theo iztro fixLeap=true: nua sau (ngay > 15) tinh sang thang ke tiep';
    } else if (lunarLeap) {
        quyUoc = 'thang nhuan theo iztro fixLeap=true: nua dau (ngay <= 15) tinh theo thang nhuan';
    } else {
        quyUoc = 'khong ap dung quy uoc dac biet';
    }

    return {
        ...result,
        nguon: {
            lich: 'duong',
            duong_lich: `${nam}-${pad2(thang)}-${pad2(ngay)}`,
            gio: `${pad2(hour)}:${pad2(minute)}`,
            gio_chi: gioChi,
            gio_index_iztro: timeIndex,
            am_trung_hoa: {
                nam: lunarYear,
                thang: lunarMonth,
                ngay: lunarDay,
                nhuan: lunarLeap
            },
            da_an_sao_bang: {
                ngay_am: anSaoNgay,
                thang_am: anSaoThang
            },
            quy_uoc: quyUoc
        },
        tru_ngay: tru.tru_ngay,
        tru_gio: tru.tru_gio
    };
}

/**
 * Lập lá số Tử vi từ ngày ÂM TRUNG HOA (lịch iztro/lunar-javascript).
 * Dùng cho đường cũ: khách nhập ngày âm Trung Hoa, có thể kèm tháng nhuận.
 */
function lapLaSoTuAmTrungHoa(input) {
    const nam = Number(input && (input.nam_am !== undefined ? input.nam_am : input.nam));
    const thang = Number(input && (input.thang_am !== undefined ? input.thang_am : input.thang));
    const ngay = Number(input && (input.ngay_am !== undefined ? input.ngay_am : input.ngay));
    const nhuan = Boolean(input && input.thang_nhuan);

    if (!Number.isInteger(nam) || nam < 1800 || nam > 2199) {
        throw invalidInput('Năm âm không hợp lệ: cần 1800–2199');
    }
    if (!Number.isInteger(thang) || thang < 1 || thang > 12) {
        throw invalidInput('Tháng âm không hợp lệ: cần 1–12');
    }
    if (!Number.isInteger(ngay) || ngay < 1 || ngay > 30) {
        throw invalidInput('Ngày âm không hợp lệ: cần 1–30');
    }

    let solar;
    try {
        const lunar = Lunar.fromYmd(nam, nhuan ? -thang : thang, ngay);
        solar = lunar.getSolar();
    } catch (error) {
        throw invalidInput(`Ngày âm Trung Hoa không tồn tại: ${ngay}/${thang}${nhuan ? ' nhuận' : ''}/${nam}`);
    }

    const result = lapLaSoTuDuongLich({
        nam: solar.getYear(),
        thang: solar.getMonth(),
        ngay: solar.getDay(),
        gio: input && input.gio,
        phut: input && input.phut,
        gioi_tinh: input && input.gioi_tinh
    });
    result.nguon.lich = 'am_trung_hoa';
    result.nguon.am_nhap = { nam, thang, ngay, nhuan };
    return result;
}

/**
 * Lập lá số Tử vi từ ngày ÂM VIỆT NAM.
 *
 * Quy đổi âm Việt → dương bằng lịch Việt (Hồ Ngọc Đức, UTC+7), rồi mới an sao
 * trên ngày dương đó (iztro dùng lịch Trung Hoa để an sao). Nhờ vậy các tháng
 * lịch Việt lệch 1 ngày so với lịch Trung Hoa vẫn ra đúng lá số.
 */
function lapLaSoTuAmViet(input) {
    const nam = Number(input && (input.nam_am !== undefined ? input.nam_am : input.nam));
    const thang = Number(input && (input.thang_am !== undefined ? input.thang_am : input.thang));
    const ngay = Number(input && (input.ngay_am !== undefined ? input.ngay_am : input.ngay));
    const nhuan = Boolean(input && input.thang_nhuan);

    if (!Number.isInteger(nam) || nam < 1800 || nam > 2199) {
        throw invalidInput('Năm âm Việt không hợp lệ: cần 1800–2199');
    }
    if (!Number.isInteger(thang) || thang < 1 || thang > 12) {
        throw invalidInput('Tháng âm Việt không hợp lệ: cần 1–12');
    }
    if (!Number.isInteger(ngay) || ngay < 1 || ngay > 30) {
        throw invalidInput('Ngày âm Việt không hợp lệ: cần 1–30');
    }

    const solar = lunarViet.lunarToSolar(ngay, thang, nam, nhuan);
    if (!solar) {
        throw invalidInput(`Ngày âm Việt không tồn tại: ${ngay}/${thang}${nhuan ? ' nhuận' : ''}/${nam}`);
    }

    const result = lapLaSoTuDuongLich({
        nam: solar.year,
        thang: solar.month,
        ngay: solar.day,
        gio: input && input.gio,
        phut: input && input.phut,
        gioi_tinh: input && input.gioi_tinh
    });
    result.nguon.lich = 'am_viet';
    result.nguon.am_nhap = { nam, thang, ngay, nhuan };
    result.nguon.am_viet = { nam, thang, ngay, nhuan };
    return result;
}

module.exports = {
    CHI,
    CAN,
    BANG_TU_VI,
    NAP_AM_60,
    TU_HOA,
    HOA_LABELS,
    CUNG_CHUC_NANG,
    canNamFromYear,
    napAm,
    anMenhThan,
    canCung,
    lapLaSo,
    timeIndexFromHour,
    gioChiFromTimeIndex,
    lapLaSoTuDuongLich,
    lapLaSoTuAmTrungHoa,
    lapLaSoTuAmViet
};
