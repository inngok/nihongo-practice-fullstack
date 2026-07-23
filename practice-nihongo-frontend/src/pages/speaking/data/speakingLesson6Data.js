export const speakingLesson6Data = {
  lessonId: 6,
  title: "Luyện Hội Thoại - Bài 6",
  baseConversation: [
    { role: 'A', text: "Bさん、どうしたの？ 元気ないね。", textHiragana: "Bさん、どうしたの？ 元気(げんき)ないね。", translation: "B này, sao thế? Trông cậu có vẻ không khỏe nhỉ.", isUser: true },
    { role: 'B', text: "うん、なんだか最近体の調子が悪くて。", textHiragana: "うん、なんだか最近(さいきん)体(からだ)の調子(ちょうし)が悪(わる)くて。", translation: "Ừ, dạo này tự nhiên thấy trong người không được khỏe." },
    { role: 'A', text: "ええ、大丈夫？", textHiragana: "ええ、大丈夫(だいじょうぶ)？", translation: "Ơ, có sao không vậy?", isUser: true },
    { role: 'B', text: "うーん。それに、[symptom]なくて。", textHiragana: "うーん。それに、[symptom]なくて。", translation: "Ừm... Hơn nữa, cũng [symptom] nữa." },
    { role: 'A', text: "[reason]ばかり[reason_verb]いるんじゃない？", textHiragana: "[reason]ばかり[reason_verb]いるんじゃない？", translation: "Chắc lại toàn [reason_verb] [reason] chứ gì?", isUser: true },
    { role: 'B', text: "うん。[reason_excuse]から。", textHiragana: "うん。[reason_excuse]から。", translation: "Ừ. Vì [reason_excuse] mà." },
    { role: 'A', text: "それじゃ、体調を崩すよ。きっと[cause]だね。[condition]ときこそ[suggestion1_example]{{のような}}[suggestion1_type]が体にいいんだよ。", textHiragana: "それじゃ、体調(たいちょう)を崩(くず)すよ。きっと[cause]だね。[condition]ときこそ[suggestion1_example]{{のような}}[suggestion1_type]が体(からだ)にいいんだよ。", translation: "Thế thì đổ bệnh là phải. Chắc chắn là bị [cause] rồi. Chính vào lúc [condition] thì những [suggestion1_type] như [suggestion1_example] mới tốt cho cơ thể đấy.", isUser: true },
    { role: 'B', text: "[suggestion1_type]ね。", textHiragana: "[suggestion1_type]ね。", translation: "[suggestion1_type] à." },
    { role: 'A', text: "そう。それに、日本では[context]{{として}}[suggestion2]をよく[suggestion2_verb]よ。[suggestion2]は[benefit]があるからね。[context_short]は[suggestion2]{{に限る}}って言われてるんだよ。", textHiragana: "そう。それに、日本(にほん)では[context]{{として}}[suggestion2]をよく[suggestion2_verb]よ。[suggestion2]は[benefit]があるからね。[context_short]は[suggestion2]{{に限(かぎ)る}}って言(い)われてるんだよ。", translation: "Ừ. Với lại, ở Nhật Bản, [suggestion2] thường được [suggestion2_verb] như là [context]. Bởi vì [suggestion2] có [benefit] mà. Người ta bảo [context_short] là cứ phải [suggestion2] mới là nhất đấy.", isUser: true },
    { role: 'B', text: "へえ。", textHiragana: "へえ。", translation: "Vậy sao..." }
  ],
  scenarios: [
    {
      id: "lesson6_base",
      title: "Bài mẫu gốc",
      jpDescription: "基本会話 (Hội thoại cơ bản)",
      viDescription: "Đoạn hội thoại gốc trong sách.",
      audioUrl: "/audio/lesson6_base.mp3",
      details: [],
      replacements: {
        symptom: "食欲(しょくよく)も",
        reason: "冷(つめ)たい物(もの)",
        reason_verb: "飲(の)んで",
        reason_excuse: "暑(あつ)い",
        cause: "夏(なつ)バテ",
        condition: "暑(あつ)い",
        suggestion1_example: "スープ",
        suggestion1_type: "温(あたた)かい物(もの)",
        context: "夏(なつ)の食(た)べ物(もの)",
        suggestion2: "ウナギ",
        suggestion2_verb: "食(た)べる",
        benefit: "栄養(えいよう)",
        context_short: "夏(なつ)"
      },
      replacementsVi: {
        symptom: "cảm giác thèm ăn",
        reason: "đồ lạnh",
        reason_verb: "uống",
        reason_excuse: "trời nóng",
        cause: "cảm nắng",
        condition: "nóng nực",
        suggestion1_example: "súp",
        suggestion1_type: "đồ ăn ấm",
        context: "thức ăn mùa hè",
        suggestion2: "lươn",
        suggestion2_verb: "ăn",
        benefit: "dinh dưỡng",
        context_short: "mùa hè"
      },
      lineOverrides: {}
    },
    {
      id: "lesson6_bamen1",
      title: "場面1-① (食欲がない)",
      jpDescription: "友達のBさんは体の調子が良くないようです。話を聞いて、どうしたらいいか、アドバイスしてください。よく言われている体にいい食べ物についても話してください。",
      viDescription: "Bạn của bạn (B) có vẻ không khoẻ. Hãy nghe chuyện và khuyên xem nên làm gì. Hãy nói về những thức ăn tốt cho cơ thể mà người ta thường nói.",
      details: [
        { label: "Bの症状", value: "最近、あまり食欲がありません。" },
        { label: "原因", value: "季節が変わったために、体調を崩してしまった。" }
      ],
      replacements: {
        symptom: "食欲(しょくよく)も",
        reason: "冷(つめ)たい物(もの)",
        reason_verb: "飲(の)んで",
        reason_excuse: "暑(あつ)い",
        cause: "夏(なつ)バテ",
        condition: "暑(あつ)い",
        suggestion1_example: "スープ",
        suggestion1_type: "温(あたた)かい物(もの)",
        context: "夏(なつ)の食(た)べ物(もの)",
        suggestion2: "ウナギ",
        suggestion2_verb: "食(た)べる",
        benefit: "栄養(えいよう)",
        context_short: "夏(なつ)"
      },
      replacementsVi: {
        symptom: "cảm giác thèm ăn",
        reason: "đồ lạnh",
        reason_verb: "uống",
        reason_excuse: "trời nóng",
        cause: "cảm nắng",
        condition: "nóng nực",
        suggestion1_example: "súp",
        suggestion1_type: "đồ ăn ấm",
        context: "thức ăn mùa hè",
        suggestion2: "lươn",
        suggestion2_verb: "ăn",
        benefit: "dinh dưỡng",
        context_short: "mùa hè"
      },
      lineOverrides: {}
    },
    {
      id: "lesson6_bamen1_2",
      title: "場面1-② (疲れやすい)",
      jpDescription: "友達のBさんは体の調子が良くないようです。話を聞いて、どうしたらいいか、アドバイスしてください。よく言われている体にいい食べ物についても話してください。",
      viDescription: "Bạn của bạn (B) có vẻ không khoẻ. Hãy nghe chuyện và khuyên xem nên làm gì. Hãy nói về những thức ăn tốt cho cơ thể mà người ta thường nói.",
      details: [
        { label: "Bの症状", value: "最近、とても疲れやすいです。" },
        { label: "原因", value: "勉強や仕事が忙しくて、体調を崩してしまったようです。" }
      ],
      replacements: {
        symptom: "疲(つか)れやすく",
        reason: "仕事(しごと)や勉強(べんきょう)",
        reason_verb: "して",
        reason_excuse: "忙(いそが)しい",
        cause: "疲(つか)れ",
        condition: "疲(つか)れやすい",
        suggestion1_example: "スープ",
        suggestion1_type: "温(あたた)かい物(もの)",
        context: "スタミナ料理(りょうり)",
        suggestion2: "ウナギ",
        suggestion2_verb: "食(た)べる",
        benefit: "栄養(えいよう)",
        context_short: "疲(つか)れているとき"
      },
      replacementsVi: {
        symptom: "dễ mệt mỏi",
        reason: "công việc hay học tập",
        reason_verb: "làm",
        reason_excuse: "bận rộn",
        cause: "sự mệt mỏi",
        condition: "dễ bị mệt",
        suggestion1_example: "súp",
        suggestion1_type: "đồ ăn ấm",
        context: "món ăn bồi bổ thể lực (stamina)",
        suggestion2: "lươn",
        suggestion2_verb: "ăn",
        benefit: "dinh dưỡng",
        context_short: "khi mệt mỏi"
      },
      lineOverrides: {
        3: { role: 'B', text: "うーん。それに、最近とても[symptom]て。", textHiragana: "うーん。それに、最近とても[symptom]て。", translation: "Ừm... Hơn nữa, dạo này tớ rất [symptom]." }
      }
    },
    {
      id: "lesson6_bamen1_3",
      title: "場面1-③ (肌の調子が悪い)",
      jpDescription: "友達のBさんは体の調子が良くないようです。話を聞いて、どうしたらいいか、アドバイスしてください。よく言われている体にいい食べ物についても話してください。",
      viDescription: "Bạn của bạn (B) có vẻ không khoẻ. Hãy nghe chuyện và khuyên xem nên làm gì. Hãy nói về những thức ăn tốt cho cơ thể mà người ta thường nói.",
      details: [
        { label: "Bの症状", value: "最近、肌の調子が良くありません。" },
        { label: "原因", value: "睡眠不足のために、体調を崩してしまったようです。" }
      ],
      replacements: {
        symptom: "肌(はだ)が荒(あ)れ",
        reason: "夜更(よふ)かし",
        reason_verb: "して",
        reason_excuse: "最近(さいきん)睡眠不足(すいみんふそく)",
        cause: "睡眠不足(すいみんふそく)",
        condition: "肌(はだ)が荒(あ)れている",
        suggestion1_example: "果物(くだもの)",
        suggestion1_type: "ビタミンが多(おお)い物(もの)",
        context: "肌(はだ)にいい食(た)べ物(もの)",
        suggestion2: "野菜(やさい)や果物(くだもの)",
        suggestion2_verb: "食(た)べる",
        benefit: "ビタミン",
        context_short: "肌荒(はだあ)れ"
      },
      replacementsVi: {
        symptom: "da dẻ sần sùi",
        reason: "thức khuya",
        reason_verb: "thức",
        reason_excuse: "dạo này thiếu ngủ",
        cause: "thiếu ngủ",
        condition: "da dẻ sần sùi",
        suggestion1_example: "trái cây",
        suggestion1_type: "đồ ăn có nhiều vitamin",
        context: "thức ăn tốt cho da",
        suggestion2: "rau xanh và trái cây",
        suggestion2_verb: "ăn",
        benefit: "vitamin",
        context_short: "da sần sùi"
      },
      lineOverrides: {
        3: { role: 'B', text: "うーん。それに、最近[symptom]て。", textHiragana: "うーん。それに、最近[symptom]て。", translation: "Ừm... Hơn nữa, dạo này [symptom]." },
        5: { role: 'B', text: "うん。[reason_excuse]だから。", textHiragana: "うん。[reason_excuse]だから。", translation: "Ừ. Vì [reason_excuse] mà." }
      }
    },
    {
      id: "lesson6_bamen1_4",
      title: "場面1-④ (胃の調子が悪い)",
      jpDescription: "友達のBさんは体の調子が良くないようです。話を聞いて、どうしたらいいか、アドバイスしてください。よく言われている体にいい食べ物についても話してください。",
      viDescription: "Bạn của bạn (B) có vẻ không khoẻ. Hãy nghe chuyện và khuyên xem nên làm gì. Hãy nói về những thức ăn tốt cho cơ thể mà người ta thường nói.",
      details: [
        { label: "Bの症状", value: "最近、胃の調子が良くありません。" },
        { label: "原因", value: "食べ過ぎ・飲み過ぎのために、体調を崩してしまったようです。" }
      ],
      replacements: {
        symptom: "胃(い)の調子(ちょうし)が悪(わる)く",
        reason: "お酒(さけ)",
        reason_verb: "飲(の)んで",
        reason_excuse: "飲(の)み会(かい)が続(つづ)いた",
        cause: "食(た)べ過(す)ぎ・飲(の)み過(す)ぎ",
        condition: "胃(い)の調子(ちょうし)が悪(わる)い",
        suggestion1_example: "お粥(かゆ)",
        suggestion1_type: "お腹(なか)にいい物(もの)",
        context: "胃(い)に優(やさ)しい食(た)べ物(もの)",
        suggestion2: "お粥(かゆ)",
        suggestion2_verb: "食(た)べる",
        benefit: "胃(い)を休(やす)める効果(こうか)",
        context_short: "胃(い)の調子(ちょうし)が悪(わる)いとき"
      },
      replacementsVi: {
        symptom: "dạ dày không tốt",
        reason: "rượu bia",
        reason_verb: "uống",
        reason_excuse: "tiệc tùng kéo dài",
        cause: "ăn uống quá chén",
        condition: "dạ dày không tốt",
        suggestion1_example: "cháo",
        suggestion1_type: "đồ ăn tốt cho bụng",
        context: "thức ăn tốt cho dạ dày",
        suggestion2: "cháo",
        suggestion2_verb: "ăn",
        benefit: "hiệu quả giúp dạ dày nghỉ ngơi",
        context_short: "khi dạ dày không tốt"
      },
      lineOverrides: {
        3: { role: 'B', text: "うーん。それに、最近とても[symptom]て。", textHiragana: "うーん。それに、最近とても[symptom]て。", translation: "Ừm... Hơn nữa, dạo này [symptom] quá." }
      }
    },
    {
      id: "lesson6_bamen2",
      title: "場面2-① (寝られない)",
      jpDescription: "友達のBさんは具合が良くないようです。話を聞いて、どうしたらいいか、アドバイスしてください。寝られるようにいい方法についても話してください。",
      viDescription: "Bạn của bạn (B) có vẻ không khoẻ. Hãy nghe chuyện và khuyên xem nên làm gì. Hãy nói về phương pháp tốt để có thể ngủ được.",
      details: [
        { label: "Bの症状", value: "最近、あまり寝られません。" },
        { label: "原因", value: "忙しくて、体調を崩してしまった。" }
      ],
      replacements: {
        symptom: "あまり寝(ね)られ",
        reason: "スマホ",
        reason_verb: "見(み)て",
        reason_excuse: "忙(いそが)しい",
        cause: "ストレス",
        condition: "寝(ね)られない",
        suggestion1_example: "温(あたた)かいミルク",
        suggestion1_type: "温(あたた)かい飲(の)み物(もの)",
        context: "睡眠(すいみん)にいい方法(ほうほう)",
        suggestion2: "お風呂(ふろ)",
        suggestion2_verb: "入(はい)る",
        benefit: "リラックス効果(こうか)",
        context_short: "寝(ね)られないとき"
      },
      replacementsVi: {
        symptom: "ngủ được",
        reason: "điện thoại thông minh",
        reason_verb: "xem",
        reason_excuse: "bận rộn",
        cause: "căng thẳng",
        condition: "không ngủ được",
        suggestion1_example: "sữa ấm",
        suggestion1_type: "đồ uống ấm",
        context: "phương pháp tốt cho giấc ngủ",
        suggestion2: "bồn tắm",
        suggestion2_verb: "ngâm",
        benefit: "hiệu quả thư giãn",
        context_short: "khi không ngủ được"
      },
      lineOverrides: {
        4: { role: 'A', text: "夜遅くまで[reason]ばかり[reason_verb]いるんじゃない？", textHiragana: "夜遅(よるおそ)くまで[reason]ばかり[reason_verb]いるんじゃない？", translation: "Chắc lại toàn [reason_verb] [reason] cho đến tận đêm khuya chứ gì?", isUser: true },
        8: { role: 'A', text: "そう。それに、日本では[context]{{として}}[suggestion2]にゆっくり[suggestion2_verb]よ。[suggestion2]は[benefit]があるからね。[context_short]は[suggestion2]{{に限る}}って言われてるんだよ。", textHiragana: "そう。それに、日本(にほん)では[context]{{として}}[suggestion2]にゆっくり[suggestion2_verb]よ。[suggestion2]は[benefit]があるからね。[context_short]は[suggestion2]{{に限(かぎ)る}}って言(い)われてるんだよ。", translation: "Ừ. Với lại, ở Nhật Bản, mọi người thường thong thả [suggestion2_verb] [suggestion2] như là [context]. Bởi vì [suggestion2] có [benefit] mà. Người ta bảo [context_short] là cứ phải [suggestion2] mới là nhất đấy.", isUser: true }
      }
    },
    {
      id: "lesson6_bamen2_2",
      title: "場面2-② (疲れが取れない)",
      jpDescription: "友達のBさんは具合が良くないようです。話を聞いて、どうしたらいいか、アドバイスしてください。疲れが取れるようにいい方法についても話してください。",
      viDescription: "Bạn của bạn (B) có vẻ không khoẻ. Hãy nghe chuyện và khuyên xem nên làm gì. Hãy nói về phương pháp tốt để có thể xua tan mệt mỏi.",
      details: [
        { label: "Bの症状", value: "最近、疲れが取れません。" },
        { label: "原因", value: "残業が続いて、体調を崩してしまったようです。" }
      ],
      replacements: {
        symptom: "疲(つか)れが取(と)れ",
        reason: "仕事(しごと)",
        reason_verb: "して",
        reason_excuse: "残業(ざんぎょう)が続(つづ)いている",
        cause: "疲(つか)れ",
        condition: "疲(つか)れている",
        suggestion1_example: "ストレッチ",
        suggestion1_type: "軽(かる)い運動(うんどう)",
        context: "疲(つか)れをとる方法(ほうほう)",
        suggestion2: "お風呂(ふろ)",
        suggestion2_verb: "入(はい)る",
        benefit: "リラックス効果(こうか)",
        context_short: "疲(つか)れたとき"
      },
      replacementsVi: {
        symptom: "hết mệt",
        reason: "công việc",
        reason_verb: "làm",
        reason_excuse: "tăng ca liên tục",
        cause: "mệt mỏi",
        condition: "mệt mỏi",
        suggestion1_example: "giãn cơ",
        suggestion1_type: "vận động nhẹ nhàng",
        context: "phương pháp xua tan mệt mỏi",
        suggestion2: "bồn tắm",
        suggestion2_verb: "ngâm",
        benefit: "hiệu quả thư giãn",
        context_short: "khi mệt mỏi"
      },
      lineOverrides: {
        4: { role: 'A', text: "夜遅くまで[reason]ばかり[reason_verb]いるんじゃない？", textHiragana: "夜遅(よるおそ)くまで[reason]ばかり[reason_verb]いるんじゃない？", translation: "Chắc lại toàn [reason_verb] [reason] cho đến tận đêm khuya chứ gì?", isUser: true },
        8: { role: 'A', text: "そう。それに、日本では[context]{{として}}[suggestion2]にゆっくり[suggestion2_verb]よ。[suggestion2]は[benefit]があるからね。[context_short]は[suggestion2]{{に限る}}って言われてるんだよ。", textHiragana: "そう。それに、日本(にほん)では[context]{{として}}[suggestion2]にゆっくり[suggestion2_verb]よ。[suggestion2]は[benefit]があるからね。[context_short]は[suggestion2]{{に限(かぎ)る}}って言(い)われてるんだよ。", translation: "Ừ. Với lại, ở Nhật Bản, mọi người thường thong thả [suggestion2_verb] [suggestion2] như là [context]. Bởi vì [suggestion2] có [benefit] mà. Người ta bảo [context_short] là cứ phải [suggestion2] mới là nhất đấy.", isUser: true }
      }
    },
    {
      id: "lesson6_bamen2_3",
      title: "場面2-③ (夜よく目が覚める)",
      jpDescription: "友達のBさんは具合が良くないようです。話を聞いて、どうしたらいいか、アドバイスしてください。ぐっすり眠れるようにいい方法についても話してください。",
      viDescription: "Bạn của bạn (B) có vẻ không khoẻ. Hãy nghe chuyện và khuyên xem nên làm gì. Hãy nói về phương pháp tốt để có thể ngủ say.",
      details: [
        { label: "Bの症状", value: "最近、夜よく目が覚めます。" },
        { label: "原因", value: "考え事が多くて、体調を崩してしまったようです。" }
      ],
      replacements: {
        symptom: "夜(よる)よく目(め)が覚(さ)め",
        reason: "考(かんが)え事(ごと)",
        reason_verb: "して",
        reason_excuse: "考(かんが)え事(ごと)が多(おお)い",
        cause: "ストレス",
        condition: "ぐっすり眠(ねむ)れない",
        suggestion1_example: "温(あたた)かいミルク",
        suggestion1_type: "飲(の)み物(もの)",
        context: "ぐっすり眠(ねむ)る方法(ほうほう)",
        suggestion2: "お風呂(ふろ)",
        suggestion2_verb: "入(はい)る",
        benefit: "リラックス効果(こうか)",
        context_short: "眠(ねむ)れないとき"
      },
      replacementsVi: {
        symptom: "hay bị tỉnh giấc giữa đêm",
        reason: "suy nghĩ lung tung",
        reason_verb: "ngồi",
        reason_excuse: "nhiều tâm sự",
        cause: "căng thẳng",
        condition: "không ngủ ngon",
        suggestion1_example: "sữa nóng",
        suggestion1_type: "đồ uống",
        context: "cách để ngủ ngon",
        suggestion2: "bồn tắm",
        suggestion2_verb: "ngâm",
        benefit: "hiệu quả thư giãn",
        context_short: "khi không ngủ được"
      },
      lineOverrides: {
        3: { role: 'B', text: "うーん。それに、最近[symptom]て。", textHiragana: "うーん。それに、最近[symptom]て。", translation: "Ừm... Hơn nữa, dạo này tớ [symptom]." },
        4: { role: 'A', text: "夜遅くまで[reason]ばかり[reason_verb]いるんじゃない？", textHiragana: "夜遅(よるおそ)くまで[reason]ばかり[reason_verb]いるんじゃない？", translation: "Chắc lại toàn [reason_verb] [reason] cho đến tận đêm khuya chứ gì?", isUser: true },
        8: { role: 'A', text: "そう。それに、日本では[context]{{として}}[suggestion2]にゆっくり[suggestion2_verb]よ。[suggestion2]は[benefit]があるからね。[context_short]は[suggestion2]{{に限る}}って言われてるんだよ。", textHiragana: "そう。それに、日本(にほん)では[context]{{として}}[suggestion2]にゆっくり[suggestion2_verb]よ。[suggestion2]は[benefit]があるからね。[context_short]は[suggestion2]{{に限(かぎ)る}}って言(い)われてるんだよ。", translation: "Ừ. Với lại, ở Nhật Bản, mọi người thường thong thả [suggestion2_verb] [suggestion2] như là [context]. Bởi vì [suggestion2] có [benefit] mà. Người ta bảo [context_short] là cứ phải [suggestion2] mới là nhất đấy.", isUser: true }
      }
    },
    {
      id: "lesson6_bamen2_4",
      title: "場面2-④ (朝起きられない)",
      jpDescription: "友達のBさんは具合が良くないようです。話を聞いて、どうしたらいいか、アドバイスしてください。朝すっきり起きられるようにいい方法についても話してください。",
      viDescription: "Bạn của bạn (B) có vẻ không khoẻ. Hãy nghe chuyện và khuyên xem nên làm gì. Hãy nói về phương pháp tốt để có thể tỉnh táo thức dậy vào buổi sáng.",
      details: [
        { label: "Bの症状", value: "最近、朝なかなか起きられません。" },
        { label: "原因", value: "夜遅くまでスマホを見ていて、体調を崩してしまったようです。" }
      ],
      replacements: {
        symptom: "朝(あさ)なかなか起(お)きられ",
        reason: "スマホ",
        reason_verb: "見(み)て",
        reason_excuse: "遅(おそ)くまで起(お)きている",
        cause: "睡眠不足(すいみんふそく)",
        condition: "朝起(あさお)きられない",
        suggestion1_example: "早(はや)く寝(ね)る",
        suggestion1_type: "習慣(しゅうかん)",
        context: "朝(あさ)すっきり起(お)きる方法(ほうほう)",
        suggestion2: "寝(ね)る前(まえ)にスマホを見(み)ない",
        suggestion2_verb: "こと",
        benefit: "目覚(めざ)めにいい",
        context_short: "朝(あさ)すっきり起(お)きたいとき"
      },
      replacementsVi: {
        symptom: "dậy nổi",
        reason: "điện thoại",
        reason_verb: "xem",
        reason_excuse: "thức khuya",
        cause: "thiếu ngủ",
        condition: "không dậy nổi",
        suggestion1_example: "ngủ sớm",
        suggestion1_type: "thói quen",
        context: "cách để tỉnh táo thức dậy",
        suggestion2: "không xem điện thoại trước khi ngủ",
        suggestion2_verb: "việc",
        benefit: "tốt cho việc thức giấc",
        context_short: "khi muốn buổi sáng tỉnh táo"
      },
      lineOverrides: {
        4: { role: 'A', text: "夜遅くまで[reason]ばかり[reason_verb]いるんじゃない？", textHiragana: "夜遅(よるおそ)くまで[reason]ばかり[reason_verb]いるんじゃない？", translation: "Chắc lại toàn [reason_verb] [reason] cho đến tận đêm khuya chứ gì?", isUser: true },
        6: { role: 'A', text: "それじゃ、体調を崩すよ。きっと[cause]だね。[condition]ときは、[suggestion1_example]のが体にいいんだよ。", textHiragana: "それじゃ、体調(たいちょう)を崩(くず)すよ。きっと[cause]だね。[condition]ときは、[suggestion1_example]のが体(からだ)にいいんだよ。", translation: "Thế thì đổ bệnh là phải. Chắc chắn là do [cause] rồi. Khi [condition] thì việc [suggestion1_example] là tốt nhất đấy.", isUser: true },
        7: { role: 'B', text: "[suggestion1_example]か。", textHiragana: "[suggestion1_example]か。", translation: "[suggestion1_example] à." },
        8: { role: 'A', text: "そう。それに、[context_short]は[suggestion2]のが[benefit]からね。[context_short]は[suggestion2]{{に限る}}って言われてるんだよ。", textHiragana: "そう。それに、[context_short]は[suggestion2]のが[benefit]からね。[context_short]は[suggestion2]{{に限(かぎ)る}}って言(い)われてるんだよ。", translation: "Ừ. Với lại, khi [context_short] thì việc [suggestion2] sẽ [benefit] mà. Người ta bảo khi [context_short] thì cứ phải [suggestion2] là nhất đấy.", isUser: true }
      }
    }
  ]
};
