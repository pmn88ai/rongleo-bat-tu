/**
 * Cấu hình 2 nhóm đường vào: Đi dạo chùa và Tra cứu.
 * Mỗi mục tra cứu dùng một ảnh nền + màu nhấn riêng, lấy từ public/images/chua/ (11 ảnh có sẵn).
 */

export const TEMPLE_LINKS = [
    { id: 'chua', path: '/chua', label: 'VÀO CHÙA', shortLabel: 'Chùa', icon: '🏮' },
    { id: 'chanhdien', path: '/chanh-dien', label: 'CHÁNH ĐIỆN', shortLabel: 'Chánh Điện', icon: '🛕' },
    { id: 'vuontinhtam', path: '/vuon-tinh-tam', label: 'VƯỜN TỊNH TÂM', shortLabel: 'Vườn', icon: '🍃' }
];

export const ROOMS = [
    {
        id: 'laso',
        path: '/laso',
        label: 'LÁ SỐ',
        title: 'Điện Bát Tự',
        icon: '🎨',
        image: '/images/chua/dien-bat-tu.jpg',
        accent: '#fbbf24',
        glow: 'rgba(251, 191, 36, 0.28)',
        desc: 'Lá số Tứ Trụ, ngũ hành và luận giải chuyên sâu.'
    },
    {
        id: 'phantich',
        path: '/phantich',
        label: 'PHÂN TÍCH',
        title: 'Điện Tử Vi',
        icon: '⚙️',
        image: '/images/chua/dien-tu-vi.jpg',
        accent: '#c084fc',
        glow: 'rgba(192, 132, 252, 0.28)',
        desc: 'Phân tích ma trận tính cách, điểm mạnh và điểm yếu.'
    },
    {
        id: 'vanhan',
        path: '/vanhan',
        label: 'VẬN HẠN',
        title: 'Quầy Vận Hạn',
        icon: '📈',
        image: '/images/chua/quay-van-hom-nay.jpg',
        accent: '#fb923c',
        glow: 'rgba(251, 146, 60, 0.28)',
        desc: 'Xem đại vận, lưu niên và các mốc thời vận.'
    },
    {
        id: 'dientich',
        path: '/dientich',
        label: 'ĐIỂN TÍCH',
        title: 'Sân Chùa',
        icon: '📜',
        image: '/images/chua/ban-do-chua.jpg',
        accent: '#94a3b8',
        glow: 'rgba(148, 163, 184, 0.28)',
        desc: 'Điển tích cổ học, lời dạy và kinh nghiệm luận mệnh.'
    },
    {
        id: 'xemngay',
        path: '/xemngay',
        label: 'XEM NGÀY',
        title: 'Quầy Xem Ngày',
        icon: '📅',
        image: '/images/chua/quay-xem-ngay.jpg',
        accent: '#4ade80',
        glow: 'rgba(74, 222, 128, 0.28)',
        desc: 'Chọn ngày tốt cho việc lớn, việc nhỏ theo mệnh chủ.'
    },
    {
        id: 'chonngay',
        path: '/chonngay',
        label: 'CHỌN NGÀY',
        title: 'Chánh Điện',
        icon: '🗓️',
        image: '/images/chua/chanh-dien.jpg',
        accent: '#34d399',
        glow: 'rgba(52, 211, 153, 0.28)',
        desc: 'Lọc ngày lành, giờ tốt và việc nên làm.'
    },
    {
        id: 'tuvan',
        path: '/tuvan',
        label: 'TƯ VẤN',
        title: 'Phòng Hỏi Thầy',
        icon: '💬',
        image: '/images/chua/phong-hoi-thay.jpg',
        accent: '#e2c044',
        glow: 'rgba(226, 192, 68, 0.28)',
        desc: 'Đặt câu hỏi riêng, được thầy luận giải chi tiết.'
    },
    {
        id: 'duyenso',
        path: '/duyenso',
        label: 'DUYÊN SỐ',
        title: 'Quầy Tình Duyên',
        icon: '🎎',
        image: '/images/chua/quay-tinh-duyen.jpg',
        accent: '#f472b6',
        glow: 'rgba(244, 114, 182, 0.28)',
        desc: 'So duyên hai người, xem hợp hay không hợp.'
    },
    {
        id: 'xinque',
        path: '/xinque',
        label: 'GIEO QUẺ',
        title: 'Quầy Xin Quẻ',
        icon: '🎴',
        image: '/images/chua/quay-xin-que.jpg',
        accent: '#60a5fa',
        glow: 'rgba(96, 165, 250, 0.28)',
        desc: 'Gieo quẻ, hỏi một việc đang băn khoăn.'
    },
    {
        id: 'tuvi',
        path: '/tuvi',
        label: 'TỬ VI',
        title: 'Điện Tử Vi',
        icon: '🔮',
        image: '/images/chua/dien-tu-vi.jpg',
        accent: '#a78bfa',
        glow: 'rgba(167, 139, 250, 0.28)',
        desc: 'An sao 12 cung theo ngày âm và giờ sinh.'
    },
    {
        id: 'tuviphuongtay',
        path: '/tuviphuongtay',
        label: 'TỬ VI TÂY',
        title: 'Vườn Tịnh Tâm',
        icon: '⭐',
        image: '/images/chua/vuon-tinh-tam.jpg',
        accent: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.28)',
        desc: 'Sun / Moon / Rising theo ngày giờ sinh.'
    },
    {
        id: 'van-hom-nay',
        path: '/van-hom-nay',
        label: 'VẬN HÔM NAY',
        title: 'Cổng Chùa',
        icon: '☀️',
        image: '/images/chua/nen-cong-chua.jpg',
        accent: '#fb7185',
        glow: 'rgba(251, 113, 133, 0.28)',
        desc: 'Vận may, việc nên và nên tránh trong ngày.'
    }
];

export const getRoomByPath = (pathname) => {
    if (!pathname) return null;
    return ROOMS.find((room) => pathname === room.path || pathname.startsWith(`${room.path}/`)) || null;
};

export const PATH_TITLES = {
    '/': 'Trang Chủ',
    '/ho-so-menh': 'Hồ sơ mệnh',
    '/tra-cuu': 'Tra cứu'
};
