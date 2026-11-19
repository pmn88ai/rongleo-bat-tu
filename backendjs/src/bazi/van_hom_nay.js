/**
 * Service "Vận hôm nay" — 4 món theo BRIEF_VAN_HOM_NAY_20261119.md.
 *
 * Chỉ ĐỌC engine đã chốt (calculator, ganzhi, phan_tich/ngu_hanh).
 * Không sửa engine, không lưu hồ sơ, không gọi mạng.
 */

const { Solar } = require('lunar-javascript');
const ganzhi = require('./ganzhi');
const BaZiCalculator = require('./calculator');
const { analyzeNguHanh } = require('./phan_tich/ngu_hanh');
const { computePersonalNumbers } = require('./than_so');

const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

const THREE_PILLAR_NOTE = 'Chưa có giờ sinh nên dụng thần chỉ tính từ 3 trụ (năm/tháng/ngày), kết luận sơ bộ — có giờ sinh sẽ chính xác hơn.';

const RESOURCE_OF = {
    'Mộc': 'Thủy',
    'Hỏa': 'Mộc',
    'Thổ': 'Hỏa',
    'Kim': 'Thổ',
    'Thủy': 'Kim'
};

const LABELS = {
    can_chi: 'Can chi hôm nay',
    than_so: 'Ngày cá nhân thần số',
    doi_chieu: 'Đối chiếu ngày với lá số',
    loi_nhan: 'Lời nhắn hôm nay'
};

const LEVELS = {
    thuan: 'thuận',
    binh_thuong: 'bình thường',
    tranh: 'nên tránh việc lớn',
    chua_du_can_cu: 'chưa đủ căn cứ'
};

// Mẫu câu cố định — không viết tự do (theo brief).
const MESSAGES = {
    [LEVELS.thuan]: 'Hôm nay hợp làm việc quan trọng, cứ tiến hành từ từ.',
    [LEVELS.binh_thuong]: 'Hôm nay bình thường, làm việc như mọi ngày.',
    [LEVELS.tranh]: 'Hôm nay nên giữ sức, việc lớn để hôm khác.',
    [LEVELS.chua_du_can_cu]: 'Chưa đủ căn cứ để kết luận hôm nay, cứ làm việc như thường.'
};

function invalidDate(message) {
    const err = new Error(message);
    err.code = 'INVALID_DATE';
    return err;
}

function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Nhận ngày dạng YYYY-MM-DD (dương lịch), kiểm tra hợp lệ.
 */
function parseIsoDate(value) {
    if (typeof value !== 'string') {
        throw invalidDate('Ngày sinh không hợp lệ: cần dạng YYYY-MM-DD');
    }
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) {
        throw invalidDate('Ngày sinh không hợp lệ: cần dạng YYYY-MM-DD');
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
        throw invalidDate('Ngày sinh không tồn tại trong lịch dương');
    }
    return { year, month, day };
}

function parseHour(value) {
    if (value === undefined || value === null || value === '') {
        return { co_gio_sinh: false, hour: 12 };
    }
    const hour = Number(value);
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
        throw invalidDate('Giờ sinh không hợp lệ: cần số nguyên 0–23');
    }
    return { co_gio_sinh: true, hour };
}

function isFemale(gender) {
    if (!gender || typeof gender !== 'string') return false;
    const g = gender.trim().toLowerCase();
    return g === 'nữ' || g === 'nu' || g === 'female';
}

function formatAmLich(lunar) {
    const month = lunar.getMonth();
    const isLeap = month < 0;
    return `Ngày ${lunar.getDay()} tháng ${Math.abs(month)}${isLeap ? ' nhuận' : ''} năm ${lunar.getYear()}`;
}

/**
 * Can chi của một ngày dương lịch, lấy từ lunar-javascript (không tự tính).
 */
function getDayCanChi(year, month, day) {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    const chinese = lunar.getDayInGanZhi();
    return {
        can_cn: chinese.charAt(0),
        chi_cn: chinese.charAt(1),
        can: ganzhi.ganToVN(chinese.charAt(0)),
        chi: ganzhi.zhiToVN(chinese.charAt(1)),
        can_chi: `${ganzhi.ganToVN(chinese.charAt(0))} ${ganzhi.zhiToVN(chinese.charAt(1))}`,
        am_lich: formatAmLich(lunar)
    };
}

/**
 * Đối chiếu ngày với lá số — Mô hình Tầng 1.
 *
 * Chỉ dùng các tín hiệu brief nêu rõ:
 *  - ngày sinh / đồng hành với dụng thần → thuận
 *  - ngày khắc dụng thần, hoặc chi ngày xung chi ngày sinh → nên tránh việc lớn
 *  - không có tín hiệu nào rõ → bình thường
 *  - chưa xác định được dụng thần → chưa đủ căn cứ
 *
 * Tín hiệu "tránh" được ưu tiên khi trùng với tín hiệu "thuận"; brief chưa
 * định nghĩa trường hợp xung đột nên service ghi rõ lý do trong `ly_do`.
 */
function doiChieuVoiLaSo({ chart, nguHanh, todayGanCn, todayZhiCn }) {
    const nhatChu = chart.gans[2];
    const dungThan = (nguHanh.dung_than && nguHanh.dung_than.ngu_hanh) || [];
    const kyThan = (nguHanh.ky_than && nguHanh.ky_than.ngu_hanh) || [];

    const todayGanEle = ganzhi.ganToElement(todayGanCn);
    const todayZhiEle = ganzhi.zhiToElement(todayZhiCn);
    const thapThanCode = ganzhi.getThapThan(nhatChu, todayGanCn);
    const thapThan = ganzhi.toGodFullName(thapThanCode) || 'chưa xác định được';

    const lyDo = [];
    let supportsDungThan = false;
    let controlsDungThan = false;

    if (dungThan.length === 0) {
        lyDo.push('Chưa xác định được dụng thần của lá số nên chưa thể đối chiếu.');
        return {
            ket_luan: LEVELS.chua_du_can_cu,
            thap_than: thapThan,
            thap_than_code: thapThanCode,
            ngu_hanh_ngay: { can: todayGanEle, chi: todayZhiEle },
            dung_than: dungThan,
            ky_than: kyThan,
            ly_do: lyDo
        };
    }

    for (const [label, ele] of [['Can ngày', todayGanEle], ['Chi ngày', todayZhiEle]]) {
        if (dungThan.includes(ele)) {
            supportsDungThan = true;
            lyDo.push(`${label} thuộc ${ele}, trùng dụng thần.`);
        } else if (dungThan.some(d => ganzhi.generates(ele, d))) {
            supportsDungThan = true;
            lyDo.push(`${label} thuộc ${ele}, sinh cho dụng thần.`);
        }
        if (dungThan.some(d => ganzhi.controls(ele, d))) {
            controlsDungThan = true;
            lyDo.push(`${label} thuộc ${ele}, khắc dụng thần.`);
        }
    }

    const nhatChi = chart.zhis[2];
    const isXungChiNgay = ganzhi.CHONGS[nhatChi] === todayZhiCn;
    if (isXungChiNgay) {
        lyDo.push(
            `Chi ngày hôm nay (${ganzhi.zhiToVN(todayZhiCn)}) xung chi ngày sinh (${ganzhi.zhiToVN(nhatChi)}).`
        );
    }

    let ketLuan;
    if (isXungChiNgay || controlsDungThan) {
        ketLuan = LEVELS.tranh;
        if (isXungChiNgay && controlsDungThan) {
            lyDo.push('Có cả xung chi ngày và khắc dụng thần; xét mức "nên tránh việc lớn".');
        }
    } else if (supportsDungThan) {
        ketLuan = LEVELS.thuan;
    } else {
        ketLuan = LEVELS.binh_thuong;
        lyDo.push('Không có tín hiệu sinh/trùng dụng thần hay khắc dụng thần, xung chi ngày.');
    }

    // Thập thần chỉ hiển thị để tham khảo; brief không định nghĩa "thập thần tốt"
    // nên không dùng nó để chốt kết luận.
    lyDo.push(`Thập thần can ngày so với Nhật chủ: ${thapThan} (chỉ để tham khảo).`);

    return {
        ket_luan: ketLuan,
        thap_than: thapThan,
        thap_than_code: thapThanCode,
        ngu_hanh_ngay: { can: todayGanEle, chi: todayZhiEle },
        dung_than: dungThan,
        ky_than: kyThan,
        ly_do: lyDo
    };
}

function computeElementsFromThreePillars(gans, zhis) {
    const elements = { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };

    for (const gan of gans) {
        const element = ganzhi.GAN5[gan] || ganzhi.ganToElement(gan);
        if (elements[element] !== undefined) {
            elements[element] += 5;
        }
    }

    for (const zhi of [...zhis, zhis[1]]) {
        const hiddenStems = ganzhi.ZHI5[zhi];
        if (!hiddenStems) continue;
        for (const [hiddenGan, weight] of Object.entries(hiddenStems)) {
            const element = ganzhi.GAN5[hiddenGan];
            if (element && elements[element] !== undefined) {
                elements[element] += weight;
            }
        }
    }

    return elements;
}

function pickNeutralGanForStemSupportCheck(dayElement) {
    const resourceElement = RESOURCE_OF[dayElement];
    return ganzhi.GANS.find((gan) => {
        const element = ganzhi.ganToElement(gan);
        return element !== dayElement && element !== resourceElement;
    });
}

/**
 * Dụng thần tính từ 3 trụ (năm/tháng/ngày) khi không có giờ sinh.
 * Chỉ đọc engine; không dùng trụ giờ placeholder.
 */
function analyzeNguHanhBaTru(chart) {
    const gans = chart.gans.slice(0, 3);
    const zhis = chart.zhis.slice(0, 3);
    const elements = computeElementsFromThreePillars(gans, zhis);
    const dayElement = ganzhi.ganToElement(gans[2]);

    const ctx = {
        gans: [...gans, pickNeutralGanForStemSupportCheck(dayElement)],
        zhis,
        elements,
        scores: { ngu_hanh_vn: elements }
    };

    return {
        ngu_hanh: analyzeNguHanh(ctx),
        gans,
        zhis,
        elements
    };
}

function todayParts(now) {
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
    };
}

/**
 * Tính "Vận hôm nay".
 *
 * @param {object} input
 * @param {string} input.ngay_sinh 'YYYY-MM-DD' (bắt buộc)
 * @param {number|string} [input.gio_sinh] giờ sinh 0–23 (tùy chọn)
 * @param {string} [input.gioi_tinh] 'Nam' | 'Nữ' (nhận và giữ, chưa dùng để luận)
 * @param {{today?: Date}} [options] dùng cho test (mặc định hôm nay)
 */
function computeVanHomNay(input, options = {}) {
    const birth = parseIsoDate(input && input.ngay_sinh);
    const { co_gio_sinh, hour } = parseHour(input && input.gio_sinh);

    const now = (options.today instanceof Date && !Number.isNaN(options.today.getTime()))
        ? options.today
        : new Date();
    const today = todayParts(now);

    // 1. Can chi hôm nay [TÍNH]
    const dayCanChi = getDayCanChi(today.year, today.month, today.day);

    // 2. Ngày cá nhân thần số [TÍNH]
    const personal = computePersonalNumbers(birth, today);

    // Lá số người dùng: nếu không có giờ sinh thì chỉ dùng phần không cần giờ.
    const chart = new BaZiCalculator({
        year: birth.year,
        month: birth.month,
        day: birth.day,
        hour,
        minute: 0,
        isFemale: isFemale(input && input.gioi_tinh),
        isSolar: true
    }).calculate();
    const nguHanh = co_gio_sinh ? analyzeNguHanh(chart) : analyzeNguHanhBaTru(chart).ngu_hanh;

    // 3. Đối chiếu ngày với lá số [MÔ HÌNH Tầng 1]
    const doiChieu = doiChieuVoiLaSo({
        chart,
        nguHanh,
        todayGanCn: dayCanChi.can_cn,
        todayZhiCn: dayCanChi.chi_cn
    });

    // 4. 1–2 câu ngắn theo mẫu cố định
    const loiNhan = MESSAGES[doiChieu.ket_luan];

    const duongLich = `${String(today.day).padStart(2, '0')}/${String(today.month).padStart(2, '0')}/${today.year}`;
    const weekday = WEEKDAYS[new Date(today.year, today.month - 1, today.day).getDay()];

    const gioiHan = [];
    if (!co_gio_sinh) {
        gioiHan.push('Chưa có giờ sinh nên chưa tính phần cần giờ sinh (trụ giờ, đại vận, lưu niên).');
    }
    gioiHan.push('Không lưu hồ sơ; kết quả chỉ dùng trong phiên xem này.');
    gioiHan.push('Đối chiếu theo Mô hình Tầng 1 (thập thần can ngày + ngũ hành so với dụng/kỵ thần), không phải luận giải đầy đủ.');

    return {
        ngay_sinh: `${birth.year}-${String(birth.month).padStart(2, '0')}-${String(birth.day).padStart(2, '0')}`,
        co_gio_sinh,
        ...(co_gio_sinh ? {} : { so_bo: true, ghi_chu_so_bo: THREE_PILLAR_NOTE }),
        ngay: {
            duong_lich: duongLich,
            thu: weekday,
            am_lich: dayCanChi.am_lich
        },
        ket_qua: [
            {
                nhan: LABELS.can_chi,
                loai: 'TINH',
                noi_dung: {
                    can_chi: dayCanChi.can_chi,
                    can: dayCanChi.can,
                    chi: dayCanChi.chi,
                    am_lich: dayCanChi.am_lich
                },
                ghi_chu: 'Tính từ lunar-javascript (ngày dương → âm → can chi ngày).'
            },
            {
                nhan: LABELS.than_so,
                loai: 'TINH',
                noi_dung: {
                    nam_ca_nhan: personal.nam_ca_nhan,
                    thang_ca_nhan: personal.thang_ca_nhan,
                    ngay_ca_nhan: personal.ngay_ca_nhan
                },
                ghi_chu: 'Thần số Pythagoras: năm → tháng → ngày cá nhân; giữ master 11/22.'
            },
            {
                nhan: LABELS.doi_chieu,
                loai: 'MO_HINH_TANG_1',
                noi_dung: doiChieu,
                ghi_chu: 'Chỉ kết luận ở 3 mức thuận / bình thường / nên tránh việc lớn; thiếu căn cứ thì ghi rõ.'
            },
            {
                nhan: LABELS.loi_nhan,
                loai: 'MAU_CO_DINH',
                noi_dung: {
                    ket_luan: doiChieu.ket_luan,
                    cau: loiNhan
                },
                ghi_chu: 'Câu mẫu cố định theo kết quả đối chiếu.'
            }
        ],
        gioi_han: gioiHan
    };
}

module.exports = {
    LABELS,
    LEVELS,
    MESSAGES,
    THREE_PILLAR_NOTE,
    parseIsoDate,
    parseHour,
    getDayCanChi,
    doiChieuVoiLaSo,
    analyzeNguHanhBaTru,
    computeVanHomNay
};
