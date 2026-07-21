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
      details: [],
      replacements: {
        topic: "来月(らいげつ)のシフト",
        time: "来月(らいげつ)",
        duration: "1週間(しゅうかん)",
        activity: "アルバイト",
        reason: "国(くに)から家族(かぞく)が来(く)る",
        date_from: "23日(にち)",
        date_to: "30日(にち)",
        manager_concern: "月末(げつまつ)",
        reason_detail: "みんな日本語(にほんご)がわからない",
        action: "案内(あんない)し",
        substitute: "田中(たなか)",
        substitute_action: "入(はい)る"
      },
      replacementsVi: {
        topic: "lịch làm việc tháng sau",
        time: "tháng sau",
        duration: "1 tuần",
        activity: "làm thêm",
        reason: "gia đình từ nước nhà sang",
        date_from: "ngày 23",
        date_to: "ngày 30",
        manager_concern: "cuối tháng",
        reason_detail: "mọi người không biết tiếng Nhật",
        action: "hướng dẫn",
        substitute: "Tanaka",
        substitute_action: "vào làm"
      },
      lineOverrides: {}
    },
    {
      id: "lesson8_bamen5_1",
      title: "場面5-① (実家の引っ越し)",
      jpDescription: "あなたはアルバイトをしています。来週の3日間、実家の引っ越しを手伝わなければならないので、休みたいです。休みをもらえるように、店長に丁寧に頼んでください。",
      viDescription: "Bạn đang làm thêm. Trong 3 ngày tuần tới, vì phải phụ giúp gia đình chuyển nhà nên bạn muốn xin nghỉ. Hãy xin phép cửa hàng trưởng cho nghỉ một cách lịch sự.",
      details: [
        { label: "状況", value: "来週の3日間休みたい" },
        { label: "理由", value: "実家の引っ越し" },
        { label: "代わり", value: "Dさん" }
      ],
      replacements: {
        topic: "来週(らいしゅう)のシフト",
        time: "来週(らいしゅう)",
        duration: "3日間(みっかかん)",
        activity: "アルバイト",
        reason: "実家(じっか)が引っ越(ひっこ)しする",
        date_from: "月曜日(げつようび)",
        date_to: "水曜日(すいようび)",
        manager_concern: "3日間(みっかかん)",
        reason_detail: "人手(ひとで)が足(た)りない",
        action: "手伝(てつだ)わ",
        substitute: "D",
        substitute_action: "入(はい)る"
      },
      replacementsVi: {
        topic: "lịch làm việc tuần sau",
        time: "tuần sau",
        duration: "3 ngày",
        activity: "làm thêm",
        reason: "gia đình em chuyển nhà",
        date_from: "thứ 2",
        date_to: "thứ 4",
        manager_concern: "3 ngày cơ à",
        reason_detail: "gia đình đang thiếu người phụ",
        action: "về phụ giúp",
        substitute: "D",
        substitute_action: "vào làm"
      },
      lineOverrides: {}
    },
    {
      id: "lesson8_bamen5_2",
      title: "場面5-② (親の手術の付き添い)",
      jpDescription: "あなたはアルバイトをしています。来月、親が手術するので、1週間休んで付き添いたいです。休みをもらえるように、店長に丁寧に頼んでください。",
      viDescription: "Bạn đang làm thêm. Tháng sau, vì bố mẹ phẫu thuật nên bạn muốn xin nghỉ 1 tuần để ở bên chăm sóc. Hãy xin phép cửa hàng trưởng một cách lịch sự.",
      details: [
        { label: "状況", value: "来月の1週間休みたい" },
        { label: "理由", value: "親の手術の付き添い" },
        { label: "代わり", value: "Eさん" }
      ],
      replacements: {
        topic: "来月(らいげつ)のシフト",
        time: "来月(らいげつ)",
        duration: "1週間(しゅうかん)",
        activity: "アルバイト",
        reason: "親(おや)が手術(しゅじゅつ)する",
        date_from: "10日(とおか)",
        date_to: "16日(じゅうろくにち)",
        manager_concern: "1週間(しゅうかん)も",
        reason_detail: "ほかに家族(かぞく)がいない",
        action: "付(つ)き添(そ)わ",
        substitute: "E",
        substitute_action: "入(はい)る"
      },
      replacementsVi: {
        topic: "lịch làm việc tháng sau",
        time: "tháng sau",
        duration: "1 tuần",
        activity: "làm thêm",
        reason: "bố/mẹ em phải phẫu thuật",
        date_from: "mùng 10",
        date_to: "ngày 16",
        manager_concern: "tận 1 tuần cơ à",
        reason_detail: "không có người nhà nào khác",
        action: "ở bên chăm sóc",
        substitute: "E",
        substitute_action: "vào làm"
      },
      lineOverrides: {}
    },
    {
      id: "lesson8_bamen5_3",
      title: "場面5-③ (資格試験の準備)",
      jpDescription: "あなたはアルバイトをしています。再来週、大切な資格試験があるので、3日間休んで勉強したいです。休みをもらえるように、店長に丁寧に頼んでください。",
      viDescription: "Bạn đang làm thêm. Tuần sau nữa, vì có kỳ thi lấy chứng chỉ quan trọng nên bạn muốn xin nghỉ 3 ngày để học. Hãy xin phép cửa hàng trưởng một cách lịch sự.",
      details: [
        { label: "状況", value: "再来週の3日間休みたい" },
        { label: "理由", value: "資格試験の準備" },
        { label: "代わり", value: "Fさん" }
      ],
      replacements: {
        topic: "再来週(さらいしゅう)のシフト",
        time: "再来週(さらいしゅう)",
        duration: "3日間(みっかかん)",
        activity: "アルバイト",
        reason: "資格試験(しかくしけん)がある",
        date_from: "水曜日(すいようび)",
        date_to: "金曜日(きんようび)",
        manager_concern: "3日間(みっかかん)",
        reason_detail: "今回(こんかい)の試験(しけん)はどうしても合格(ごうかく)したい",
        action: "集中(しゅうちゅう)して勉強(べんきょう)し",
        substitute: "F",
        substitute_action: "入(はい)る"
      },
      replacementsVi: {
        topic: "lịch làm việc tuần sau nữa",
        time: "tuần sau nữa",
        duration: "3 ngày",
        activity: "làm thêm",
        reason: "em có kỳ thi chứng chỉ",
        date_from: "thứ 4",
        date_to: "thứ 6",
        manager_concern: "3 ngày cơ à",
        reason_detail: "kỳ thi lần này em rất muốn đậu",
        action: "tập trung học",
        substitute: "F",
        substitute_action: "vào làm"
      },
      lineOverrides: {}
    },
    {
      id: "lesson8_bamen5_4",
      title: "場面5-④ (妹の卒業式)",
      jpDescription: "あなたはアルバイトをしています。来月、妹の卒業式に出るために、2日間ふるさとへ帰りたいです。休みをもらえるように、店長に丁寧に頼んでください。",
      viDescription: "Bạn đang làm thêm. Tháng sau, vì muốn tham dự lễ tốt nghiệp của em gái nên bạn muốn xin nghỉ 2 ngày để về quê. Hãy xin phép cửa hàng trưởng một cách lịch sự.",
      details: [
        { label: "状況", value: "来月の2日間休みたい" },
        { label: "理由", value: "妹の卒業式に出席するため" },
        { label: "代わり", value: "Gさん" }
      ],
      replacements: {
        topic: "来月(らいげつ)のシフト",
        time: "来月(らいげつ)",
        duration: "2日間(ふつかかん)",
        activity: "アルバイト",
        reason: "妹(いもうと)の卒業式(そつぎょうしき)がある",
        date_from: "15日(じゅうごにち)",
        date_to: "16日(じゅうろくにち)",
        manager_concern: "2日間(ふつかかん)",
        reason_detail: "家族(かぞく)みんなで出席(しゅっせき)する",
        action: "ふるさとへ帰(かえ)ら",
        substitute: "G",
        substitute_action: "入(はい)る"
      },
      replacementsVi: {
        topic: "lịch làm việc tháng sau",
        time: "tháng sau",
        duration: "2 ngày",
        activity: "làm thêm",
        reason: "em gái em có lễ tốt nghiệp",
        date_from: "ngày 15",
        date_to: "ngày 16",
        manager_concern: "2 ngày cơ à",
        reason_detail: "cả gia đình đều muốn tham dự",
        action: "về quê",
        substitute: "G",
        substitute_action: "vào làm"
      },
      lineOverrides: {}
    }
  ]
};
