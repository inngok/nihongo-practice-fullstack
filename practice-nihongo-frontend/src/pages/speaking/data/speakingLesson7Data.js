export const speakingLesson7Data = {
  lessonId: 7,
  title: "Luyện Hội Thoại - Bài 7",
  baseConversation: [
    { role: 'A', text: "こんにちは。", isUser: true },
    { role: 'B', text: "こんにちは。今日は空いてますね。" },
    { role: 'A', text: "あのう、Bさんは[event_name]って興味がありますか。", isUser: true },
    { role: 'B', text: "え？" },
    { role: 'A', text: "実は今度[location]で[event_name]があるんです。それに参加しようと思ってるんですけど。", isUser: true },
    { role: 'B', text: "へえ。" },
    { role: 'A', text: "[time]なんですけど、もしお時間があったらBさんにも来て{{もらえるかなと思って}}……。", isUser: true },
    { role: 'B', text: "ああ、チラシをもらったかも。" },
    { role: 'A', text: "この[event_name]、[feature_topic]{{にしては}}[feature_result]って評判なんです。", isUser: true },
    { role: 'B', text: "へえ、そうなんだ。" },
    { role: 'A', text: "しかも、[purpose_topic]{{につき}}[purpose_result]んです。", isUser: true },
    { role: 'B', text: "ああ、いいね。あ、でも、雨だったらどうなるの？" },
    { role: 'A', text: "あ、そのときは、朝7時にホームページで延期のお知らせがあります。", isUser: true },
    { role: 'B', text: "そうなんだ。じゃ、行ってみようかな。" },
    { role: 'A', text: "わあ、ありがとうございます！", isUser: true }
  ],
  scenarios: [
    {
      id: "lesson7_base",
      title: "Bài mẫu gốc",
      jpDescription: "基本会話 (Hội thoại cơ bản)",
      viDescription: "Đoạn hội thoại gốc trong sách.",
      details: [],
      replacements: {
        event_name: "フリーマーケット",
        location: "さくら公園",
        time: "来週の日曜日",
        feature_topic: "中古品",
        feature_result: "いい物がある",
        purpose_topic: "300円のTシャツなら1枚",
        purpose_result: "30円の寄付ができる"
      },
      lineOverrides: {}
    },
    {
      id: "bamen3",
      title: "場面３ (フリーマーケット)",
      jpDescription: "あなたは友達とフリーマーケットに出店することにしました。同じ英語のクラスに通っているBさんにも来てもらいたいです。Bさんとは時々挨拶するくらいです。クラスで会ったとき、フリーマーケットについて説明し、都合を聞いて、誘ってください。",
      viDescription: "Bạn quyết định mở gian hàng ở chợ trời cùng bạn bè. Bạn muốn rủ B (người học cùng lớp tiếng Anh, thỉnh thoảng có chào hỏi) cùng tham gia.",
      details: [
        { label: "日時", value: "来週の土曜日と日曜日 午前8時から" },
        { label: "特徴", value: "自分が作った料理を出してもいいです。" },
        { label: "目的", value: "売り上げの2割がホームレスの寄付金になります。" }
      ],
      replacements: {
        event_name: "フリーマーケット",
        location: "さくら公園",
        time: "来週の日曜日",
        feature_topic: "中古品",
        feature_result: "いい物がある",
        purpose_topic: "売り上げ1000円",
        purpose_result: "200円がホームレスの寄付金になる"
      },
      lineOverrides: {}
    },
    {
      id: "bamen4",
      title: "場面４ (ボランティア活動)",
      jpDescription: "あなたはボランティア活動に参加することにしました。同じ英語の中級クラスに通っているBさんにも来てもらいたいです。Bさんとは時々挨拶するくらいです。クラスで会ったとき、ボランティア活動について説明し、都合を聞いて、誘ってください。",
      viDescription: "Bạn quyết định tham gia hoạt động tình nguyện. Bạn muốn rủ B (người học cùng lớp tiếng Anh trung cấp, thỉnh thoảng có chào hỏi) cùng tham gia.",
      details: [
        { label: "日時", value: "毎週の土曜日 午前8時から10時まで" },
        { label: "活動内容", value: "地方の孤児院で子どもたちに初級レベルの英語を教える。" },
        { label: "特典", value: "活動に参加する人は後である英語の中級コースに無料で参加できる。" }
      ],
      replacements: {
        event_name: "ボランティア活動",
        location: "地方の孤児院",
        time: "毎週の土曜日",
        feature_topic: "初級レベルの英語",
        feature_result: "自分の勉強にもなる",
        purpose_topic: "参加者1人",
        purpose_result: "英語の中級コースに無料で参加できる"
      },
      lineOverrides: {
        7: { role: 'B', text: "孤児院？へえ、興味あるな。" },
        11: { role: 'B', text: "ああ、いいね。あ、でも、私英語にあまり自信がないんだけど、大丈夫？" },
        12: { role: 'A', text: "あ、初級レベルを教えるから、心配しなくても大丈夫ですよ。", isUser: true }
      }
    }
  ]
};
