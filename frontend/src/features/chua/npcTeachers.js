/**
 * NPC trong chùa — mỗi thầy phụ trách một quầy.
 * Dùng để lọc lịch sử tư vấn của đúng người dùng cho đúng thầy.
 *
 * Lịch sử lấy từ API hiện có `/api/consultant/my-history`; mỗi bản ghi có
 * `theme_id`, `question_id`, `persona` do backend lưu khi tư vấn.
 */

export const NPCS = {
    chua: {
        id: 'chua',
        name: 'Thầy Huyền Cơ',
        icon: '🧙‍♂️',
        room: 'Cổng chùa'
    },
    tinh_tu: {
        id: 'tinh_tu',
        name: 'Thầy Tinh Tú',
        icon: '🔮',
        room: 'Điện Tử Vi'
    },
    can_chi: {
        id: 'can_chi',
        name: 'Thầy Can Chi',
        icon: '☯️',
        room: 'Điện Bát Tự'
    },
    hoang_dao: {
        id: 'hoang_dao',
        name: 'Thầy Hoàng Đạo',
        icon: '📅',
        room: 'Quầy Xem Ngày'
    },
    thoi_van: {
        id: 'thoi_van',
        name: 'Thầy Thời Vận',
        icon: '☀️',
        room: 'Quầy Vận Hôm Nay'
    },
    duyen_khoi: {
        id: 'duyen_khoi',
        name: 'Thầy Duyên Khởi',
        icon: '🎎',
        room: 'Quầy Tình Duyên'
    },
    que_cat: {
        id: 'que_cat',
        name: 'Thầy Quẻ Cát',
        icon: '🎴',
        room: 'Quầy Xin Quẻ'
    },
    huyen_co: {
        id: 'huyen_co',
        name: 'Thầy Huyền Cơ Bát Tự',
        icon: '🧙‍♂️',
        room: 'Phòng Hỏi Thầy'
    },
    menh_meo: {
        id: 'menh_meo',
        name: 'Thầy Mệnh Mèo GenZ',
        icon: '🐱',
        room: 'Phòng Hỏi Thầy'
    }
};

const isMatching = (item) => item.theme_id === 'matching' || item.question_id === 'matching_ai';
const isQue = (item) => item.theme_id === 'xin_que';
const isComprehensive = (item) => item.theme_id === 'comprehensive' || item.question_id === 'comprehensive';

export const npcMatches = (npcId, item) => {
    if (!item) return false;

    switch (npcId) {
        case 'chua':
            return true;
        case 'tinh_tu':
            return item.theme_id === 'tu_vi';
        case 'can_chi':
            return isComprehensive(item);
        case 'hoang_dao':
            return item.theme_id === 'xem_ngay';
        case 'thoi_van':
            return item.theme_id === 'van_hom_nay';
        case 'duyen_khoi':
            return isMatching(item);
        case 'que_cat':
            return isQue(item);
        case 'menh_meo':
            return item.persona === 'menh_meo' && !isMatching(item) && !isQue(item) && !isComprehensive(item);
        case 'huyen_co':
            return item.persona !== 'menh_meo' && !isMatching(item) && !isQue(item) && !isComprehensive(item);
        default:
            return false;
    }
};

// Nhãn thầy cho danh sách gộp ở Cổng chùa.
export const teacherLabelForItem = (item) => {
    if (!item) return '';
    if (isMatching(item)) return NPCS.duyen_khoi.name;
    if (isQue(item)) return NPCS.que_cat.name;
    if (isComprehensive(item)) return NPCS.can_chi.name;
    if (item.persona === 'menh_meo') return NPCS.menh_meo.name;
    return NPCS.huyen_co.name;
};
