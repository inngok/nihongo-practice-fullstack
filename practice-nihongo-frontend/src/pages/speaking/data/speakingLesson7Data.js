export const speakingLesson7Data = {
  lessonId: 7,
  title: "Luyện Hội Thoại - Bài 7",
  baseConversation: [
    { role: 'A', text: "こんにちは。", textHiragana: "こんにちは。", translation: "Chào bạn.", isUser: true },
    { role: 'B', text: "こんにちは。今日は空いてますね。", textHiragana: "こんにちは。今日(きょう)は空(あ)いてますね。", translation: "Chào bạn. Hôm nay rảnh rỗi nhỉ." },
    { role: 'A', text: "あのう、Bさんは[event_name]って興味がありますか。", textHiragana: "あのう、Bさんは[event_name]って興味(きょうみ)がありますか。", translation: "À này, B có hứng thú với [event_name] không?", isUser: true },
    { role: 'B', text: "え？", textHiragana: "え？", translation: "Hả?" },
    { role: 'A', text: "実は今度[location]で[event_name]があるんです。それに[event_verb]と思ってるんですけど。", textHiragana: "実(じつ)は今度(こんど)[location]で[event_name]があるんです。それに[event_verb]と思(おも)ってるんですけど。", translation: "Thực ra sắp tới có [event_name] ở [location]. Tôi đang định [event_verb] cái đó.", isUser: true },
    { role: 'B', text: "へえ。", textHiragana: "へえ。", translation: "Ồ." },
    { role: 'A', text: "[time]なんですけど、もしお時間があったらBさんにも来てもらえるかなと思って……。", textHiragana: "[time]なんですけど、もしお時間(じかん)があったらBさんにも来(き)てもらえるかなと思(おも)って……。", translation: "Diễn ra vào [time], nếu có thời gian thì tôi nghĩ B cũng đến được nên...", isUser: true },
    { role: 'B', text: "ああ、チラシをもらったかも。", textHiragana: "ああ、チラシをもらったかも。", translation: "À, hình như tôi có nhận được tờ rơi rồi." },
    { role: 'A', text: "この[event_name]、[feature_topic]{{にしては}}[feature_result]って評判なんです。", textHiragana: "この[event_name]、[feature_topic]{{にしては}}[feature_result]って評判(ひょうばん)なんです。", translation: "Cái [event_name] này, tuy là [feature_topic] nhưng lại nổi tiếng là [feature_result] đấy.", isUser: true },
    { role: 'B', text: "へえ、そうなんだ。", textHiragana: "へえ、そうなんだ。", translation: "Chà, vậy cơ à." },
    { role: 'A', text: "しかも、[purpose_topic]{{につき}}[purpose_result]んです。", textHiragana: "しかも、[purpose_topic]{{につき}}[purpose_result]んです。", translation: "Hơn nữa, cứ mỗi [purpose_topic] thì [purpose_result].", isUser: true },
    { role: 'B', text: "ああ、いいね。あ、でも、雨だったらどうなるの？", textHiragana: "ああ、いいね。あ、でも、雨(あめ)だったらどうなるの？", translation: "À, hay đấy. Ơ, nhưng mà nếu trời mưa thì sao?" },
    { role: 'A', text: "あ、そのときは、朝7時にホームページで延期のお知らせがあります。", textHiragana: "あ、そのときは、朝(あさ)7時(じ)にホームページで延期(えんき)のお知(し)らせがあります。", translation: "À, khi đó thì 7 giờ sáng sẽ có thông báo hoãn trên trang chủ.", isUser: true },
    { role: 'B', text: "そうなんだ。じゃ、行ってみようかな。", textHiragana: "そうなんだ。じゃ、行(い)ってみようかな。", translation: "Ra là vậy. Thế thì tôi thử đi xem sao." },
    { role: 'A', text: "わあ、ありがとうございます！", textHiragana: "わあ、ありがとうございます！", translation: "Oa, cảm ơn bạn nhiều nhé!", isUser: true }
  ],
  scenarios: [
    {
      id: "lesson7_base",
      title: "Bài mẫu gốc",
      jpDescription: "基本会話 (Hội thoại cơ bản)",
      viDescription: "Đoạn hội thoại gốc trong sách.",
      audioUrl: "/audio/lesson7_base.mp3",
      personA: "",
      personB: "",
      replacements: {
        event_name: "フリーマーケット", location: "さくら公園(こうえん)", time: "来週(らいしゅう)の日曜日(にちようび)", event_verb: "参加(さんか)しよう", feature_topic: "中古品(ちゅうこひん)", feature_result: "いい物(もの)がある", purpose_topic: "300円(えん)のTシャツなら1枚(まい)", purpose_result: "30円(えん)の寄付(きふ)ができる"
      },
      replacementsVi: {
        event_name: "chợ đồ cũ", location: "công viên Sakura", time: "chủ nhật tuần sau", event_verb: "tham gia", feature_topic: "đồ cũ", feature_result: "có đồ tốt", purpose_topic: "mỗi chiếc áo thun 300 yên", purpose_result: "sẽ được quyên góp 30 yên"
      },
      lineOverrides: {
        8: { role: 'A', text: "この[event_name]、100ぐらいのお店が出るんですよ。[feature_topic]{{にしては}}[feature_result]って評判なんです。", textHiragana: "この[event_name]、100ぐらいのお店(みせ)が出(で)るんですよ。[feature_topic]{{にしては}}[feature_result]って評判(ひょうばん)なんです。", translation: "Cái [event_name] này, có khoảng 100 cửa hàng tham gia đấy. Tuy là [feature_topic] nhưng lại nổi tiếng là [feature_result].", isUser: true },
        10: { role: 'A', text: "しかも、売り上げの一部が介助犬の育成のために寄付されるんです。例えば、[purpose_topic]{{につき}}[purpose_result]んです。", textHiragana: "しかも、売(う)り上(あ)げの一部(いちぶ)が介助犬(かいじょけん)の育成(いくせい)のために寄付(きふ)されるんです。例(たと)えば、[purpose_topic]{{につき}}[purpose_result]んです。", translation: "Hơn nữa, một phần doanh thu sẽ được quyên góp để huấn luyện chó hỗ trợ. Ví dụ, cứ mỗi [purpose_topic] thì [purpose_result].", isUser: true }
      }
    },
    {
      id: "lesson7_bamen3",
      title: "場面3 (第7課)",
      personA: "あなたは友達とフリーマーケットに出店することにしました。同じ英語のクラスに通っているBさんにも来てもらいたいです。Bさんとは時々挨拶するくらいです。クラスで会ったとき、フリーマーケットについて説明し、都合を聞いて、誘ってください。",
      personA_vi: "Bạn quyết định mở gian hàng ở chợ trời cùng bạn bè. Bạn muốn rủ B (người học cùng lớp tiếng Anh, thỉnh thoảng có chào hỏi) cùng tham gia.",
      personA_details: [
        { label: "日時", value: "来週の土曜日と日曜日 午前8時から" },
        { label: "特徴", value: "このフリーマーケットには自分が作った料理を出してもいいです。" },
        { label: "目的", value: "商品の値段の2割がホームレスの寄付金になります。" }
      ],
      personB: "あなたはAさんと同じ英語のクラスに通っています。Aさんとは時々クラスで挨拶するくらいです。Aさんが話しかけてきました。話をよく聞いて、Aさんの誘いを受けてください。",
      personB_vi: "Bạn học cùng lớp tiếng Anh với A. Bạn thỉnh thoảng có chào hỏi A trong lớp. A đã đến bắt chuyện. Hãy nghe kỹ chuyện và nhận lời mời của A.",
      replacements: {
        event_name: "フリーマーケット", location: "さくら公園(こうえん)", time: "来週(らいしゅう)の土曜日(どようび)と日曜日(にちようび)の午前(ごぜん)8時(じ)から", event_verb: "出店(しゅってん)しよう", feature_topic: "フリーマーケット", feature_result: "自分(じぶん)が作(つく)った料理(りょうり)を出(だ)してもいい", purpose_topic: "売(う)れた商品(しょうひん)1つ", purpose_result: "値段(ねだん)の2割(わり)が寄付(きふ)される"
      },
      replacementsVi: {
        event_name: "chợ đồ cũ", location: "công viên Sakura", time: "từ 8 giờ sáng thứ 7 và chủ nhật tuần sau", event_verb: "mở gian hàng", feature_topic: "chợ đồ cũ", feature_result: "được phép bán đồ ăn tự nấu", purpose_topic: "mỗi sản phẩm bán ra", purpose_result: "20% giá sẽ được quyên góp"
      },
      lineOverrides: {}
    },
    {
      id: "lesson7_bamen4",
      title: "場面4 (第7課)",
      personA: "あなたはボランティア活動に参加することにしました。同じ英語の中級クラスに通っているBさんにも来てもらいたいです。Bさんとは時々挨拶するくらいです。クラスで会ったとき、ボランティア活動について説明し、都合を聞いて、誘ってください。",
      personA_vi: "Bạn quyết định tham gia hoạt động tình nguyện. Bạn muốn rủ B (học cùng lớp tiếng Anh trung cấp, thỉnh thoảng có chào hỏi) đến tham gia cùng.",
      personA_details: [
        { label: "日時", value: "毎週の土曜日 午前8時から10時まで" },
        { label: "特徴", value: "地方の孤児院で子どもたちに初級レベルの英語を教える。" },
        { label: "特典", value: "活動に参加する人は後で英語の中級コースに無料で参加できる。" }
      ],
      personB: "あなたはAさんと同じ英語の中級クラスに通っています。Aさんとは時々クラスで挨拶するくらいです。Aさんが話しかけてきました。話をよく聞いて、Aさんの誘いを受けてください。",
      personB_vi: "Bạn học cùng lớp tiếng Anh trung cấp với A. Bạn thỉnh thoảng có chào hỏi A trong lớp. A đã đến bắt chuyện. Hãy nghe kỹ chuyện và nhận lời mời của A.",
      replacements: {
        event_name: "ボランティア活動(かつどう)", location: "地方(ちほう)の孤児院(こじいん)", time: "毎週(まいしゅう)の土曜日(どようび)の午前(ごぜん)8時(じ)から10時(じ)まで", event_verb: "参加(さんか)しよう", feature_topic: "ボランティア", feature_result: "初級(しょきゅう)レベルで簡単(かんたん)だ", purpose_topic: "参加者(さんかしゃ)1人(ひとり)", purpose_result: "英語(えいご)の中級(ちゅうきゅう)コースに無料(むりょう)で参加(さんか)できる"
      },
      replacementsVi: {
        event_name: "hoạt động tình nguyện", location: "cô nhi viện ở địa phương", time: "8 giờ đến 10 giờ sáng thứ bảy hàng tuần", event_verb: "tham gia", feature_topic: "hoạt động tình nguyện", feature_result: "trình độ sơ cấp và dễ dàng", purpose_topic: "1 người tham gia", purpose_result: "sẽ được tham gia khóa học tiếng Anh trung cấp miễn phí"
      },
      lineOverrides: {}
    }
  ]
};
