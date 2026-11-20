/**
 * Test phần chèn lá số Tử vi vào prompt luận giải (/api/consultant/ask).
 *
 * Không gọi Groq: chỉ kiểm tra helper an sao và prompt đã dựng.
 * Fixture chuẩn: 7/4/1988, 11:30, Nam → Mệnh Dậu, Thái Âm Hóa Quyền.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { buildTuViPromptContext } = require('../src/bazi/tu_vi_summary');
const groqService = require('../src/services/groq.service');

const FIXTURE = {
    year: 1988,
    month: 4,
    day: 7,
    hour: 11,
    minute: 30,
    gender: 'Nam',
    calendar: 'solar'
};

const CHINH_TINH = [
    'Tử Vi', 'Liêm Trinh', 'Thiên Đồng', 'Vũ Khúc', 'Thái Dương', 'Thiên Cơ', 'Thiên Phủ',
    'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'
];

function buildPrompt(tuViContext) {
    return groqService.buildUserPrompt(
        {
            thong_tin_co_ban: { ten: 'Mệnh chủ', gioi_tinh: 'Nam', ngay_sinh_duong: '07/04/1988', gio_sinh: '11:30' },
            chi_tiet_tru: [],
            phan_tich: {},
            tu_vi: tuViContext
        },
        { dai_van: [] },
        'Công việc năm nay thế nào?',
        'huyen_co',
        null
    );
}

describe('Tóm tắt lá số Tử vi cho luận giải', () => {
    it('fixture 7/4/1988 11:30 Nam ra Mệnh Dậu, Thân Dậu, Cục 3', () => {
        const tuVi = buildTuViPromptContext(FIXTURE);
        assert.ok(tuVi.summary, 'phải có summary');
        assert.equal(tuVi.note, undefined);

        assert.match(tuVi.summary, /Mệnh tại Dậu/);
        assert.match(tuVi.summary, /Thân tại Dậu/);
        assert.match(tuVi.summary, /Cục 3/);
        assert.match(tuVi.summary, /Tử Vi tại Thân/);
        assert.match(tuVi.summary, /Thái Âm Hóa Quyền/);

        for (const sao of CHINH_TINH) {
            assert.ok(tuVi.summary.includes(sao), `thiếu ${sao}`);
        }
        for (const hoa of ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ']) {
            assert.ok(tuVi.summary.includes(hoa), `thiếu ${hoa}`);
        }
    });

    it('prompt gửi AI có tóm tắt lá số + ghi chú đã kiểm chứng', () => {
        const prompt = buildPrompt(buildTuViPromptContext(FIXTURE));
        assert.match(prompt, /## LÁ SỐ TỬ VI \(AN SAO TỰ ĐỘNG — ĐÃ KIỂM CHỨNG\)/);
        assert.match(prompt, /Mệnh tại Dậu/);
        assert.match(prompt, /Thái Âm Hóa Quyền/);
        assert.match(prompt, /32\/32 ca đóng băng \+ 11\/11 ca bổ sung/);
        assert.match(prompt, /KHÔNG tự bịa lại lá số/);
        assert.match(prompt, /Công việc năm nay thế nào\?/);
    });

    it('thiếu giờ sinh: prompt ghi chú chưa có lá số Tử vi, câu hỏi vẫn còn', () => {
        const tuVi = buildTuViPromptContext({ ...FIXTURE, hour: undefined, minute: undefined });
        assert.equal(tuVi.summary, undefined);
        assert.match(tuVi.note, /thiếu giờ sinh/);

        const prompt = buildPrompt(tuVi);
        assert.match(prompt, /## LÁ SỐ TỬ VI/);
        assert.match(prompt, /thiếu giờ sinh/);
        assert.doesNotMatch(prompt, /14 chính tinh/);
        assert.match(prompt, /Công việc năm nay thế nào\?/);
    });

    it('hồ sơ thiếu ngày sinh: không chặn, chỉ ghi chú', () => {
        const tuVi = buildTuViPromptContext({ year: undefined, month: 4, day: 7, hour: 11 });
        assert.equal(tuVi.summary, undefined);
        assert.match(tuVi.note, /thiếu ngày sinh/);
    });

    it('ngày giờ không an sao được: trả note thay vì ném lỗi', () => {
        const tuVi = buildTuViPromptContext({ ...FIXTURE, day: 40 });
        assert.equal(tuVi.summary, undefined);
        assert.match(tuVi.note, /không an sao được/);
    });
});
