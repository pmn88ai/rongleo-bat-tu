/**
 * Phân tích Cân Bằng Ngũ Hành.
 *
 * Điểm ngũ hành chỉ là điểm thô để hiển thị, KHÔNG dùng trọng số/ngưỡng tự đặt
 * để chốt vượng/nhược hay dụng thần. Dụng thần đi theo thứ tự quy tắc tủ:
 * điều hậu → cách cục (quyết hướng) → vượng/nhược (quyết mức).
 */
const ganzhi = require('../ganzhi');
const { CAREER_DB, HEALTH_DB, STRUCTURE_ANALYSIS, LUCK_ADVICE, DIEU_HAU_DATA, FENGSHUI_DB } = require('./data/ngu_hanh_data');

const RELATIONSHIPS = {
    'Mộc': { sinh: 'Hỏa', khac: 'Thổ', duoc_sinh: 'Thủy', bi_khac: 'Kim' },
    'Hỏa': { sinh: 'Thổ', khac: 'Kim', duoc_sinh: 'Mộc', bi_khac: 'Thủy' },
    'Thổ': { sinh: 'Kim', khac: 'Thủy', duoc_sinh: 'Hỏa', bi_khac: 'Mộc' },
    'Kim': { sinh: 'Thủy', khac: 'Mộc', duoc_sinh: 'Thổ', bi_khac: 'Hỏa' },
    'Thủy': { sinh: 'Mộc', khac: 'Hỏa', duoc_sinh: 'Kim', bi_khac: 'Thổ' }
};

const { determineCach } = require('../geju');

// Hỷ/Kỵ của từng cách cục, lấy trực tiếp từ mô tả trong geju.CACH_CUC.
const PATTERN_DIRECTION = {
    'Kiến Lộc': { hy: ['wealth', 'officer', 'resource'], ky: ['output', 'self'] },
    'Thực Thần': { hy: ['wealth'], ky: ['resource'] },
    'Thương Quan': { hy: ['wealth', 'resource'], ky: ['officer'] },
    'Chính Tài': { hy: ['officer', 'resource'], ky: ['self'] },
    'Thiên Tài': { hy: ['officer', 'resource'], ky: ['self'] },
    'Chính Quan': { hy: ['resource'], ky: ['output'] },
    'Thất Sát': { hy: ['output', 'resource'], ky: [] },
    'Chính Ấn': { hy: ['officer'], ky: ['wealth'] },
    'Thiên Ấn': { hy: ['officer'], ky: ['output'] }
};

function getElementGroupKeys(dayEle) {
    const rel = RELATIONSHIPS[dayEle];
    return {
        self: dayEle,
        resource: rel.duoc_sinh,
        output: rel.sinh,
        wealth: rel.khac,
        officer: rel.bi_khac
    };
}

function toStructureKey(patternName) {
    if (!patternName) return null;
    if (patternName === 'Kiến Lộc') return 'Kiến Lộc Cách/Nguyệt Kiếp';
    if (patternName.endsWith(' Cách')) return patternName;
    return patternName + ' Cách';
}

function analyzeNguHanh(ctx) {
    const dayGan = ctx.gans[2];
    const dayEle = ganzhi.ganToElement(dayGan);
    const monthZhi = ctx.zhis[1];
    const monthEle = ganzhi.zhiToElement(monthZhi);

    const { self: selfEle, resource: resourceEle, output: outputEle, wealth: wealthEle, officer: officerEle } =
        getElementGroupKeys(dayEle);

    // ── 1. ĐIỂM THÔ (chỉ để hiển thị, chưa chốt) ────────────────────────────
    const rawElements = ctx.elements || (ctx.scores && ctx.scores.ngu_hanh_vn) || {};
    const rawOf = (ele) => Number(rawElements[ele] || 0);
    const rawSupport = rawOf(selfEle) + rawOf(resourceEle);
    const rawOppose = rawOf(outputEle) + rawOf(wealthEle) + rawOf(officerEle);

    // ── 2. KIỂM CĂN / TRỢ / ĐẮC LỆNH (điều kiện tòng cách) ──────────────────
    const hiddenRoots = [];
    for (const zhi of ctx.zhis) {
        for (const tc of ganzhi.getTangCan(zhi)) {
            if (ganzhi.ganToElement(tc.can) === dayEle) {
                hiddenRoots.push(`${ganzhi.zhiToVN(zhi)}:${tc.can}`);
            }
        }
    }
    const hasRoot = hiddenRoots.length > 0;

    const stemSupports = [];
    [0, 1, 3].forEach((i) => {
        const ele = ganzhi.ganToElement(ctx.gans[i]);
        if (ele === dayEle || ele === resourceEle) {
            stemSupports.push(ganzhi.ganToVN(ctx.gans[i]));
        }
    });
    const hasStemSupport = stemSupports.length > 0;

    const isMonthSupport = (monthEle === dayEle) || (monthEle === resourceEle);

    // Tòng chỉ khi đủ điều kiện chặt: vô căn (tàng can 4 chi), vô trợ thiên can,
    // tháng sinh không trợ Nhật chủ và thuộc/sinh hành được tòng.
    let tong = null;
    if (!hasRoot && !hasStemSupport && !isMonthSupport) {
        const candidates = [
            { type: 'Tòng Tài Cách', ele: wealthEle },
            { type: 'Tòng Sát Cách', ele: officerEle },
            { type: 'Tòng Nhi Cách', ele: outputEle }
        ];
        const exact = candidates.find(c => c.ele === monthEle);
        tong = exact || candidates.find(c => ganzhi.generates(monthEle, c.ele)) || null;
    }
    const isSpecial = !!tong;

    // ── 3. CÁCH CỤC ─────────────────────────────────────────────────────────
    const patterns = isSpecial ? [] : determineCach(ctx);
    const patternName = (patterns && patterns[0] && PATTERN_DIRECTION[patterns[0]]) ? patterns[0] : null;
    const specialType = isSpecial ? tong.type : (patternName || 'Chưa xác định được');

    // ── 4. VƯỢNG / NHƯỢC (chỉ chốt khi đủ cả 3 yếu tố, không dùng ngưỡng số) ─
    const deLenh = isMonthSupport;
    const deDia = hasRoot;
    const deThe = hasStemSupport;
    let strengthDesc;
    if (isSpecial) {
        strengthDesc = 'Cực Nhược (Ngoại cách)';
    } else if (deLenh && deDia && deThe) {
        strengthDesc = 'Thân Vượng (Nội cách)';
    } else {
        strengthDesc = 'chưa xác định được';
    }

    // ── 5. DỤNG / HỶ / KỴ ────────────────────────────────────────────────────
    let dungThan = [];
    let hyThan = [];
    let kyThan = [];
    let analysis = '';

    const eleByKey = {
        self: selfEle,
        resource: resourceEle,
        output: outputEle,
        wealth: wealthEle,
        officer: officerEle
    };

    if (isSpecial) {
        if (specialType === 'Tòng Tài Cách') {
            dungThan = [wealthEle];
            hyThan = [outputEle];
            kyThan = [resourceEle, dayEle];
        } else if (specialType === 'Tòng Sát Cách') {
            // Dụng thần Tòng Sát = hành khắc Nhật Chủ (hành của Sát), không hardcode.
            dungThan = [officerEle];
            hyThan = [wealthEle];
            kyThan = [resourceEle, dayEle, outputEle];
        } else {
            dungThan = [outputEle];
            hyThan = [dayEle, wealthEle];
            kyThan = [resourceEle, officerEle];
        }
    } else if (patternName) {
        const dir = PATTERN_DIRECTION[patternName];
        const hyList = dir.hy.map(k => eleByKey[k]);
        const kyList = dir.ky.map(k => eleByKey[k]);
        dungThan = hyList.length ? [hyList[0]] : [];
        hyThan = hyList.slice(1);
        kyThan = kyList;
    }

    // Điều hậu (ưu tiên đầu tiên) — chỉ chốt khi tháng sinh thuộc mùa đông/hạ.
    let dieuHau = null;
    let dieuHauMsg = '';
    const mVn = ganzhi.zhiToVN(monthZhi);
    const winterZhis = ['Hợi', 'Tý', 'Sửu'];
    const summerZhis = ['Tỵ', 'Ngọ', 'Mùi'];

    if (winterZhis.includes(mVn)) dieuHau = 'Hỏa';
    else if (summerZhis.includes(mVn)) dieuHau = 'Thủy';

    if (dieuHau && DIEU_HAU_DATA[dieuHau]) {
        dieuHauMsg = DIEU_HAU_DATA[dieuHau].msg;

        if (isSpecial) {
            // Không đổi hướng dụng thần của ngoại cách; chỉ ghi nhận điều hậu.
            if (!dungThan.includes(dieuHau) && !hyThan.includes(dieuHau) && !kyThan.includes(dieuHau)) {
                hyThan.push(dieuHau);
            }
        } else if (kyThan.includes(dieuHau)) {
            dieuHauMsg += ` Hành ${dieuHau} đang là Kỵ thần của cách cục nên không dùng làm dụng thần chính.`;
        } else if (!dungThan.includes(dieuHau)) {
            // Điều hậu đứng trước, đẩy hướng cũ xuống hỷ thần.
            hyThan = [...new Set([...dungThan, ...hyThan])].filter(e => e !== dieuHau);
            dungThan = [dieuHau];
        }
    }

    dungThan = [...new Set(dungThan)];
    hyThan = [...new Set(hyThan)].filter(e => !dungThan.includes(e));
    kyThan = [...new Set(kyThan)];

    // ── 6. DIỄN GIẢI ────────────────────────────────────────────────────────
    const stInfo = STRUCTURE_ANALYSIS[toStructureKey(specialType)] || null;

    if (isSpecial) {
        analysis += `**${specialType}**: đủ 4 điều kiện tòng (vô căn, vô trợ thiên can, thất lệnh, tháng sinh thuộc/sinh hành tòng).<br/>`;
    } else if (patternName) {
        analysis += `Cách cục: **${specialType}**. ${stInfo ? stInfo.desc : ''}<br/>`;
    } else {
        analysis += `Cách cục: **chưa xác định được** (can tháng + Kiến Lộc không khớp mẫu nào).<br/>`;
    }

    if (stInfo) {
        analysis += `💪 **Điểm mạnh**: ${stInfo.strengths}<br/>` +
            `🔻 **Điểm yếu**: ${stInfo.weaknesses}<br/>` +
            `🔑 **Chìa khóa thành công**: ${stInfo.success_key}<br/>`;
    }

    analysis += `Cường độ Nhật chủ: **${strengthDesc}**.<br/>`;
    analysis += dungThan.length
        ? `Dụng thần theo quy tắc tủ: **${dungThan.join(' / ')}**.<br/>`
        : `Dụng thần: **chưa xác định được** (chưa đủ căn cứ theo quy tắc tủ).<br/>`;
    analysis += `Ghi chú: điểm ngũ hành là **điểm thô, chưa chốt**.<br/>`;

    // ── 7. NỘI DUNG PHỤ (chỉ hiển thị khi có dụng/kỵ thần) ───────────────────
    const primaryDung = dungThan[0] || null;
    const primaryKy = kyThan[0] || null;

    let jobHtml;
    if (primaryDung) {
        const careerNode = CAREER_DB[primaryDung] || {};
        const allJobs = careerNode.jobs || [];
        const selectedJobs = [];
        if (allJobs.length > 0) {
            const step = Math.max(1, Math.floor(allJobs.length / 6));
            for (let i = 0; i < allJobs.length && selectedJobs.length < 6; i += step) {
                selectedJobs.push(allJobs[i]);
            }
        }
        jobHtml = `
        **${careerNode.title || primaryDung}**: ${careerNode.advice || ""}<br/><br/>
        👉 **GỢI Ý NGHỀ CHI TIẾT**:<br/>${selectedJobs.join(', ')},...
    `;
    } else {
        jobHtml = 'chưa đủ căn cứ (chưa xác định được dụng thần).';
    }

    let healthHtml;
    if (primaryKy) {
        const healthNode = HEALTH_DB[primaryKy] || {};
        healthHtml = `
        **Nguy cơ từ hành ${primaryKy} (Kỵ thần)**:<br/>
        ⚠️ **Bộ phận**: ${healthNode.organs || "Đang cập nhật"}<br/>
        🤒 **Triệu chứng**: ${healthNode.symptoms || "Đang cập nhật"}<br/>
        🧠 **Tâm lý/Cảm xúc**: ${healthNode.psychology || "Đang cập nhật"}<br/>
        🛡️ **Phòng ngừa**: ${healthNode.lifestyle || "Cân bằng lối sống"}<br/>
        🥗 **Dinh dưỡng**: ${healthNode.nutrition || "Ăn uống điều độ"}
    `;
    } else {
        healthHtml = 'chưa đủ căn cứ (chưa xác định được kỵ thần).';
    }

    let fengShuiHtml;
    if (primaryDung) {
        const fsNode = FENGSHUI_DB[primaryDung] || {};
        fengShuiHtml = `
        **Màu sắc**: ${fsNode.color || "..."}<br/>
        **Hình khối**: ${fsNode.shape || "..."}<br/>
        **Chất liệu**: ${fsNode.material || "..."}<br/>
        **Con số**: ${fsNode.number || "..."}<br/>
        **Hướng tốt**: ${fsNode.direction || "..."}
    `;
    } else {
        fengShuiHtml = 'chưa đủ căn cứ (chưa xác định được dụng thần).';
    }

    return {
        nhan_dinh: {
            nhat_chu: dayGan,
            ngu_hanh: dayEle,
            cuong_do: strengthDesc,
            diem_tho: rawElements,
            diem_tuong_doi: {
                ho_tro: rawSupport,
                khac_che: rawOppose,
                ghi_chu: 'Điểm thô, chưa chốt'
            },
            nguyet_lenh: monthEle,
            dac_lenh: isMonthSupport ? "Đắc lệnh" : "Thất lệnh",
            ngoai_cach: isSpecial,
            cach_cuc: specialType,
            ly_do: isSpecial
                ? 'Đủ điều kiện tòng theo quy tắc tủ'
                : (patternName ? 'Khớp mẫu cách cục' : 'Can tháng + Kiến Lộc không khớp mẫu nào')
        },
        dung_than: {
            ngu_hanh: dungThan,
            y_nghia: `Dụng thần chốt theo thứ tự điều hậu → cách cục → vượng/nhược.`,
            nghe_nghiep: jobHtml
        },
        hy_than: {
            ngu_hanh: hyThan,
            y_nghia: "Sinh trợ cho Dụng thần."
        },
        ky_than: {
            ngu_hanh: kyThan,
            y_nghia: "Gây mất cân bằng mệnh cục.",
            suc_khoe: healthHtml
        },
        dieu_hau: {
            can_thiet: dieuHau,
            luan_giai: dieuHauMsg || 'chưa xác định được'
        },
        phong_thuy: {
            dung_than_chinh: primaryDung,
            loi_khuyen: fengShuiHtml
        },
        luan_giai: analysis,
        luan_giai_tong_quat: analysis,
        cat_hung: {
            gap_van_tot: (dungThan.length || hyThan.length)
                ? "Gặp vận **" + [...dungThan, ...hyThan].join('/') + "**: " + LUCK_ADVICE['good'][0]
                : 'chưa đủ căn cứ',
            gap_van_xau: kyThan.length
                ? "Gặp vận **" + kyThan.join('/') + "**: " + LUCK_ADVICE['bad'][0]
                : 'chưa đủ căn cứ'
        }
    };
}

module.exports = { analyzeNguHanh };
