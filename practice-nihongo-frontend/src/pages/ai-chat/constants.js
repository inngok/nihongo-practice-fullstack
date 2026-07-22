export const SCENARIOS = [
  {
    id: "casual_friend",
    num: "01",
    title: "Trò chuyện thân mật",
    subTitle: "Kenji (Bạn thân)",
    desc: "Tán gẫu tự do, nói về cuối tuần, sở thích bằng văn phong suồng sã của giới trẻ Nhật Bản (Kougotai).",
    firstMsg: "お疲れ！最近どう？週末何する予定？",
    firstMsgTranslation: "Chào cậu! Dạo này thế nào rồi? Cuối tuần này cậu có kế hoạch gì chưa?",
    initialSuggestions: [
      { text: "お疲れ！最近はバイトで忙しいよ。", translation: "Chào cậu! Dạo này tớ bận làm thêm quá." },
      { text: "特に予定ないから、一緒にどこか行かない？", translation: "Tớ chưa có kế hoạch gì cả, hay tụi mình đi đâu chơi đi?" },
      { text: "週末は家でゆっくり映画を見るつもり！", translation: "Cuối tuần tớ định ở nhà thảnh thơi xem phim thôi!" }
    ]
  },
  {
    id: "ramen_shop",
    num: "02",
    title: "Gọi món quán Ramen",
    subTitle: "Tenin (Nhân viên quán)",
    desc: "Vào vai thực khách gọi món mì Ramen, chọn độ mềm của mì, toppings và thực hiện thanh toán.",
    firstMsg: "いらっしゃいませ！ご注文はお決まりですか？麺のかたさはどうなさいますか？",
    firstMsgTranslation: "Chào mừng quý khách! Quý khách đã quyết định chọn món chưa ạ? Quý khách muốn độ cứng của mì thế nào ạ?",
    initialSuggestions: [
      { text: "はい、醤油ラーメンを一つお願いします。", translation: "Vâng, cho tôi một bát mì Shoyu Ramen." },
      { text: "麺はかためでお願いします！", translation: "Cho tôi mì sợi cứng nhé!" },
      { text: "トッピングにチャーシューを追加してください。", translation: "Vui lòng thêm thịt xá xíu làm topping." }
    ]
  },
  {
    id: "hotel_reception",
    num: "03",
    title: "Nhận phòng Khách sạn",
    subTitle: "Receptionist (Lễ tân)",
    desc: "Thực hiện các thủ tục check-in, hỏi dịch vụ phòng, gửi hành lý bằng kính ngữ Nhật Bản (Keigo).",
    firstMsg: "いらっしゃいませ。京都グランドホテルへようこそ。本日ご宿泊のご予約でお間違いないでしょうか？",
    firstMsgTranslation: "Chào mừng quý khách đến với khách sạn Kyoto Grand Hotel. Quý khách đã đặt phòng lưu trú hôm nay đúng không ạ?",
    initialSuggestions: [
      { text: "はい、グエンという名前で予約しております。", translation: "Vâng, tôi đặt phòng dưới tên Nguyen." },
      { text: "チェックインをお願いします。パスポートはこちらです。", translation: "Vui lòng làm thủ tục check-in cho tôi. Hộ chiếu của tôi đây ạ." },
      { text: "荷物を部屋まで運んでいただけますか？", translation: "Anh/chị có thể chuyển giúp hành lý lên phòng cho tôi không?" }
    ]
  },
  {
    id: "asking_directions",
    num: "04",
    title: "Hỏi đường ở Shibuya",
    subTitle: "Passerby (Người qua đường)",
    desc: "Luyện tập hỏi đường đi bộ ra ga Shibuya, siêu thị hoặc quán cafe gần nhất bằng các câu nói lịch sự thường ngày.",
    firstMsg: "こんにちは！何かお困りですか？どちらに行きたいんでしょうか？",
    firstMsgTranslation: "Xin chào! Bạn đang gặp khó khăn gì ạ? Bạn muốn đi đến địa điểm nào vậy?",
    initialSuggestions: [
      { text: "すみません、渋谷駅へはどう行けばいいですか？", translation: "Xin lỗi, làm thế nào để đi đến ga Shibuya vậy ạ?" },
      { text: "この近くにコンビニはありますか？", translation: "Gần đây có cửa hàng tiện lợi nào không ạ?" },
      { text: "まっすぐ行って、右に曲がればいいですか？", translation: "Tôi cứ đi thẳng rồi rẽ phải đúng không ạ?" }
    ]
  },
  {
    id: "parttime_interview",
    num: "05",
    title: "Phỏng vấn xin việc",
    subTitle: "Manager (Quản lý cửa hàng)",
    desc: "Mô phỏng phỏng vấn xin việc làm thêm (Baito) tại cửa hàng tiện lợi Nhật Bản. Trả lời về ca làm và năng lực.",
    firstMsg: "それでは面接を始めますね。まずは簡単に自己紹介と、週に何回くらいシフトに入れるか教えてください。",
    firstMsgTranslation: "Vậy chúng ta bắt đầu phỏng vấn nhé. Trước tiên bạn hãy giới thiệu bản thân ngắn gọn và cho biết một tuần bạn có thể đăng ký làm mấy ca làm nhé.",
    initialSuggestions: [
      { text: "はじめまして、グエンと申します。週に3日、月水金に入れます。", translation: "Rất vui được gặp anh, tôi tên là Nguyen. Tôi có thể làm 1 tuần 3 buổi vào thứ 2, 4, 6." },
      { text: "コンビニでのアルバイト経験が1年あります。", translation: "Tôi đã có 1 năm kinh nghiệm làm thêm ở cửa hàng tiện lợi." },
      { text: "日本語はN3レベルですが、一生懸命頑張ります！", translation: "Tiếng Nhật của tôi ở trình độ N3, nhưng tôi sẽ cố gắng hết sức!" }
    ]
  }
];
