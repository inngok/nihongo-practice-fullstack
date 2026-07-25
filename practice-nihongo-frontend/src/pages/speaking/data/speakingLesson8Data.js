export const speakingLesson8Data = {
  lessonId: 8,
  title: "Luyện Hội Thoại - Bài 8",
  baseConversation: [
    { role: 'A', text: "あのう、店長、今よろしいですか。", textHiragana: "あのう、店長(てんちょう)、今(いま)よろしいですか。", translation: "Dạ thưa cửa hàng trưởng, bây giờ anh/chị có rảnh không ạ?", isUser: true },
    { role: 'B', text: "あ、Aさん、どうしたの？", textHiragana: "あ、Aさん、どうしたの？", translation: "À, A đấy à, có chuyện gì vậy?" },
    { role: 'A', text: "[topic]{{のことなんですが}}……。", textHiragana: "[topic]{{のことなんですが}}……。", translation: "Dạ, về việc [topic] ạ...", isUser: true },
    { role: 'B', text: "[topic]？", textHiragana: "[topic]？", translation: "[topic] á?" },
    { role: 'A', text: "はい。すみませんが、[time]、[duration]、[activity]を休ま{{せていただけませんか}}。実は、[reason]んです。", textHiragana: "はい。すみませんが、[time]、[duration]、[activity]を休(やす)ま{{せていただけませんか}}。実(じつ)は、[reason]んです。", translation: "Vâng. Xin lỗi anh/chị nhưng vào [time], cho phép em nghỉ [activity] [duration] được không ạ? Thực ra là [reason].", isUser: true },
    { role: 'B', text: "ああ、そう。それで、いつからいつまで？", textHiragana: "ああ、そう。それで、いつからいつまで？", translation: "À, vậy à. Thế nghỉ từ lúc nào đến lúc nào?" },
    { role: 'A', text: "[date_from]から[date_to]までなんですが。", textHiragana: "[date_from]から[date_to]までなんですが。", translation: "Dạ từ [date_from] đến [date_to] ạ.", isUser: true },
    { role: 'B', text: "えっ、[manager_concern]？ うーん、忙しいときだねえ。", textHiragana: "えっ、[manager_concern]？ うーん、忙(いそが)しいときだねえ。", translation: "Hả, [manager_concern] cơ à? Ưm, lúc đó đang bận rộn đấy nhỉ." },
    { role: 'A', text: "はあ……、すみません。でも、[reason_detail]{{ものですから}}、私が[action]なければならなくて……。その間、私の{{代わりに}}、[substitute]さんが[substitute_action]って言ってくださっているんですが。", textHiragana: "はあ……、すみません。でも、[reason_detail]{{ものですから}}、私(わたし)が[action]なければならなくて……。その間(あいだ)、私(わたし)の{{代(か)わりに}}、[substitute]さんが[substitute_action]って言(い)ってくださっているんですが。", translation: "Dạ... em xin lỗi. Nhưng vì [reason_detail], em phải [action]... Trong khoảng thời gian đó, bạn [substitute] có nói là sẽ [substitute_action] thay em ạ.", isUser: true },
    { role: 'B', text: "あ、そうか。じゃ、大丈夫だね。わかった。", textHiragana: "あ、そうか。じゃ、大丈夫(だいじょうぶ)だね。わかった。", translation: "À, vậy à. Thế thì không sao rồi. Anh/chị hiểu rồi." },
    { role: 'A', text: "ありがとうございます。ご迷惑をかけてすみません。", textHiragana: "ありがとうございます。ご迷惑(めいわく)をかけてすみません。", translation: "Em cảm ơn ạ. Em xin lỗi vì đã làm phiền anh/chị.", isUser: true }
  ],
  scenarios: [
    {
      id: "lesson8_base",
      title: "Bài mẫu gốc",
      jpDescription: "基本会話 (Hội thoại cơ bản)",
      viDescription: "Đoạn hội thoại gốc trong sách.",
      audioUrl: "/audio/lesson8_base.mp3",
      personA: "",
      personB: "",
      replacements: {
        topic: "来月(らいげつ)のシフト", time: "来月(らいげつ)", duration: "1週間(しゅうかん)", activity: "アルバイト", reason: "国(くに)から家族(かぞく)が来(く)る", date_from: "23日(にち)", date_to: "30日(にち)", manager_concern: "月末(げつまつ)", reason_detail: "みんな日本語(にほんご)がわからない", action: "案内(あんない)し", substitute: "田中(たなか)", substitute_action: "入(はい)る"
      },
      replacementsVi: {
        topic: "lịch làm việc tháng sau", time: "tháng sau", duration: "1 tuần", activity: "làm thêm", reason: "gia đình từ nước nhà sang", date_from: "ngày 23", date_to: "ngày 30", manager_concern: "cuối tháng", reason_detail: "mọi người không biết tiếng Nhật", action: "hướng dẫn", substitute: "Tanaka", substitute_action: "làm thay"
      },
      lineOverrides: {}
    },
    {
      id: "lesson8_bamen5",
      title: "場面5 (第8課)",
      personA: "あなたはアルバイトをしています。来月末の1週間、友人が結婚するので、ふるさとへ帰りたいです。休みをもらえるように、店長に丁寧に頼んでください。",
      personA_vi: "Bạn đang làm thêm. Một tuần vào cuối tháng sau, một người bạn sẽ kết hôn nên bạn muốn về quê. Hãy xin phép cửa hàng trưởng một cách lịch sự để được nghỉ phép.",
      personB: "あなたは店長です。店は月末とても忙しいです。Aさんの話をよく聞いて、Aさんの代わりにアルバイトをやってもらう人がいるか確認してから、休む許可を出してください。",
      personB_vi: "Bạn là cửa hàng trưởng. Cửa hàng rất bận rộn vào cuối tháng. Hãy lắng nghe A nói, xác nhận xem có người làm thay A không rồi mới cho phép A nghỉ.",
      replacements: {
        topic: "来(らい)月(げつ)のシフト", time: "来月末(らいげつまつ)", duration: "1週間(しゅうかん)", activity: "アルバイト", reason: "友人(ゆうじん)の結婚式(けっこんしき)がある", date_from: "24日(にち)", date_to: "30日(にち)", manager_concern: "月末(げつまつ)", reason_detail: "どうしても出席(しゅっせき)したい", action: "ふるさとへ帰(かえ)ら", substitute: "田中(たなか)", substitute_action: "シフトに入(はい)る"
      },
      replacementsVi: {
        topic: "lịch làm việc tháng sau", time: "cuối tháng sau", duration: "1 tuần", activity: "làm thêm", reason: "có lễ cưới của bạn", date_from: "ngày 24", date_to: "ngày 30", manager_concern: "cuối tháng", reason_detail: "tôi nhất định muốn tham dự", action: "về quê", substitute: "Tanaka", substitute_action: "làm thay ca"
      },
      lineOverrides: {}
    }
  ]
};
