export const speakingLesson10Data = {
  lessonId: 10,
  title: "Luyện Hội Thoại - Bài 10",
  baseConversation: [
    { role: 'B', text: "はい、[store_name]です。", textHiragana: "はい、[store_name]です。", translation: "Vâng, [store_name] xin nghe." },
    { role: 'A', text: "もしもし、今日のお昼にそちらで食事をした者なんですが。", textHiragana: "もしもし、今日(きょう)のお昼(ひる)にそちらで食事(しょくじ)をした者(もの)なんですが。", translation: "Alo, tôi là người đã dùng bữa ở đó vào trưa nay.", isUser: true },
    { role: 'B', text: "はい。", textHiragana: "はい。", translation: "Vâng." },
    { role: 'A', text: "そちらに[item]を忘れ{{てしまったようなんです}}。かばんに入れた{{つもりだったんですが}}、なかった{{もので}}……。", textHiragana: "そちらに[item]を忘(わす)れ{{てしまったようなんです}}。かばんに入(い)れた{{つもりだったんですが}}、なかった{{もので}}……。", translation: "Hình như tôi đã để quên [item] ở đó. Tôi cứ nghĩ là đã cho vào cặp rồi, nhưng mà không thấy nên...", isUser: true },
    { role: 'B', text: "そうですか。どんな[item]ですか。", textHiragana: "そうですか。どんな[item]ですか。", translation: "Vậy ạ. [item] đó trông như thế nào ạ?" },
    { role: 'A', text: "[item_description]です。", textHiragana: "[item_description]です。", translation: "Nó là [item_description].", isUser: true },
    { role: 'B', text: "どの辺りに座っていらっしゃいましたか。", textHiragana: "どの辺(あた)りに座(すわ)っていらっしゃいましたか。", translation: "Quý khách đã ngồi ở khoảng khu vực nào ạ?" },
    { role: 'A', text: "[seat_location]です。[place_left]に[action_left]{{ように思うんですが}}、もしかしたら、下に落ちているかもしれません。", textHiragana: "[seat_location]です。[place_left]に[action_left]{{ように思(おも)うんですが}}、もしかしたら、下(した)に落(お)ちているかもしれません。", translation: "Ở [seat_location]. Tôi nghĩ là đã [action_left] trên [place_left], nhưng biết đâu nó có thể bị rơi xuống dưới.", isUser: true },
    { role: 'B', text: "わかりました。少々お待ちください。……お待たせいたしました。こちらにございます。", textHiragana: "わかりました。少々(しょうしょう)お待(ま)ちください。……お待(ま)たせいたしました。こちらにございます。", translation: "Tôi hiểu rồi. Xin quý khách đợi một chút. ... Xin lỗi vì đã bắt quý khách phải đợi. Đồ của quý khách ở đây ạ." },
    { role: 'A', text: "ああ、よかったです。", textHiragana: "ああ、よかったです。", translation: "A, may quá.", isUser: true },
    { role: 'B', text: "どうしましょうか。", textHiragana: "どうしましょうか。", translation: "Quý khách muốn giải quyết thế nào ạ?" },
    { role: 'A', text: "あ、実はそちらには[reason]て、今は帰りの[transportation]の中なんです。", textHiragana: "あ、実(じつ)はそちらには[reason]て、今(いま)は帰(かえ)りの[transportation]の中(なか)なんです。", translation: "À, thực ra tôi [reason] đến đó, bây giờ tôi đang trên [transportation] đi về rồi.", isUser: true },
    { role: 'B', text: "あー、そうなんですか。", textHiragana: "あー、そうなんですか。", translation: "A, vậy ạ." },
    { role: 'A', text: "すみませんが、着払いの宅配便で送って{{もらってもいいですか}}。", textHiragana: "すみませんが、着払(ちゃくばら)いの宅配便(たくはいびん)で送(おく)って{{もらってもいいですか}}。", translation: "Xin lỗi, nhưng có thể gửi bằng dịch vụ chuyển phát trả tiền sau cho tôi được không?", isUser: true },
    { role: 'B', text: "はい、わかりました。では、お名前とご住所を……", textHiragana: "はい、わかりました。では、お名前(なまえ)とご住所(じゅうしょ)を……", translation: "Vâng, tôi hiểu rồi. Vậy xin cho biết tên và địa chỉ của quý khách..." }
  ],
  scenarios: [
    {
      id: "lesson10_base",
      title: "Bài mẫu gốc",
      jpDescription: "基本会話 (Hội thoại cơ bản)",
      viDescription: "Đoạn hội thoại gốc trong sách.",
      audioUrl: "/audio/lesson10_base.mp3",
      personA: "",
      personB: "",
      replacements: {
        store_name: "レストランみやび",
        item: "カーディガン",
        item_description: "色(いろ)はグレーで、胸(むね)の所(ところ)にペンギンのマークが付(つ)いてるん",
        seat_location: "窓側(まどがわ)の奥(おく)の席(せき)",
        place_left: "いす",
        action_left: "かけた",
        reason: "旅行(りょこう)で行っ",
        transportation: "新幹線(しんかんせん)"
      },
      replacementsVi: {
        store_name: "nhà hàng Miyabi",
        item: "áo khoác len cardigan",
        item_description: "màu xám, ở phần ngực có gắn huy hiệu hình chim cánh cụt",
        seat_location: "ghế ở trong góc phía cửa sổ",
        place_left: "trên ghế",
        action_left: "treo",
        reason: "đến du lịch",
        transportation: "tàu shinkansen"
      },
      lineOverrides: {}
    },
    {
      id: "lesson10_bamen6",
      title: "場面6 (第10課)",
      personA: "あなたは喫茶店に財布を忘れました。帰りのバスの中で、そのことに気がつきました。喫茶店に電話をしてください。あなたは右の窓側の席に座りました。財布はテーブルの上に置いたと思いますが、はっきり覚えていません。見つかったら、着払いの宅配便で送ってもらえるようにお願いしてください。",
      personA_vi: "Bạn để quên ví ở quán nước. Bạn nhận ra việc đó khi đang trên xe buýt về. Hãy gọi điện cho quán nước. Bạn đã ngồi ở ghế cạnh cửa sổ bên phải. Bạn nghĩ là đã để trên bàn nhưng không nhớ rõ. Nếu tìm thấy, hãy nhờ họ gửi bằng dịch vụ chuyển phát trả tiền sau.",
      personA_details: [
        { label: "財布の情報", value: "四角い・グレー・花模様がある・名前もつけてあります。" }
      ],
      personB: "あなたは喫茶店の店員です。忘れ物の問い合わせがあります。お客さんに、座った場所、忘れたものの特徴(色や形など)を聞いてください。聞いた場所を見たら、忘れ物がありました。お客さんにどうするか、聞いてください。",
      personB_vi: "Bạn là nhân viên quán nước. Có khách gọi đến hỏi về đồ bỏ quên. Hãy hỏi khách hàng chỗ ngồi, đặc điểm của đồ bỏ quên (màu sắc, hình dáng...). Sau khi kiểm tra vị trí được báo, bạn tìm thấy đồ. Hãy hỏi khách hàng xem nên làm gì tiếp theo.",
      replacements: {
        store_name: "喫茶店(きっさてん)",
        item: "財布(さいふ)",
        item_description: "四角(しかく)くてグレーで、花模様(はなもよう)があって、名前(なまえ)もつけてあるん",
        seat_location: "右(みぎ)の窓側(まどがわ)の席(せき)",
        place_left: "テーブルの上(うえ)",
        action_left: "置(お)いた",
        reason: "用事(ようじ)で行っ",
        transportation: "バス"
      },
      replacementsVi: {
        store_name: "quán nước",
        item: "chiếc ví",
        item_description: "hình vuông, màu xám, có hoa văn và có gắn tên",
        seat_location: "ghế cạnh cửa sổ bên phải",
        place_left: "trên bàn",
        action_left: "đặt",
        reason: "đến vì có việc",
        transportation: "xe buýt"
      },
      lineOverrides: {
        1: { role: 'A', text: "もしもし、今日そちらに行った者なんですが。", textHiragana: "もしもし、今日(きょう)そちらに行(い)った者(もの)なんですが。", translation: "Alo, tôi là người đã đến đó vào hôm nay.", isUser: true }
      }
    }
  ]
};
