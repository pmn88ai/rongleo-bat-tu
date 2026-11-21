/**
 * Ý nghĩa các con số theo hệ Thần số học Pythagore.
 *
 * Chỉ dùng đúng các số của hệ: 1–9 và hai số chủ 11, 22.
 * Không thêm số khác, không thêm nghĩa ngoài hệ.
 */

const NUMBER_MEANINGS = {
    1: {
        title: 'Người khởi đầu',
        desc: 'Độc lập, tiên phong, có ý chí lãnh đạo và tinh thần tự lập. Bài học là học cách hợp tác và lắng nghe người khác.'
    },
    2: {
        title: 'Người kết nối',
        desc: 'Nhạy cảm, hợp tác, thiên về hòa giải và chăm sóc. Bài học là giữ ranh giới cá nhân và tin vào trực giác của mình.'
    },
    3: {
        title: 'Người biểu đạt',
        desc: 'Sáng tạo, giao tiếp, lạc quan và truyền cảm hứng. Bài học là kiên trì và tập trung vào điều cốt lõi.'
    },
    4: {
        title: 'Người xây nền',
        desc: 'Thực tế, kỷ luật, bền bỉ và đáng tin cậy. Bài học là linh hoạt hơn và cho phép mình nghỉ ngơi.'
    },
    5: {
        title: 'Người tự do',
        desc: 'Năng động, tò mò, thích trải nghiệm và thay đổi. Bài học là cam kết và giữ chữ tín.'
    },
    6: {
        title: 'Người chăm sóc',
        desc: 'Trách nhiệm, yêu thương, thiên về gia đình và cộng đồng. Bài học là không ôm đồm và chăm sóc bản thân.'
    },
    7: {
        title: 'Người tìm hiểu',
        desc: 'Sâu sắc, phân tích, hướng nội và tìm kiếm chân lý. Bài học là mở lòng và tin vào đời sống thực tế.'
    },
    8: {
        title: 'Người kiến tạo',
        desc: 'Tham vọng, quản trị, hướng tới thành tựu và vật chất. Bài học là cân bằng quyền lực với lòng nhân.'
    },
    9: {
        title: 'Người phụng sự',
        desc: 'Bao dung, lý tưởng, hướng tới cộng đồng và chữa lành. Bài học là buông bỏ và chấp nhận giới hạn.'
    },
    11: {
        title: 'Số chủ trực giác',
        desc: 'Nhạy bén tâm linh, truyền cảm hứng, có sứ mệnh dẫn dắt bằng trực giác. Bài học là cân bằng cảm xúc và lý trí.'
    },
    22: {
        title: 'Số chủ kiến tạo',
        desc: 'Tầm nhìn lớn, kết hợp lý tưởng với thực thi, có khả năng xây dựng bền vững. Bài học là kiên nhẫn với chính mình.'
    }
};

const NUMBER_CATEGORIES = {
    duong_doi: {
        ten: 'Số đường đời',
        icon: '🛤️',
        cach_tinh: 'Rút gọn tổng các chữ số của ngày + tháng + năm sinh (giữ 11/22).'
    },
    su_menh: {
        ten: 'Số sứ mệnh',
        icon: '🎯',
        cach_tinh: 'Rút gọn tổng giá trị các chữ cái trong toàn bộ họ tên.'
    },
    linh_hon: {
        ten: 'Số linh hồn',
        icon: '💫',
        cach_tinh: 'Rút gọn tổng giá trị các nguyên âm (A, E, I, O, U) trong họ tên.'
    },
    nhan_cach: {
        ten: 'Số nhân cách',
        icon: '🎭',
        cach_tinh: 'Rút gọn tổng giá trị các phụ âm trong họ tên.'
    },
    ngay_sinh: {
        ten: 'Số ngày sinh',
        icon: '📅',
        cach_tinh: 'Rút gọn ngày sinh (giữ 11/22).'
    },
    nam_ca_nhan: {
        ten: 'Năm cá nhân',
        icon: '🗓️',
        cach_tinh: 'Rút gọn tổng ngày sinh + tháng sinh + năm hiện tại.'
    }
};

function meaningFor(number) {
    return NUMBER_MEANINGS[number] || null;
}

function describeNumbers(numbers) {
    return Object.entries(NUMBER_CATEGORIES).map(([key, category]) => {
        const value = numbers ? numbers[key] : null;
        const meaning = meaningFor(value);
        return {
            key,
            ten: category.ten,
            icon: category.icon,
            cach_tinh: category.cach_tinh,
            so: value,
            tieu_de: meaning ? meaning.title : null,
            y_nghia: meaning ? meaning.desc : null
        };
    });
}

module.exports = {
    NUMBER_MEANINGS,
    NUMBER_CATEGORIES,
    meaningFor,
    describeNumbers
};
