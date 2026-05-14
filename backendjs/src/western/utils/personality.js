/**
 * Lightweight Western Astrology Personality Traits
 *
 * Provides basic personality descriptions based on:
 * - Sun sign (core identity)
 * - Element (Fire/Earth/Air/Water)
 * - Modality (Cardinal/Fixed/Mutable)
 *
 * NOT for predictive astrology. Only personality context.
 */

const SIGN_TRAITS = {
    aries: {
        modality: 'Cardinal',
        traits: ['Courageous', 'Determined', 'Confident', 'Enthusiastic', 'Impulsive'],
        traitsVN: ['Dũng cảm', 'Quyết đoán', 'Tự tin', 'Nhiệt tình', 'Bốc đồng'],
        communication: 'Direct and assertive. Prefers action over words.',
        communicationVN: 'Trực tiếp và quyết đoán. Hành động hơn lời nói.',
        emotion: 'Expressive and quick to react. Emotions flare and fade rapidly.',
        emotionVN: 'Biểu cảm và phản ứng nhanh. Cảm xúc bùng nổ rồi tan nhanh.',
    },
    taurus: {
        modality: 'Fixed',
        traits: ['Patient', 'Reliable', 'Devoted', 'Responsible', 'Stubborn'],
        traitsVN: ['Kiên nhẫn', 'Đáng tin cậy', 'Tận tụy', 'Có trách nhiệm', 'Bướng bỉnh'],
        communication: 'Measured and practical. Values substance over style.',
        communicationVN: 'Thận trọng và thực tế. Coi trọng nội dung hơn hình thức.',
        emotion: 'Steady and loyal. Takes time to open up but deeply devoted once committed.',
        emotionVN: 'Ổn định và chung thủy. Cần thời gian để mở lòng nhưng rất tận tâm.',
    },
    gemini: {
        modality: 'Mutable',
        traits: ['Adaptable', 'Curious', 'Communicative', 'Intellectual', 'Playful'],
        traitsVN: ['Linh hoạt', 'Tò mò', 'Giao tiếp tốt', 'Trí tuệ', 'Hài hước'],
        communication: 'Quick-witted and versatile. Loves debate and exchange of ideas.',
        communicationVN: 'Nhanh trí và linh hoạt. Thích tranh luận và trao đổi ý tưởng.',
        emotion: 'Intellectually processes emotions. Needs mental stimulation to feel connected.',
        emotionVN: 'Xử lý cảm xúc bằng lý trí. Cần kích thích trí tuệ để cảm thấy kết nối.',
    },
    cancer: {
        modality: 'Cardinal',
        traits: ['Intuitive', 'Emotional', 'Protective', 'Nurturing', 'Tenacious'],
        traitsVN: ['Trực giác', 'Giàu cảm xúc', 'Bảo vệ', 'Nuôi dưỡng', 'Kiên trì'],
        communication: 'Emotionally attuned and indirect. Reads between the lines.',
        communicationVN: 'Nhạy cảm và gián tiếp. Đọc được ẩn ý.',
        emotion: 'Deeply feeling. Moods ebb and flow like tides. Needs security to thrive.',
        emotionVN: 'Cảm xúc sâu sắc. Tâm trạng lên xuống như thủy triều. Cần an toàn để phát triển.',
    },
    leo: {
        modality: 'Fixed',
        traits: ['Generous', 'Warm-hearted', 'Creative', 'Dramatic', 'Proud'],
        traitsVN: ['Hào phóng', 'Ấm áp', 'Sáng tạo', 'Ấn tượng', 'Tự hào'],
        communication: 'Expressive and charismatic. Commands attention naturally.',
        communicationVN: 'Biểu cảm và lôi cuốn. Tự nhiên thu hút sự chú ý.',
        emotion: 'Big-hearted and proud. Needs appreciation and admiration to feel loved.',
        emotionVN: 'Rộng lượng và kiêu hãnh. Cần được đánh giá cao để cảm thấy được yêu.',
    },
    virgo: {
        modality: 'Mutable',
        traits: ['Analytical', 'Practical', 'Modest', 'Reliable', 'Perfectionist'],
        traitsVN: ['Phân tích', 'Thực tế', 'Khiêm tốn', 'Đáng tin cậy', 'Cầu toàn'],
        communication: 'Precise and thoughtful. Attention to detail is paramount.',
        communicationVN: 'Chính xác và chu đáo. Chú trọng chi tiết.',
        emotion: 'Expresses love through service and practical help. Reserved but deeply caring.',
        emotionVN: 'Thể hiện tình yêu qua hành động và giúp đỡ thực tế. Kín đáo nhưng quan tâm sâu sắc.',
    },
    libra: {
        modality: 'Cardinal',
        traits: ['Diplomatic', 'Fair-minded', 'Sociable', 'Graceful', 'Indecisive'],
        traitsVN: ['Ngoại giao', 'Công bằng', 'Hòa đồng', 'Duyên dáng', 'Do dự'],
        communication: 'Tactful and persuasive. Seeks harmony and balance in all dialogue.',
        communicationVN: 'Khéo léo và thuyết phục. Tìm kiếm hài hòa trong mọi đối thoại.',
        emotion: 'Values partnership and harmony. Dislikes conflict, may avoid difficult conversations.',
        emotionVN: 'Co trọng quan hệ đối tác và hài hòa. Không thích xung đột, có thể tránh đối thoại khó.',
    },
    scorpio: {
        modality: 'Fixed',
        traits: ['Passionate', 'Resourceful', 'Brave', 'Mysterious', 'Intense'],
        traitsVN: ['Đam mê', 'Tháo vát', 'Dũng cảm', 'Bí ẩn', 'Mãnh liệt'],
        communication: 'Intense and probing. Seeks truth beneath the surface.',
        communicationVN: 'Mãnh liệt và đào sâu. Tìm kiếm sự thật đằng sau bề nổi.',
        emotion: 'Deeply passionate and transformative. Emotions run deep and powerful.',
        emotionVN: 'Đam mê sâu sắc và mang tính biến đổi. Cảm xúc sâu và mạnh mẽ.',
    },
    sagittarius: {
        modality: 'Mutable',
        traits: ['Optimistic', 'Independent', 'Adventurous', 'Philosophical', 'Blunt'],
        traitsVN: ['Lạc quan', 'Độc lập', 'Phiêu lưu', 'Triết lý', 'Thẳng thắn'],
        communication: 'Frank and philosophical. Speaks truth freely, sometimes tactlessly.',
        communicationVN: 'Thẳng thắn và triết lý. Nói thật tự do, đôi khi không khéo léo.',
        emotion: 'Needs freedom in relationships. Expresses love through shared adventures.',
        emotionVN: 'Cần tự do trong các mối quan hệ. Thể hiện tình yêu qua những cuộc phiêu lưu chung.',
    },
    capricorn: {
        modality: 'Cardinal',
        traits: ['Disciplined', 'Ambitious', 'Responsible', 'Patient', 'Reserved'],
        traitsVN: ['Kỷ luật', 'Tham vọng', 'Có trách nhiệm', 'Kiên nhẫn', 'Kín đáo'],
        communication: 'Structured and purposeful. Values efficiency and substance.',
        communicationVN: 'Có cấu trúc và có mục đích. Coi trọng hiệu quả và nội dung.',
        emotion: 'Reserved in expressing feelings. Shows love through loyalty and provision.',
        emotionVN: 'Kín đáo trong bày tỏ cảm xúc. Thể hiện tình yêu qua lòng trung thành và chu cấp.',
    },
    aquarius: {
        modality: 'Fixed',
        traits: ['Innovative', 'Humanitarian', 'Independent', 'Intellectual', 'Unpredictable'],
        traitsVN: ['Đổi mới', 'Nhân đạo', 'Độc lập', 'Trí tuệ', 'Khó đoán'],
        communication: 'Intellectual and unconventional. Challenges norms and traditions.',
        communicationVN: 'Trí tuệ và không theo khuôn mẫu. Thách thức chuẩn mực và truyền thống.',
        emotion: 'Detached and rational approach to emotions. Values friendship as foundation of love.',
        emotionVN: 'Cách tiếp cận cảm xúc lý trí và tách biệt. Coi trọng tình bạn làm nền tảng của tình yêu.',
    },
    pisces: {
        modality: 'Mutable',
        traits: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle', 'Escapist'],
        traitsVN: ['Từ bi', 'Nghệ thuật', 'Trực giác', 'Dịu dàng', 'Mơ mộng'],
        communication: 'Empathetic and poetic. Communicates through emotion and art.',
        communicationVN: 'Đồng cảm và thi vị. Giao tiếp qua cảm xúc và nghệ thuật.',
        emotion: 'Deeply empathetic. Absorbs others emotions. Needs boundaries for wellbeing.',
        emotionVN: 'Đồng cảm sâu sắc. Hấp thụ cảm xúc người khác. Cần ranh giới để cân bằng.',
    },
};

const ELEMENT_TRAITS = {
    Fire: {
        traitsVN: ['Nhiệt huyết', 'Năng động', 'Truyền cảm hứng'],
        summaryVN: 'Nhóm Lửa — tràn đầy năng lượng, đam mê, và tinh thần tiên phong.',
        summaryEN: 'Fire signs — energetic, passionate, and pioneering.',
    },
    Earth: {
        traitsVN: ['Thực tế', 'Kiên định', 'Đáng tin cậy'],
        summaryVN: 'Nhóm Đất — vững chãi, thực tế, và có trách nhiệm.',
        summaryEN: 'Earth signs — grounded, practical, and responsible.',
    },
    Air: {
        traitsVN: ['Trí tuệ', 'Giao tiếp', 'Xã hội'],
        summaryVN: 'Nhóm Khí — thông minh, giao tiếp, và hướng ngoại.',
        summaryEN: 'Air signs — intellectual, communicative, and social.',
    },
    Water: {
        traitsVN: ['Trực giác', 'Cảm xúc', 'Đồng cảm'],
        summaryVN: 'Nhóm Nước — nhạy cảm, trực giác, và giàu cảm xúc.',
        summaryEN: 'Water signs — intuitive, emotional, and empathetic.',
    },
};

const MODALITY_TRAITS = {
    Cardinal: {
        traitsVN: ['Khởi xướng', 'Lãnh đạo', 'Chủ động'],
        summaryVN: 'Thích bắt đầu và dẫn dắt. Tiên phong trong mọi lĩnh vực.',
    },
    Fixed: {
        traitsVN: ['Kiên định', 'Ổn định', 'Bền bỉ'],
        summaryVN: 'Kiên trì theo đuổi mục tiêu. Ổn định và đáng tin cậy.',
    },
    Mutable: {
        traitsVN: ['Linh hoạt', 'Thích nghi', 'Đa năng'],
        summaryVN: 'Dễ dàng thích nghi với thay đổi. Linh hoạt trong mọi tình huống.',
    },
};

/**
 * Get personality traits for a given sun sign
 * @param {string} signId — e.g., 'aries', 'taurus', etc.
 * @returns {object|null} personality data
 */
function getSignPersonality(signId) {
    const sign = SIGN_TRAITS[signId];
    if (!sign) return null;

    const element = getElementForSign(signId);
    const modality = sign.modality;

    return {
        traits: sign.traits,
        traitsVN: sign.traitsVN,
        communication: sign.communication,
        communicationVN: sign.communicationVN,
        emotion: sign.emotion,
        emotionVN: sign.emotionVN,
        element: element ? {
            name: element,
            ...(ELEMENT_TRAITS[element] || {}),
        } : null,
        modality: modality ? {
            name: modality,
            ...(MODALITY_TRAITS[modality] || {}),
        } : null,
    };
}

/**
 * Get element for a sign id (for internal use)
 */
function getElementForSign(signId) {
    const map = {
        aries: 'Fire', leo: 'Fire', sagittarius: 'Fire',
        taurus: 'Earth', virgo: 'Earth', capricorn: 'Earth',
        gemini: 'Air', libra: 'Air', aquarius: 'Air',
        cancer: 'Water', scorpio: 'Water', pisces: 'Water',
    };
    return map[signId] || null;
}

module.exports = {
    getSignPersonality,
    ELEMENT_TRAITS,
    MODALITY_TRAITS,
};
