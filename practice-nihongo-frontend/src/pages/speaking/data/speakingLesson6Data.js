export const speakingLesson6Data = {
  lessonId: 6,
  title: "Luyện Hội Thoại - Bài 6",
  baseConversation: [
    { role: 'A', text: "Bさん、どうしたの？ 元気ないね。", isUser: true },
    { role: 'B', text: "うん、なんだか最近体の調子が悪くて。" },
    { role: 'A', text: "ええ、大丈夫？", isUser: true },
    { role: 'B', text: "うーん。それに、[symptom]なくて。" },
    { role: 'A', text: "[reason]ばかり[reason_verb]いるんじゃない？", isUser: true },
    { role: 'B', text: "うん。[reason_excuse]から。" },
    { role: 'A', text: "それじゃ、体調を崩すよ。きっと[cause]だね。[condition]ときこそ[suggestion1_example]{{のような}}[suggestion1_type]が体にいいんだよ。", isUser: true },
    { role: 'B', text: "[suggestion1_type]ね。" },
    { role: 'A', text: "そう。それに、日本では[context]{{として}}[suggestion2]をよく[suggestion2_verb]よ。[suggestion2]は[benefit]があるからね。[context_short]は[suggestion2]{{に限る}}って言われてるんだよ。", isUser: true },
    { role: 'B', text: "へえ。" }
  ],
  scenarios: [
    {
      id: "lesson6_base",
      title: "Bài mẫu gốc",
      jpDescription: "基本会話 (Hội thoại cơ bản)",
      viDescription: "Đoạn hội thoại gốc trong sách.",
      details: [],
      replacements: {
        symptom: "食欲も",
        reason: "冷たい物",
        reason_verb: "飲んで",
        reason_excuse: "暑い",
        cause: "夏バテ",
        condition: "暑い",
        suggestion1_example: "スープ",
        suggestion1_type: "温かい物",
        context: "夏の食べ物",
        suggestion2: "ウナギ",
        suggestion2_verb: "食べる",
        benefit: "栄養",
        context_short: "夏"
      },
      lineOverrides: {}
    },
    {
      id: "lesson6_bamen1",
      title: "場面１ (食欲がない)",
      jpDescription: "友達のBさんは体の調子が良くないようです。話を聞いて、どうしたらいいか、アドバイスしてください。よく言われている体にいい食べ物についても話してください。",
      viDescription: "Bạn của bạn (B) có vẻ không khoẻ. Hãy nghe chuyện và khuyên xem nên làm gì. Hãy nói về những thức ăn tốt cho cơ thể mà người ta thường nói.",
      details: [
        { label: "Bの症状", value: "最近、あまり食欲がありません。" },
        { label: "原因", value: "季節が変わったために、体調を崩してしまった。" }
      ],
      replacements: {
        symptom: "食欲も",
        reason: "冷たい物",
        reason_verb: "飲んで",
        reason_excuse: "暑い",
        cause: "夏バテ",
        condition: "暑い",
        suggestion1_example: "スープ",
        suggestion1_type: "温かい物",
        context: "夏の食べ物",
        suggestion2: "ウナギ",
        suggestion2_verb: "食べる",
        benefit: "栄養",
        context_short: "夏"
      },
      lineOverrides: {}
    },
    {
      id: "lesson6_bamen2",
      title: "場面２ (寝られない)",
      jpDescription: "友達のBさんは具合が良くないようです。話を聞いて、どうしたらいいか、アドバイスしてください。寝られるようにいい方法についても話してください。",
      viDescription: "Bạn của bạn (B) có vẻ không khoẻ. Hãy nghe chuyện và khuyên xem nên làm gì. Hãy nói về phương pháp tốt để có thể ngủ được.",
      details: [
        { label: "Bの症状", value: "最近、あまり寝られません。" },
        { label: "原因", value: "忙しくて、体調を崩してしまった。" }
      ],
      replacements: {
        symptom: "あまり寝られ",
        reason: "スマホ",
        reason_verb: "見て",
        reason_excuse: "忙しい",
        cause: "ストレス",
        condition: "寝られない",
        suggestion1_example: "ホットミルク",
        suggestion1_type: "温かい飲み物",
        context: "睡眠にいい方法",
        suggestion2: "アロマ",
        suggestion2_verb: "使う",
        benefit: "リラックス効果",
        context_short: "寝られないとき"
      },
      lineOverrides: {
        4: { role: 'A', text: "夜遅くまで[reason]ばかり[reason_verb]いるんじゃない？", isUser: true }
      }
    }
  ]
};
