/**
 * Tóm tắt lá số Tử vi để chèn vào prompt luận giải (/api/consultant/ask).
 *
 * Chỉ dùng để mô tả kết quả an sao đã có sẵn (Mệnh/Thân, Cục, 14 chính tinh,
 * Tứ Hóa), KHÔNG luận giải và KHÔNG thay đổi hành vi của API /api/tu-vi.
 */

const { lapLaSoTuDuongLich, lapLaSoTuAmViet } = require('./tu_vi');

const CHINH_TINH = [
    'Tử Vi', 'Liêm Trinh', 'Thiên Đồng', 'Vũ Khúc', 'Thái Dương', 'Thiên Cơ', 'Thiên Phủ',
    'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'
];

const HOA_ORDER = ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'];

function pad2(n) {
    return String(n).padStart(2, '0');
}

function isMissing(value) {
    return value === undefined || value === null || value === '';
}

function isLunarCalendar(calendar) {
    const c = String(calendar || '').toLowerCase();
    return c === 'lunar' || c === 'am' || c === 'am_lich' || c === 'âm' || c === 'âm lịch';
}

function formatTuViSummary(chart) {
    const thanChi = chart.than.dong_cung
        ? `${chart.than.chi} (đồng cung Mệnh)`
        : chart.than.chi;

    const chinhTinh = CHINH_TINH
        .map((sao) => `${sao} tại ${chart.sao[sao]}`)
        .join(', ');

    const tuHoa = HOA_ORDER
        .map((label) => {
            const sao = chart.tu_hoa[label];
            if (!sao) return null;
            const vi = chart.sao[sao];
            return vi ? `${sao} ${label} (tại ${vi})` : `${sao} ${label}`;
        })
        .filter(Boolean)
        .join(', ');

    return `Lá số Tử vi (an sao tự động): Mệnh tại ${chart.menh.chi} (${chart.menh.can_chi}), ` +
        `Thân tại ${thanChi}, Cục ${chart.cuc.so} (${chart.cuc.ten}); ` +
        `14 chính tinh: ${chinhTinh}; ` +
        `Tứ Hóa năm sinh: ${tuHoa}`;
}

/**
 * Trả về `{ summary }` nếu an sao được, hoặc `{ note }` nếu thiếu dữ liệu.
 * Không ném lỗi ra ngoài để không chặn câu hỏi của người dùng.
 */
function buildTuViPromptContext(input) {
    const data = input || {};
    const year = Number(data.year);
    const month = Number(data.month);
    const day = Number(data.day);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return { note: 'Chưa có lá số Tử vi vì hồ sơ thiếu ngày sinh.' };
    }

    if (isMissing(data.hour)) {
        return {
            note: 'Chưa có lá số Tử vi vì hồ sơ thiếu giờ sinh (không rõ giờ). ' +
                'Phần luận giải Bát tự vẫn chạy bình thường.'
        };
    }

    const hour = Number(data.hour);
    const minute = isMissing(data.minute) ? 0 : Number(data.minute);

    try {
        const gio = `${pad2(hour)}:${pad2(minute)}`;
        const chart = isLunarCalendar(data.calendar)
            ? lapLaSoTuAmViet({
                nam_am: year,
                thang_am: month,
                ngay_am: day,
                gio,
                phut: minute,
                gioi_tinh: data.gender
            })
            : lapLaSoTuDuongLich({
                nam: year,
                thang: month,
                ngay: day,
                gio,
                phut: minute,
                gioi_tinh: data.gender
            });

        return { summary: formatTuViSummary(chart) };
    } catch (error) {
        return {
            note: `Chưa có lá số Tử vi vì không an sao được từ ngày giờ sinh trong hồ sơ (${error.message}). ` +
                'Phần luận giải Bát tự vẫn chạy bình thường.'
        };
    }
}

module.exports = {
    CHINH_TINH,
    HOA_ORDER,
    formatTuViSummary,
    buildTuViPromptContext
};
