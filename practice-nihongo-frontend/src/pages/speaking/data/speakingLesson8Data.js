export const speakingLesson8Data = {
  lessonId: 8,
  title: "Luyện Hội Thoại - Bài 8",
  baseConversation: [
    { role: 'A', text: "あのう、店長、今よろしいですか。", isUser: true },
    { role: 'B', text: "あ、Aさん、どうしたの？" },
    { role: 'A', text: "[topic]{{のことなんですが}}……。", isUser: true },
    { role: 'B', text: "[topic]？" },
    { role: 'A', text: "はい。すみませんが、[time]、[duration]、[activity]を休ま{{せていただけませんか}}。実は、[reason]んです。", isUser: true },
    { role: 'B', text: "ああ、そう。それで、いつからいつまで？" },
    { role: 'A', text: "[date_from]から[date_to]までなんですが。", isUser: true },
    { role: 'B', text: "えっ、[manager_concern]？ うーん、忙しいときだねえ。" },
    { role: 'A', text: "はあ……、すみません。でも、[reason_detail]{{ものですから}}、私が[action]なければならなくて……。その間、私の{{代わりに}}、[substitute]さんが[substitute_action]って言ってくださっているんですが。", isUser: true },
    { role: 'B', text: "あ、そうか。じゃ、大丈夫だね。わかった。" },
    { role: 'A', text: "ありがとうございます。ご迷惑をかけてすみません。", isUser: true }
  ],
  scenarios: [
    {
      id: "lesson8_base",
      title: "Bài mẫu gốc",
      jpDescription: "基本会話 (Hội thoại cơ bản)",
      viDescription: "Đoạn hội thoại gốc trong sách.",
      details: [],
      replacements: {
        topic: "来月のシフト",
        time: "来月",
        duration: "1週間",
        activity: "アルバイト",
        reason: "国から家族が来る",
        date_from: "23日",
        date_to: "30日",
        manager_concern: "月末",
        reason_detail: "みんな日本語がわからない",
        action: "案内し",
        substitute: "田中",
        substitute_action: "入る"
      },
      lineOverrides: {}
    },
    {
      id: "lesson8_bamen5",
      title: "場面５ (帰省)",
      jpDescription: "あなたはアルバイトをしています。来月末の1週間、友人が結婚するので、ふるさとへ帰りたいです。休みをもらえるように、店長に丁寧に頼んでください。",
      viDescription: "Bạn đang làm thêm. Một tuần cuối tháng sau, vì bạn thân kết hôn nên bạn muốn về quê. Hãy xin phép cửa hàng trưởng cho nghỉ một cách lịch sự.",
      details: [
        { label: "状況", value: "来月末の1週間休みたい" },
        { label: "理由", value: "友人が結婚するため、ふるさとへ帰る" }
      ],
      replacements: {
        topic: "来月のシフト",
        time: "来月末",
        duration: "1週間",
        activity: "アルバイト",
        reason: "友人が結婚する",
        date_from: "23日",
        date_to: "30日",
        manager_concern: "月末",
        reason_detail: "結婚式に出席したい",
        action: "帰省し",
        substitute: "佐藤",
        substitute_action: "シフトに入ってくれる"
      },
      lineOverrides: {}
    }
  ]
};
