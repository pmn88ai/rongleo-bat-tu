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
    lapLaSo
};
