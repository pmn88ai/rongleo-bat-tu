import React from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Client-side Western Astrology computation ───────────────────────────────

const ZODIAC = [
    {
        name: 'Capricorn',
        nameVN: 'Ma Kết',
        symbol: '♑',
        element: 'Earth',
        from: [12, 22],
        to: [1, 19],
        traits: ['Kỷ luật', 'Tham vọng', 'Thực tế'],
        traitsVN: ['Kỷ luật', 'Tham vọng', 'Thực tế'],
        rulingPlanet: 'Sao Thổ',
        quality: 'Cơ Bản',
        description:
            'Ma Kết là biểu tượng của sự kiên nhẫn và tham vọng không ngừng nghỉ. Những người thuộc cung này thường đặt ra mục tiêu dài hạn và có khả năng chịu đựng gian khổ để đạt được thành công. Họ thực tế, có trách nhiệm và luôn xây dựng nền tảng vững chắc cho cuộc sống.',
        careers: ['Quản trị doanh nghiệp', 'Chính trị', 'Kỹ thuật', 'Tài chính ngân hàng', 'Xây dựng'],
        strengths: ['Kỷ luật cao', 'Tham vọng bền bỉ', 'Tư duy thực tế', 'Trách nhiệm'],
        weaknesses: ['Quá cứng nhắc', 'Bi quan', 'Lạnh lùng với cảm xúc', 'Chủ nghĩa hoàn hảo'],
        swot: {
            S: 'Ma Kết có kỷ luật thép và khả năng lập kế hoạch dài hạn vượt trội. Họ không bỏ cuộc trước khó khăn và luôn hướng tới mục tiêu một cách kiên định.',
            W: 'Xu hướng quá cứng nhắc khiến Ma Kết khó thích nghi với thay đổi đột ngột. Họ đôi khi xa cách về mặt cảm xúc, gây khó khăn trong các mối quan hệ thân thiết.',
            O: 'Thế giới kinh doanh và chính trị luôn cần những người có tầm nhìn chiến lược và bản lĩnh như Ma Kết. Kỷ nguyên số mở ra nhiều cơ hội quản trị và lãnh đạo phù hợp với họ.',
            T: 'Sự cạnh tranh khốc liệt từ những người linh hoạt hơn có thể đe dọa vị thế của Ma Kết. Xu hướng kiểm soát quá mức có thể tạo ra xung đột trong môi trường làm việc nhóm.',
        },
        loveStyle:
            'Ma Kết yêu chậm nhưng sâu sắc, họ coi trọng sự ổn định và cam kết lâu dài hơn là những rung động nhất thời. Khi đã chọn ai đó, họ sẽ cống hiến hết mình cho mối quan hệ đó.',
    },
    {
        name: 'Aquarius',
        nameVN: 'Bảo Bình',
        symbol: '♒',
        element: 'Air',
        from: [1, 20],
        to: [2, 18],
        traits: ['Sáng tạo', 'Độc lập', 'Nhân đạo'],
        traitsVN: ['Sáng tạo', 'Độc lập', 'Nhân đạo'],
        rulingPlanet: 'Sao Thiên Vương',
        quality: 'Cố Định',
        description:
            'Bảo Bình là cung của những nhà tư tưởng tiên phong và kẻ đột phá. Họ nhìn thế giới bằng con mắt của tương lai, luôn tìm kiếm cách thức mới để cải thiện xã hội và cuộc sống con người. Độc lập và tự do là hai giá trị cốt lõi không thể tách rời của Bảo Bình.',
        careers: ['Công nghệ thông tin', 'Khoa học nghiên cứu', 'Hoạt động xã hội', 'Phát minh sáng chế', 'Truyền thông số'],
        strengths: ['Tư duy đột phá', 'Nhân đạo sâu sắc', 'Độc lập sáng tạo', 'Tầm nhìn tương lai'],
        weaknesses: ['Xa cách cảm xúc', 'Cứng đầu', 'Khó dự đoán', 'Cô lập bản thân'],
        swot: {
            S: 'Bảo Bình có khả năng tư duy vượt thời đại và nhìn nhận vấn đề từ góc độ hoàn toàn mới. Tinh thần nhân đạo và mong muốn thay đổi thế giới là động lực mạnh mẽ thúc đẩy họ.',
            W: 'Bảo Bình thường gặp khó khăn trong việc kết nối cảm xúc sâu sắc với người khác vì họ ưu tiên lý trí. Sự cứng đầu trong quan điểm đôi khi khiến họ bỏ lỡ những giải pháp thực tế hơn.',
            O: 'Cuộc cách mạng công nghệ và phong trào xã hội đang tạo ra sân chơi lý tưởng cho những tâm hồn tiên phong như Bảo Bình. Nhu cầu đổi mới không ngừng của thế giới hiện đại phù hợp hoàn toàn với bản năng của họ.',
            T: 'Sự thay đổi quá nhanh đôi khi khiến ngay cả Bảo Bình cũng mất phương hướng. Xu hướng đứng ngoài cảm xúc có thể làm suy yếu các mối quan hệ và mạng lưới hỗ trợ quan trọng.',
        },
        loveStyle:
            'Bảo Bình yêu bằng trí tuệ — họ cần một người bạn đời có thể cùng họ thảo luận những ý tưởng lớn và tôn trọng không gian riêng tư của nhau. Sự kết nối tinh thần quan trọng hơn cảm xúc với họ.',
    },
    {
        name: 'Pisces',
        nameVN: 'Song Ngư',
        symbol: '♓',
        element: 'Water',
        from: [2, 19],
        to: [3, 20],
        traits: ['Nhạy cảm', 'Trực giác', 'Đồng cảm'],
        traitsVN: ['Nhạy cảm', 'Trực giác', 'Đồng cảm'],
        rulingPlanet: 'Sao Hải Vương',
        quality: 'Biến Đổi',
        description:
            'Song Ngư là cung của nghệ sĩ và người chữa lành — những tâm hồn nhạy cảm, đầy tưởng tượng và có chiều sâu tâm linh hiếm có. Họ sống trong thế giới của cảm xúc và trực giác, thường cảm nhận được những điều mà người khác không thể thấy. Song Ngư là hiện thân của lòng trắc ẩn và nghệ thuật thuần túy.',
        careers: ['Âm nhạc', 'Hội họa nghệ thuật', 'Tâm lý trị liệu', 'Y tế chăm sóc', 'Điện ảnh'],
        strengths: ['Đồng cảm sâu sắc', 'Trực giác nhạy bén', 'Sáng tạo nghệ thuật', 'Tâm linh phong phú'],
        weaknesses: ['Dễ bị tổn thương', 'Thiếu thực tế', 'Trốn tránh hiện thực', 'Thiếu quyết đoán'],
        swot: {
            S: 'Song Ngư có khả năng đồng cảm và hiểu người khác ở mức độ sâu sắc mà ít cung nào sánh được. Trí tưởng tượng phong phú giúp họ tạo ra những tác phẩm nghệ thuật có sức rung động mạnh mẽ.',
            W: 'Tâm hồn quá nhạy cảm khiến Song Ngư dễ bị tổn thương và đôi khi chìm đắm trong cảm xúc tiêu cực. Xu hướng tránh né thực tế có thể cản trở khả năng đưa ra quyết định quan trọng.',
            O: 'Sự bùng nổ của nền kinh tế sáng tạo và ngành công nghiệp chăm sóc sức khỏe tinh thần mở ra nhiều cơ hội cho Song Ngư. Thế giới đang ngày càng cần những người có khả năng chữa lành và truyền cảm hứng.',
            T: 'Song Ngư dễ bị người khác lợi dụng lòng tốt và sự nhẹ dạ của mình. Áp lực của môi trường cạnh tranh khốc liệt có thể làm kiệt sức tinh thần nhạy cảm của họ.',
        },
        loveStyle:
            'Song Ngư yêu hết mình và lãng mạn đến mức phi thực tế — họ mơ về tình yêu cổ tích và sẵn sàng hy sinh mọi thứ vì người yêu. Nhưng họ cần được bảo vệ khỏi những mối quan hệ độc hại.',
    },
    {
        name: 'Aries',
        nameVN: 'Bạch Dương',
        symbol: '♈',
        element: 'Fire',
        from: [3, 21],
        to: [4, 19],
        traits: ['Dũng cảm', 'Năng động', 'Quyết đoán'],
        traitsVN: ['Dũng cảm', 'Năng động', 'Quyết đoán'],
        rulingPlanet: 'Sao Hỏa',
        quality: 'Cơ Bản',
        description:
            'Bạch Dương là người tiên phong của hoàng đạo — nhanh nhạy, dũng cảm và tràn đầy sinh lực. Họ sinh ra để dẫn đầu và không ngại đối mặt với thử thách mới. Tinh thần tiên phong và khả năng hành động quyết đoán là vũ khí lợi hại nhất của Bạch Dương trong cuộc sống.',
        careers: ['Khởi nghiệp', 'Quân sự', 'Thể thao chuyên nghiệp', 'Tiếp thị quảng cáo', 'Lãnh đạo doanh nghiệp'],
        strengths: ['Tiên phong dẫn đầu', 'Quyết đoán mạnh mẽ', 'Năng lượng cao', 'Dũng cảm'],
        weaknesses: ['Nóng nảy', 'Thiếu kiên nhẫn', 'Bốc đồng', 'Ích kỷ'],
        swot: {
            S: 'Bạch Dương có tinh thần tiên phong và khả năng bắt đầu những điều mới một cách bản năng và mạnh mẽ. Sự dũng cảm và quyết đoán giúp họ vượt qua những rào cản mà người khác còn đang do dự.',
            W: 'Tính bốc đồng và thiếu kiên nhẫn thường khiến Bạch Dương bỏ dở công việc giữa chừng khi hứng thú ban đầu đã qua đi. Cơn nóng giận bùng phát nhanh có thể phá hỏng các mối quan hệ quan trọng.',
            O: 'Thị trường khởi nghiệp và môi trường kinh doanh năng động đang rất cần những người dám nghĩ dám làm như Bạch Dương. Kỷ nguyên số tạo ra vô số cơ hội cho những ai hành động nhanh và quyết đoán.',
            T: 'Sự liều lĩnh thiếu tính toán có thể dẫn đến những quyết định sai lầm đắt giá. Đối thủ kiên nhẫn và chiến lược hơn có thể đánh bại Bạch Dương trong cuộc đua dài hơi.',
        },
        loveStyle:
            'Bạch Dương yêu nhanh, mãnh liệt và đầy đam mê — họ tấn công tình cảm như một cuộc chinh phục. Nhưng cần sự kích thích và mới mẻ liên tục để duy trì ngọn lửa tình yêu.',
    },
    {
        name: 'Taurus',
        nameVN: 'Kim Ngưu',
        symbol: '♉',
        element: 'Earth',
        from: [4, 20],
        to: [5, 20],
        traits: ['Kiên định', 'Đáng tin', 'Cảm quan'],
        traitsVN: ['Kiên định', 'Đáng tin', 'Cảm quan'],
        rulingPlanet: 'Sao Kim',
        quality: 'Cố Định',
        description:
            'Kim Ngưu là hiện thân của sự vững chắc, kiên nhẫn và tình yêu cái đẹp. Họ có bản năng nghệ thuật tự nhiên và thưởng thức những niềm vui giản dị của cuộc sống — ẩm thực ngon, âm nhạc hay, thiên nhiên tươi đẹp. Kim Ngưu xây dựng mọi thứ để tồn tại lâu dài, từ sự nghiệp đến các mối quan hệ.',
        careers: ['Tài chính đầu tư', 'Kiến trúc thiết kế', 'Âm nhạc biểu diễn', 'Nông nghiệp', 'Thiết kế nội thất'],
        strengths: ['Kiên định bền bỉ', 'Đáng tin cậy', 'Khiếu thẩm mỹ', 'Thực tế vững chắc'],
        weaknesses: ['Bảo thủ cứng đầu', 'Ích kỷ vật chất', 'Lười biếng', 'Ghen tuông'],
        swot: {
            S: 'Kim Ngưu có sự kiên nhẫn và bền bỉ đáng kinh ngạc — một khi đã bắt đầu, họ sẽ không dừng lại cho đến khi hoàn thành. Khiếu thẩm mỹ thiên bẩm giúp họ tạo ra những sản phẩm và không gian sống đẹp đẽ.',
            W: 'Sự cứng đầu và chống lại thay đổi của Kim Ngưu đôi khi cản trở khả năng thích nghi trong môi trường biến động. Xu hướng đề cao vật chất có thể khiến họ bỏ lỡ những giá trị tinh thần quan trọng hơn.',
            O: 'Nhu cầu về sản phẩm chất lượng cao và trải nghiệm sang trọng đang tăng mạnh, tạo ra cơ hội tuyệt vời cho khiếu thẩm mỹ của Kim Ngưu. Thị trường đầu tư bất động sản và nghệ thuật phù hợp với bản năng xây dựng của họ.',
            T: 'Thế giới thay đổi quá nhanh có thể khiến Kim Ngưu tụt hậu vì họ không muốn từ bỏ những gì đã quen thuộc. Cạnh tranh về giá từ các đối thủ linh hoạt hơn là mối đe dọa thường trực.',
        },
        loveStyle:
            'Kim Ngưu yêu chậm rãi, chắc chắn và thực tế — họ thể hiện tình yêu qua hành động cụ thể hơn là lời nói hoa mỹ. Khi đã cam kết, Kim Ngưu là người bạn đời trung thành và ổn định nhất.',
    },
    {
        name: 'Gemini',
        nameVN: 'Song Tử',
        symbol: '♊',
        element: 'Air',
        from: [5, 21],
        to: [6, 20],
        traits: ['Linh hoạt', 'Tò mò', 'Giao tiếp'],
        traitsVN: ['Linh hoạt', 'Tò mò', 'Giao tiếp'],
        rulingPlanet: 'Sao Thủy',
        quality: 'Biến Đổi',
        description:
            'Song Tử là bộ óc linh hoạt nhất hoàng đạo — đa tài, ham học hỏi và có khả năng giao tiếp xuất sắc. Họ có thể thích nghi với bất kỳ tình huống nào và luôn mang đến không khí sôi động trong mọi cuộc gặp gỡ. Song Tử khao khát tri thức mới và những cuộc trò chuyện kích thích tư duy.',
        careers: ['Truyền thông báo chí', 'Báo chí', 'Marketing sáng tạo', 'Giáo dục', 'Ngoại giao'],
        strengths: ['Giao tiếp xuất sắc', 'Linh hoạt thích nghi', 'Đa tài đa năng', 'Tư duy nhanh nhạy'],
        weaknesses: ['Thiếu nhất quán', 'Nông cạn', 'Không đáng tin', 'Lo lắng thái quá'],
        swot: {
            S: 'Song Tử có khả năng giao tiếp và thuyết phục người khác một cách tự nhiên và hiệu quả. Sự linh hoạt và khả năng tiếp thu nhanh giúp họ xuất sắc trong nhiều lĩnh vực cùng một lúc.',
            W: 'Tính thiếu nhất quán và dễ mất hứng là điểm yếu lớn nhất khiến Song Tử khó hoàn thành những dự án dài hạn. Xu hướng bề ngoài và không đi sâu vào bất cứ điều gì có thể hạn chế sự phát triển chuyên sâu.',
            O: 'Nền kinh tế nội dung số và truyền thông đa nền tảng tạo ra môi trường lý tưởng để Song Tử phát huy khả năng đa tài của mình. Cơ hội làm việc đa dạng và linh hoạt ngày càng nhiều phù hợp với bản tính của họ.',
            T: 'Thiếu chuyên sâu trong một lĩnh vực có thể khiến Song Tử mất lợi thế cạnh tranh so với những chuyên gia tập trung. Sự phân tâm quá nhiều có thể dẫn đến việc không đạt được mục tiêu nào một cách trọn vẹn.',
        },
        loveStyle:
            'Song Tử cần sự kích thích trí tuệ trong tình yêu — họ bị thu hút bởi những người thông minh, hài hước và không bao giờ nhàm chán. Cuộc trò chuyện sâu sắc có thể là màn dạo đầu lãng mạn nhất với họ.',
    },
    {
        name: 'Cancer',
        nameVN: 'Cự Giải',
        symbol: '♋',
        element: 'Water',
        from: [6, 21],
        to: [7, 22],
        traits: ['Yêu thương', 'Trực giác', 'Bảo vệ'],
        traitsVN: ['Yêu thương', 'Trực giác', 'Bảo vệ'],
        rulingPlanet: 'Mặt Trăng',
        quality: 'Cơ Bản',
        description:
            'Cự Giải là trái tim của hoàng đạo — nhạy cảm, yêu thương và luôn đặt gia đình lên hàng đầu. Họ có trực giác cực kỳ nhạy bén và khả năng chữa lành cảm xúc cho người xung quanh. Cự Giải tạo ra những tổ ấm đích thực và là chỗ dựa tinh thần vững chắc cho những người họ yêu thương.',
        careers: ['Y tế điều dưỡng', 'Tâm lý tư vấn', 'Ẩm thực đầu bếp', 'Giáo dục mầm non', 'Công tác xã hội'],
        strengths: ['Đồng cảm sâu sắc', 'Trực giác nhạy bén', 'Tận tụy chăm sóc', 'Trung thành'],
        weaknesses: ['Dễ bị tổn thương', 'Hay lo lắng', 'Bám víu quá mức', 'Tâm trạng thất thường'],
        swot: {
            S: 'Cự Giải có khả năng đồng cảm và chăm sóc người khác một cách chân thành và sâu sắc hiếm có. Trực giác mạnh mẽ giúp họ nhận ra nhu cầu và cảm xúc của người xung quanh trước khi được nói ra.',
            W: 'Tâm trạng dao động theo chu kỳ của Mặt Trăng khiến Cự Giải khó duy trì sự ổn định cảm xúc. Xu hướng bám víu vào quá khứ và những người thân yêu có thể cản trở sự phát triển cá nhân.',
            O: 'Ngành chăm sóc sức khỏe và phúc lợi tinh thần đang bùng nổ, tạo ra nhiều cơ hội cho những tâm hồn chữa lành như Cự Giải. Xu hướng coi trọng giá trị gia đình và cộng đồng đang được đề cao trong xã hội hiện đại.',
            T: 'Môi trường làm việc cạnh tranh và lạnh lùng có thể làm tổn thương tâm hồn nhạy cảm của Cự Giải. Người khác có thể lợi dụng lòng tốt và sự hy sinh vô điều kiện của họ.',
        },
        loveStyle:
            'Cự Giải yêu bằng cả trái tim và sẵn sàng hy sinh mọi thứ cho người thân yêu — họ là người bạn đời chăm sóc và trung thành nhất. Nhưng họ cần được đáp lại sự yêu thương với mức độ tương tự.',
    },
    {
        name: 'Leo',
        nameVN: 'Sư Tử',
        symbol: '♌',
        element: 'Fire',
        from: [7, 23],
        to: [8, 22],
        traits: ['Tự tin', 'Hào phóng', 'Sáng tạo'],
        traitsVN: ['Tự tin', 'Hào phóng', 'Sáng tạo'],
        rulingPlanet: 'Mặt Trời',
        quality: 'Cố Định',
        description:
            'Sư Tử là vị vua của hoàng đạo — tự tin, hào phóng và tỏa sáng tự nhiên. Họ có sức hút lãnh đạo bẩm sinh và khả năng truyền cảm hứng cho đám đông. Sư Tử không chỉ muốn thành công mà muốn được công nhận — sân khấu cuộc đời là nơi họ thực sự tỏa sáng rực rỡ nhất.',
        careers: ['Nghệ thuật biểu diễn', 'Diễn xuất điện ảnh', 'Quản lý điều hành', 'Chính trị', 'Giải trí truyền thông'],
        strengths: ['Lãnh đạo tự nhiên', 'Tự tin rực rỡ', 'Hào phóng', 'Sáng tạo đột phá'],
        weaknesses: ['Kiêu ngạo', 'Cần được chú ý', 'Bảo thủ', 'Hay phán xét'],
        swot: {
            S: 'Sư Tử có sức hút lãnh đạo và khả năng kéo người khác theo tầm nhìn của mình một cách tự nhiên. Sự hào phóng và lòng dũng cảm giúp họ xây dựng được lòng trung thành từ những người xung quanh.',
            W: 'Nhu cầu được công nhận và chú ý quá cao có thể khiến Sư Tử đưa ra quyết định vì cái tôi hơn là vì lợi ích chung. Tính kiêu ngạo đôi khi đẩy người tài năng rời xa họ.',
            O: 'Thời đại mạng xã hội và nền kinh tế người nổi tiếng tạo ra sân khấu toàn cầu hoàn hảo cho Sư Tử. Các vai trò lãnh đạo cấp cao đang ngày càng cần những người có sức hút cá nhân và khả năng truyền cảm hứng.',
            T: 'Đối thủ cạnh tranh mạnh mẽ có thể thách thức vị thế trung tâm mà Sư Tử luôn mong muốn. Khi không được công nhận đúng mức, động lực của Sư Tử có thể sụt giảm đáng kể.',
        },
        loveStyle:
            'Sư Tử yêu một cách hoàng tráng và đam mê — họ muốn là người dẫn đầu trong tình yêu và cần được tôn thờ. Đổi lại, họ sẽ bảo vệ và chăm sóc người yêu với sức mạnh của một vị vua.',
    },
    {
        name: 'Virgo',
        nameVN: 'Xử Nữ',
        symbol: '♍',
        element: 'Earth',
        from: [8, 23],
        to: [9, 22],
        traits: ['Tỉ mỉ', 'Thực tế', 'Chăm chỉ'],
        traitsVN: ['Tỉ mỉ', 'Thực tế', 'Chăm chỉ'],
        rulingPlanet: 'Sao Thủy',
        quality: 'Biến Đổi',
        description:
            'Xử Nữ là bộ óc phân tích và tư duy hệ thống của hoàng đạo — tỉ mỉ, thực tế và luôn tìm cách cải thiện mọi thứ. Họ có con mắt nhìn thấy chi tiết nhỏ nhất và bản năng giải quyết vấn đề một cách logic. Xử Nữ là người bạn và đồng nghiệp đáng tin cậy nhất khi cần sự chính xác và cẩn thận.',
        careers: ['Y học lâm sàng', 'Kế toán kiểm toán', 'Lập trình phần mềm', 'Biên tập xuất bản', 'Nghiên cứu khoa học'],
        strengths: ['Tỉ mỉ chính xác', 'Phân tích logic', 'Chăm chỉ tận tụy', 'Thực tế hiệu quả'],
        weaknesses: ['Cầu toàn', 'Hay chỉ trích', 'Lo lắng thái quá', 'Cứng nhắc'],
        swot: {
            S: 'Xử Nữ có khả năng phân tích và xử lý thông tin phức tạp một cách có hệ thống và chính xác. Sự chú ý đến từng chi tiết nhỏ giúp họ phát hiện và ngăn chặn sai lầm trước khi chúng xảy ra.',
            W: 'Chủ nghĩa hoàn hảo của Xử Nữ đôi khi dẫn đến việc trì hoãn vì sợ không đạt tiêu chuẩn tự đặt ra. Xu hướng chỉ trích người khác và bản thân quá mức có thể tạo ra căng thẳng không cần thiết.',
            O: 'Cuộc cách mạng dữ liệu và phân tích số tạo ra nhu cầu khổng lồ về những người có tư duy chính xác như Xử Nữ. Ngành y tế và công nghệ đang phát triển mạnh mẽ đúng với thế mạnh của họ.',
            T: 'Xu hướng phân tích quá nhiều có thể khiến Xử Nữ bỏ lỡ cơ hội vì do dự. Sự phát triển của AI có thể thay thế một số công việc phân tích và xử lý dữ liệu thông thường.',
        },
        loveStyle:
            'Xử Nữ yêu bằng cách phục vụ — họ thể hiện tình cảm qua những hành động chăm sóc chu đáo và thiết thực. Họ cần thời gian để mở lòng nhưng khi đã yêu, họ là người bạn đời tận tụy và đáng tin cậy nhất.',
    },
    {
        name: 'Libra',
        nameVN: 'Thiên Bình',
        symbol: '♎',
        element: 'Air',
        from: [9, 23],
        to: [10, 22],
        traits: ['Công bằng', 'Hòa nhã', 'Thẩm mỹ'],
        traitsVN: ['Công bằng', 'Hòa nhã', 'Thẩm mỹ'],
        rulingPlanet: 'Sao Kim',
        quality: 'Cơ Bản',
        description:
            'Thiên Bình là hiện thân của sự cân bằng, công bằng và cái đẹp — họ có khả năng nhìn nhận mọi vấn đề từ nhiều góc độ và tìm ra giải pháp hài hòa cho tất cả. Khiếu thẩm mỹ tinh tế và tài năng ngoại giao bẩm sinh làm cho Thiên Bình trở thành người kết nối và hòa giải lý tưởng.',
        careers: ['Luật sư', 'Thiết kế thời trang', 'Ngoại giao', 'Tư vấn hòa giải', 'Thời trang nghệ thuật'],
        strengths: ['Công bằng khách quan', 'Ngoại giao tinh tế', 'Thẩm mỹ xuất sắc', 'Hòa nhã dễ chịu'],
        weaknesses: ['Thiếu quyết đoán', 'Tránh xung đột', 'Phụ thuộc vào người khác', 'Nông cạn'],
        swot: {
            S: 'Thiên Bình có khả năng nhìn nhận mọi vấn đề một cách khách quan và tìm ra giải pháp công bằng cho tất cả các bên. Sức hút cá nhân và khả năng ngoại giao giúp họ xây dựng các mối quan hệ và liên minh bền vững.',
            W: 'Khó khăn trong việc đưa ra quyết định vì luôn thấy cả hai phía đều có lý là điểm yếu đặc trưng của Thiên Bình. Xu hướng tránh xung đột đôi khi khiến họ không bảo vệ được lợi ích và quan điểm của chính mình.',
            O: 'Thế giới đang ngày càng cần các nhà đàm phán, nhà hòa giải và chuyên gia giải quyết xung đột có kỹ năng. Ngành thiết kế và thời trang đang phát triển mạnh, phù hợp với khiếu thẩm mỹ của Thiên Bình.',
            T: 'Trong môi trường kinh doanh đòi hỏi quyết định nhanh và dứt khoát, sự do dự của Thiên Bình có thể là bất lợi lớn. Người khác có thể lợi dụng mong muốn hòa thuận của họ để áp đặt ý kiến.',
        },
        loveStyle:
            'Thiên Bình sinh ra để yêu — họ là người bạn đời lãng mạn, chu đáo và luôn nỗ lực tạo ra sự hài hòa trong mối quan hệ. Họ cần một nửa đủ mạnh để giúp họ đưa ra quyết định khi họ do dự.',
    },
    {
        name: 'Scorpio',
        nameVN: 'Hổ Cáp',
        symbol: '♏',
        element: 'Water',
        from: [10, 23],
        to: [11, 21],
        traits: ['Quyết tâm', 'Bí ẩn', 'Sâu sắc'],
        traitsVN: ['Quyết tâm', 'Bí ẩn', 'Sâu sắc'],
        rulingPlanet: 'Sao Diêm Vương',
        quality: 'Cố Định',
        description:
            'Hổ Cáp là cung bí ẩn và mãnh liệt nhất hoàng đạo — họ nhìn thấu tâm can người khác và không bao giờ bằng lòng với những gì bề ngoài. Sức mạnh, quyết tâm và khả năng tái sinh sau nghịch cảnh làm cho Hổ Cáp trở thành một trong những cung mạnh mẽ và đáng sợ nhất.',
        careers: ['Thám tử điều tra', 'Tâm lý học', 'Phẫu thuật y khoa', 'Tình báo an ninh', 'Đầu tư tài chính'],
        strengths: ['Quyết tâm kiên cường', 'Trực giác sâu sắc', 'Khả năng tái sinh', 'Tập trung cao độ'],
        weaknesses: ['Ghen tuông', 'Thù dai', 'Kiểm soát', 'Nghi ngờ'],
        swot: {
            S: 'Hổ Cáp có ý chí và quyết tâm không gì có thể lay chuyển — họ sẽ không bỏ cuộc cho đến khi đạt được mục tiêu. Trực giác sắc bén giúp họ đọc vị người khác và nhận ra sự thật ẩn sau những lớp ngụy trang.',
            W: 'Xu hướng ghen tuông và nghi ngờ có thể phá hủy những mối quan hệ tốt đẹp. Thói quen trả thù và không tha thứ tiêu tốn năng lượng tinh thần và cản trở sự phát triển cá nhân.',
            O: 'Ngành tình báo, điều tra và phân tích chuyên sâu đang cần những người có khả năng nhìn thấu vấn đề như Hổ Cáp. Lĩnh vực đầu tư rủi ro cao và tái cơ cấu doanh nghiệp phù hợp với bản năng biến đổi của họ.',
            T: 'Bản năng kiểm soát có thể tạo ra xung đột với những người cần không gian tự do. Chiều sâu cảm xúc cực đoan có thể khiến Hổ Cáp dễ tổn thương khi bị phản bội.',
        },
        loveStyle:
            'Hổ Cáp yêu một cách toàn bộ và mãnh liệt — không có chỗ cho sự hời hợt trong tình yêu của họ. Họ cần sự trung thành tuyệt đối và đổi lại sẽ cho đi tình yêu sâu sắc và bảo vệ người họ yêu đến tận cùng.',
    },
    {
        name: 'Sagittarius',
        nameVN: 'Nhân Mã',
        symbol: '♐',
        element: 'Fire',
        from: [11, 22],
        to: [12, 21],
        traits: ['Phiêu lưu', 'Lạc quan', 'Triết học'],
        traitsVN: ['Phiêu lưu', 'Lạc quan', 'Triết học'],
        rulingPlanet: 'Sao Mộc',
        quality: 'Biến Đổi',
        description:
            'Nhân Mã là nhà thám hiểm và triết nhân của hoàng đạo — luôn hướng về chân trời mới với trái tim lạc quan và tâm hồn tự do. Họ khao khát hiểu biết, trải nghiệm và tìm kiếm ý nghĩa cuộc sống qua những chuyến hành trình. Nhân Mã mang đến ánh sáng và hy vọng cho những ai xung quanh.',
        careers: ['Du lịch khám phá', 'Triết học giảng dạy', 'Tôn giáo tâm linh', 'Xuất bản sách', 'Thể thao mạo hiểm'],
        strengths: ['Lạc quan không ngừng', 'Phiêu lưu dũng cảm', 'Tư duy triết học', 'Hào phóng cởi mở'],
        weaknesses: ['Thiếu cam kết', 'Thiếu kiên nhẫn', 'Nói thẳng gây tổn thương', 'Bất cẩn'],
        swot: {
            S: 'Nhân Mã có tầm nhìn rộng mở và khả năng truyền cảm hứng cho người khác bằng sự lạc quan và nhiệt huyết của mình. Tinh thần phiêu lưu và ham học hỏi giúp họ tích lũy kiến thức và trải nghiệm đa dạng.',
            W: 'Sự thiếu kiên nhẫn và ngại cam kết lâu dài khiến Nhân Mã khó hoàn thành những dự án đòi hỏi sự bền bỉ. Xu hướng nói thẳng không cân nhắc đôi khi gây tổn thương người khác một cách vô tình.',
            O: 'Thế giới toàn cầu hóa và du lịch quốc tế tạo ra sân chơi vô tận cho tinh thần phiêu lưu của Nhân Mã. Nhu cầu về người truyền cảm hứng, giảng viên và nhà tư vấn chiến lược đang tăng cao.',
            T: 'Sự cam kết thiếu bền vững có thể làm mất đi những mối quan hệ và cơ hội quý giá. Cuộc sống tự do không ràng buộc có thể dẫn đến sự thiếu ổn định về tài chính và tinh thần về lâu dài.',
        },
        loveStyle:
            'Nhân Mã cần người bạn đời là bạn đồng hành trong cuộc phiêu lưu sống — họ yêu tự do và không chịu được sự giam cầm trong các mối quan hệ. Tình yêu với Nhân Mã là một cuộc hành trình khám phá không có điểm đến cuối cùng.',
    },
];

function getSunSign(month, day) {
    for (const z of ZODIAC) {
        const [fm, fd] = z.from;
        const [tm, td] = z.to;
        if (fm > tm) { // wraps year (Capricorn)
            if ((month === fm && day >= fd) || (month === tm && day <= td)) return z;
        } else {
            if ((month === fm && day >= fd) || (month > fm && month < tm) || (month === tm && day <= td)) return z;
        }
    }
    return ZODIAC[0]; // fallback
}

// Moon sign: approx. Moon moves ~13°/day, full cycle ~27.3 days.
// Simple offset from a known reference point (2000-01-01 = Scorpio ~16°).
function getMoonSign(year, month, day) {
    const ref = new Date(2000, 0, 1);
    const target = new Date(year, month - 1, day);
    const daysDiff = Math.round((target - ref) / 86400000);
    const moonDeg = ((daysDiff * 13.176) % 360 + 360) % 360;
    const signIndex = Math.floor(moonDeg / 30);
    const sign = ZODIAC[signIndex % 12];
    return { ...sign, _confidence: 'low' };
}

function computeWesternChart(userData) {
    const { year, month, day } = userData;
    const sun  = getSunSign(month, day);
    const moon = getMoonSign(year, month, day);
    const elements = {};
    [sun, moon].forEach(s => { elements[s.element] = (elements[s.element] || 0) + 1; });
    const elementArr = Object.entries(elements).map(([element, count]) => ({ element, count }))
        .sort((a, b) => b.count - a.count);
    return {
        sun_sign: { ...sun, personality: { traitsVN: sun.traitsVN, traits: sun.traits } },
        moon_sign: moon,
        elements: elementArr,
        summary: {}
    };
}

// ─── Element Name Mapping (Vietnamese + Icon) ───────────────────────────────

const ELEMENT_META = {
    Fire:  { icon: '🔥', labelVN: 'Lửa' },
    Earth: { icon: '🌍', labelVN: 'Đất' },
    Air:   { icon: '💨', labelVN: 'Khí' },
    Water: { icon: '🌊', labelVN: 'Nước' },
};

// ─── Element Bar Component ───────────────────────────────────────────────────

const ElementBar = ({ element, count, total }) => {
    const meta = ELEMENT_META[element] || { icon: '❓', labelVN: element };
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="element-bar-row">
            <span className="element-bar-label">
                {meta.icon} {meta.labelVN} ({element})
            </span>
            <div className="element-bar-track">
                <div
                    className="element-bar-fill"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="element-bar-count">{count}/{total}</span>
        </div>
    );
};

// ─── Empty State ─────────────────────────────────────────────────────────────

const NoDataMessage = () => {
    const navigate = useNavigate();
    return (
        <div className="tab-pane fade-in">
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                <h3>Chưa có dữ liệu</h3>
                <p style={{ color: '#8892b0', margin: '1rem 0' }}>
                    Vui lòng nhập ngày sinh để xem Tử Vi Phương Tây.
                </p>
                <button
                    className="premium-button"
                    onClick={() => navigate('/')}
                >
                    NHẬP NGÀY SINH
                </button>
            </div>
        </div>
    );
};

// ─── Zodiac Detail Card ───────────────────────────────────────────────────────

const ZodiacDetail = ({ sign, title }) => (
    <div className="glass-card western-section" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{sign.symbol}</span>
            <div>
                <h3 style={{ margin: 0, color: 'var(--gold)' }}>{title}: {sign.nameVN} ({sign.name})</h3>
                <small style={{ color: '#8892b0' }}>{sign.rulingPlanet} · {sign.element} · {sign.quality}</small>
            </div>
        </div>

        <p style={{ color: '#ccd6f6', lineHeight: 1.7, marginBottom: '1.5rem' }}>{sign.description}</p>

        {/* Careers */}
        <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--gold)', marginBottom: '0.75rem' }}>💼 Nghề nghiệp phù hợp</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {sign.careers.map((c, i) => (
                    <span key={i} className="western-tag career-tag">{c}</span>
                ))}
            </div>
        </div>

        {/* Strengths & Weaknesses side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
                <h4 style={{ color: '#64ffda', marginBottom: '0.75rem' }}>✅ Ưu điểm</h4>
                <ul style={{ paddingLeft: '1.2rem', color: '#ccd6f6', lineHeight: 1.8 }}>
                    {sign.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </div>
            <div>
                <h4 style={{ color: '#ff6b6b', marginBottom: '0.75rem' }}>⚠️ Khuyết điểm</h4>
                <ul style={{ paddingLeft: '1.2rem', color: '#ccd6f6', lineHeight: 1.8 }}>
                    {sign.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
            </div>
        </div>

        {/* SWOT */}
        <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--gold)', marginBottom: '0.75rem' }}>📊 Phân tích SWOT</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                    { key: 'S', label: 'Strengths — Điểm mạnh', color: '#64ffda' },
                    { key: 'W', label: 'Weaknesses — Điểm yếu', color: '#ff6b6b' },
                    { key: 'O', label: 'Opportunities — Cơ hội', color: '#ffd700' },
                    { key: 'T', label: 'Threats — Thách thức', color: '#ff9f43' },
                ].map(({ key, label, color }) => (
                    <div key={key} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem', borderLeft: `3px solid ${color}` }}>
                        <div style={{ color, fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.4rem' }}>{label}</div>
                        <div style={{ color: '#a8b2d8', fontSize: '0.9rem', lineHeight: 1.6 }}>{sign.swot[key]}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Love style */}
        <div style={{ background: 'rgba(255,182,193,0.08)', borderRadius: '8px', padding: '1rem', borderLeft: '3px solid #ff69b4' }}>
            <h4 style={{ color: '#ff69b4', margin: '0 0 0.5rem' }}>💕 Phong cách tình cảm</h4>
            <p style={{ color: '#ccd6f6', margin: 0, lineHeight: 1.7 }}>{sign.loveStyle}</p>
        </div>
    </div>
);

// ─── Main Page Component ─────────────────────────────────────────────────────

const WesternPage = ({ userData }) => {
    // userData = inputParams from useBaziApi — computed client-side, no backend needed
    const hasInput = userData && userData.year && userData.month && userData.day;

    if (!hasInput) {
        return <NoDataMessage />;
    }

    const western = computeWesternChart(userData);
    const sun = western.sun_sign;
    const moon = western.moon_sign;
    const elements = western.elements || [];
    const totalElementCount = elements.reduce((s, e) => s + e.count, 0);

    const personality = sun.personality;
    const moonConfidence = moon?._confidence === 'low';

    return (
        <div className="tab-pane fade-in western-page">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="western-header glass-card">
                <h2>⭐ Tử Vi Phương Tây</h2>
                <p className="western-subtitle">
                    Đối chiếu Sun/Moon/Rising với nền tảng Bát Tự để hiểu thêm xu hướng tính cách.
                </p>
                <p className="western-disclaimer">
                    ⚠️ Kết quả chỉ mang tính tham khảo. Moon sign đang dùng thuật toán gần đúng;
                    Rising sign cần nơi sinh để tính chính xác.
                </p>
            </div>

            {/* ── Card 1: Ba Ngôi Sao Chính ──────────────────────────────── */}
            <div className="glass-card western-section">
                <h3 className="western-section-title">✨ Ba ngôi sao chính</h3>
                <div className="western-three-stars">
                    {/* Sun */}
                    <div className="western-star-card">
                        <div className="western-star-icon">{sun.symbol}</div>
                        <div className="western-star-name">{sun.nameVN} ({sun.name})</div>
                        <div className="western-star-role">Mặt Trời ☀️</div>
                        <div className="western-star-element">
                            {sun.rulingPlanet} · {sun.element} · {sun.quality}
                        </div>
                    </div>

                    {/* Moon */}
                    <div className="western-star-card">
                        <div className="western-star-icon">{moon?.symbol || '🌙'}</div>
                        <div className="western-star-name">{moon?.nameVN || moon?.name || '—'}</div>
                        <div className="western-star-role">Mặt Trăng 🌙</div>
                        <div className="western-star-element">
                            {moon?.rulingPlanet || '—'} · {moon?.element || '—'} · {moon?.quality || '—'}
                        </div>
                        {moonConfidence && (
                            <div className="western-star-note">⚠️ Gần đúng</div>
                        )}
                    </div>

                    {/* Rising */}
                    <div className="western-star-card">
                        <div className="western-star-icon">🌅</div>
                        <div className="western-star-name">—</div>
                        <div className="western-star-role">Thăng (Rising)</div>
                        <div className="western-star-note">
                            Cần nơi sinh để tính chính xác
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Card 2: Nguyên Tố Nổi Bật ──────────────────────────────── */}
            <div className="glass-card western-section">
                <h3 className="western-section-title">🔥 Nguyên tố nổi bật</h3>
                {elements.length > 0 ? (
                    <div className="western-elements">
                        {elements.map((el) => (
                            <ElementBar
                                key={el.element}
                                element={el.element}
                                count={el.count}
                                total={totalElementCount}
                            />
                        ))}
                        <p className="western-element-note">
                            Dựa trên Mặt Trời + Mặt Trăng. Phân bố này chỉ mang tính chất tham khảo nhanh.
                        </p>
                    </div>
                ) : (
                    <p style={{ color: '#8892b0' }}>Chưa có dữ liệu nguyên tố.</p>
                )}
            </div>

            {/* ── Card 3: Gợi Ý Tính Cách ────────────────────────────────── */}
            <div className="glass-card western-section">
                <h3 className="western-section-title">💡 Gợi ý tính cách</h3>

                {personality && (
                    <div className="western-traits-block">
                        <h4>Đặc điểm chính — {sun.nameVN}</h4>
                        <div className="western-trait-tags">
                            {(personality.traitsVN || personality.traits || []).map((t, i) => (
                                <span key={i} className="western-tag">{t}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="western-warning" style={{ marginTop: personality ? '1rem' : 0 }}>
                    <strong>⚠️ Lưu ý:</strong>{' '}
                    Moon sign hiện dùng thuật toán gần đúng (±1 cung), chỉ nên xem tham khảo.
                    Rising sign chưa được tính do thiếu thông tin nơi sinh.
                </div>
            </div>

            {/* ── ZodiacDetail: Sun Sign ──────────────────────────────────── */}
            <ZodiacDetail sign={sun} title="Mặt Trời ☀️" />

            {/* ── ZodiacDetail: Moon Sign ─────────────────────────────────── */}
            <ZodiacDetail sign={moon} title="Mặt Trăng 🌙" />
            {moonConfidence && (
                <p style={{ color: '#8892b0', fontSize: '0.85rem', marginTop: '0.5rem', paddingLeft: '0.25rem' }}>
                    ⚠️ Moon sign được tính bằng thuật toán gần đúng (sai số ±1 cung). Kết quả chỉ mang tính tham khảo.
                </p>
            )}
        </div>
    );
};

export default WesternPage;
