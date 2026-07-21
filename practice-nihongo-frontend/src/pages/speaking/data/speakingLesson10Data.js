export const speakingLesson10Data = {
  lessonId: 10,
  title: "Luyện Hội Thoại - Bài 10",
  baseConversation: [
    { role: 'B', text: "はい、[store_name]です。", textHiragana: "はい、[store_name]です。", translation: "Vâng, [store_name] xin nghe." },
    { role: 'A', text: "もしもし、今日のお昼にそちらで食事をした者なんですが。", textHiragana: "もしもし、今日(きょう)のお昼(ひる)にそちらで食事(しょくじ)をした者(もの)なんですが。", translation: "Alo, tôi là người đã dùng bữa ở đó vào trưa nay.", isUser: true },
    { role: 'B', text: "はい。", textHiragana: "はい。", translation: "Vâng." },
    { role: 'A', text: "そちらに[item]を忘れ{{てしまったようなんです}}。かばんに入れた{{つもりだったんですが}}、なかった{{もので}}……。", textHiragana: "そちらに[item]を忘(わす)れ{{てしまったようなんです}}。かばんにいれた{{つもりだったんですが}}、なかった{{もので}}……。", translation: "Hình như tôi đã để quên [item] ở đó. Tôi cứ nghĩ là đã cho vào cặp rồi, nhưng mà không thấy nên...", isUser: true },
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
      details: [],
      replacements: {
        store_name: "レストランみやび",
        item: "カーディガン",
        item_description: "色(いろ)はグレーで、胸(むね)の所(ところ)にペンギンのマークが付(つ)いてるん",
        seat_location: "窓側(まどがわ)の奥(おく)の席(せき)",
        place_left: "いす",
        action_left: "かけた",
        reason: "旅行(りょこう)で行(い)っ",
        transportation: "新幹線(しんかんせん)"
      },
      replacementsVi: {
        store_name: "nhà hàng Miyabi",
        item: "áo khoác len cardigan",
        item_description: "màu xám và có logo chim cánh cụt ở trước ngực",
        seat_location: "ghế trong cùng cạnh cửa sổ",
        place_left: "ghế",
        action_left: "vắt trên",
        reason: "đi du lịch",
        transportation: "tàu Shinkansen"
      },
      lineOverrides: {}
    },
    {
      id: "lesson10_bamen6_1",
      title: "場面6-① (レストランで傘の忘れ物)",
      jpDescription: "あなたはレストランに傘を忘れました。帰りのバスの中で、そのことに気がつきました。レストランに電話をしてください。あなたは入り口の傘立てに置きました。見つかったら、着払いの宅配便で送ってもらえるようにお願いしてください。",
      viDescription: "Bạn để quên ô ở nhà hàng. Bạn nhận ra điều đó trên chuyến xe buýt lúc về. Hãy gọi điện cho nhà hàng. Bạn đã để ô ở chỗ để ô trước cửa ra vào. Nếu tìm thấy, hãy nhờ họ gửi bằng dịch vụ chuyển phát trả tiền sau.",
      details: [
        { label: "忘れ物", value: "傘 (長い・青い・水玉模様がある・持ち手が茶色)" },
        { label: "場所", value: "入り口の傘立て" },
        { label: "状況", value: "帰りのバスの中" }
      ],
      replacements: {
        store_name: "レストラン",
        item: "傘(かさ)",
        item_description: "長(なが)くて青(あお)くて、水玉模様(みずたまもよう)があって、持(も)ち手(て)が茶色(ちゃいろ)いん",
        seat_location: "入(い)り口(ぐち)の傘立(かさた)て",
        place_left: "そこ",
        action_left: "置(お)いた",
        reason: "食事(しょくじ)に行(い)っ",
        transportation: "バス"
      },
      replacementsVi: {
        store_name: "nhà hàng",
        item: "chiếc ô",
        item_description: "dài, màu xanh, có họa tiết chấm bi và tay cầm màu nâu",
        seat_location: "chỗ để ô ở cửa ra vào",
        place_left: "đó",
        action_left: "đặt ở",
        reason: "đến dùng bữa",
        transportation: "xe buýt"
      },
      lineOverrides: {
        6: { role: 'B', text: "店内のどの辺りに置かれましたか。", textHiragana: "店内(てんない)のどの辺(あた)りに置(お)かれましたか。", translation: "Quý khách đã để ở khu vực nào trong quán ạ?" },
        7: { role: 'A', text: "入り口の傘立てに置いた{{ように思うんですが}}、もしかしたら、倒れて下に落ちているかもしれません。", textHiragana: "入(い)り口(ぐち)の傘立(かさた)てに置(お)いた{{ように思(おも)うんですが}}、もしかしたら、倒(たお)れて下(した)に落(お)ちているかもしれません。", translation: "Tôi nghĩ là đã để ở chỗ để ô ở cửa ra vào, nhưng biết đâu nó bị đổ và rơi xuống dưới.", isUser: true }
      }
    },
    {
      id: "lesson10_bamen6_2",
      title: "場面6-② (カラオケ店でスマホの忘れ物)",
      jpDescription: "あなたはカラオケ店にスマホを忘れました。帰りのバスの中で、そのことに気がつきました。カラオケ店に電話をしてください。あなたは3番の部屋のソファの上に置きました。見つかったら、着払いの宅配便で送ってもらえるようにお願いしてください。",
      viDescription: "Bạn để quên điện thoại ở quán karaoke. Bạn nhận ra điều đó trên chuyến xe buýt lúc về. Hãy gọi điện cho quán karaoke. Bạn đã để điện thoại trên ghế sofa ở phòng số 3. Nếu tìm thấy, hãy nhờ họ gửi bằng dịch vụ chuyển phát trả tiền sau.",
      details: [
        { label: "忘れ物", value: "スマホ (四角い・白い・青いケース・キャラクターのシールがついている)" },
        { label: "場所", value: "3番の部屋のソファの上" },
        { label: "状況", value: "帰りのバスの中" }
      ],
      replacements: {
        store_name: "カラオケ店(てん)",
        item: "スマホ",
        item_description: "四角(しかく)くて白(しろ)くて、青(あお)いケースで、キャラクターのシールがついてるん",
        seat_location: "3番(ばん)の部屋(へや)",
        place_left: "ソファの上(うえ)",
        action_left: "置(お)いた",
        reason: "遊(あそ)びに行(い)っ",
        transportation: "バス"
      },
      replacementsVi: {
        store_name: "quán karaoke",
        item: "điện thoại",
        item_description: "hình vuông, màu trắng, ốp lưng xanh và có dán hình nhân vật",
        seat_location: "phòng số 3",
        place_left: "trên ghế sofa",
        action_left: "đặt ở",
        reason: "đến chơi",
        transportation: "xe buýt"
      },
      lineOverrides: {
        1: { role: 'A', text: "もしもし、今日そちらを利用した者なんですが。", textHiragana: "もしもし、今日(きょう)そちらを利用(りよう)した者(もの)なんですが。", translation: "Alo, tôi là người đã sử dụng dịch vụ ở đó vào hôm nay.", isUser: true },
        6: { role: 'B', text: "何番のお部屋をご利用でしたか。", textHiragana: "何番(なんばん)のお部屋(へや)をご利用(りよう)でしたか。", translation: "Quý khách đã sử dụng phòng số mấy ạ?" }
      }
    },
    {
      id: "lesson10_bamen6_3",
      title: "場面6-③ (ホテルで眼鏡の忘れ物)",
      jpDescription: "あなたはホテルに眼鏡を忘れました。帰りのバスの中で、そのことに気がつきました。ホテルに電話をしてください。あなたはベッドの横のテーブルの上に置きました。見つかったら、着払いの宅配便で送ってもらえるようにお願いしてください。",
      viDescription: "Bạn để quên kính ở khách sạn. Bạn nhận ra điều đó trên chuyến xe buýt lúc về. Hãy gọi điện cho khách sạn. Bạn đã để kính trên bàn cạnh giường. Nếu tìm thấy, hãy nhờ họ gửi bằng dịch vụ chuyển phát trả tiền sau.",
      details: [
        { label: "忘れ物", value: "眼鏡 (丸い形・茶色いフレーム・黒いケースに入っている)" },
        { label: "場所", value: "ベッドの横のテーブルの上" },
        { label: "状況", value: "帰りのバスの中" }
      ],
      replacements: {
        store_name: "ホテル",
        item: "眼鏡(めがね)",
        item_description: "丸(まる)い形(かたち)で茶色(ちゃいろ)いフレームで、黒(くろ)いケースに入(はい)ってるん",
        seat_location: "502号室(ごうしつ)",
        place_left: "ベッドの横(よこ)のテーブルの上(うえ)",
        action_left: "置(お)いた",
        reason: "泊(と)まりに行(い)っ",
        transportation: "バス"
      },
      replacementsVi: {
        store_name: "khách sạn",
        item: "mắt kính",
        item_description: "hình tròn, gọng màu nâu và được đựng trong hộp màu đen",
        seat_location: "phòng 502",
        place_left: "trên bàn cạnh giường",
        action_left: "đặt ở",
        reason: "đến trọ",
        transportation: "xe buýt"
      },
      lineOverrides: {
        1: { role: 'A', text: "もしもし、今日そちらに泊まった者なんですが。", textHiragana: "もしもし、今日(きょう)そちらに泊(と)まった者(もの)なんですが。", translation: "Alo, tôi là người đã ở trọ tại đó vào hôm nay.", isUser: true },
        6: { role: 'B', text: "何号室にお泊まりでしたか。", textHiragana: "何号室(なんごうしつ)にお泊(と)まりでしたか。", translation: "Quý khách đã ở phòng số mấy ạ?" }
      }
    },
    {
      id: "lesson10_bamen6_4",
      title: "場面6-④ (喫茶店で財布の忘れ物)",
      jpDescription: "あなたは喫茶店に財布を忘れました。帰りのバスの中で、そのことに気がつきました。喫茶店に電話をしてください。あなたは右の窓側の席に座りました。財布はテーブルの上に置いたと思いますが、はっきり覚えていません。見つかったら、着払いの宅配便で送ってもらえるようにお願いしてください。",
      viDescription: "Bạn để quên ví ở quán nước. Bạn nhận ra việc đó khi đang trên xe buýt về. Hãy gọi điện cho quán nước. Bạn đã ngồi ở ghế cạnh cửa sổ bên phải. Bạn nghĩ là đã để trên bàn nhưng không nhớ rõ. Nếu tìm thấy, hãy nhờ họ gửi bằng dịch vụ chuyển phát trả tiền sau.",
      details: [
        { label: "忘れ物", value: "財布 (四角い・グレー・花模様がある・名前もつけてある)" },
        { label: "場所", value: "右の窓側の席 / テーブルの上" },
        { label: "状況", value: "帰りのバスの中" }
      ],
      replacements: {
        store_name: "喫茶店(きっさてん)",
        item: "財布(さいふ)",
        item_description: "四角(しかく)くてグレーで、花模様(はなもよう)があって、名前(なまえ)もつけてあるん",
        seat_location: "右(みぎ)の窓側(まどがわ)の席(せき)",
        place_left: "テーブルの上(うえ)",
        action_left: "置(お)いた",
        reason: "お茶(ちゃ)をしに行(い)っ",
        transportation: "バス"
      },
      replacementsVi: {
        store_name: "quán nước",
        item: "chiếc ví",
        item_description: "hình vuông, màu xám, có hoa văn và có gắn tên",
        seat_location: "ghế cạnh cửa sổ bên phải",
        place_left: "trên bàn",
        action_left: "đặt ở",
        reason: "đến uống trà",
        transportation: "xe buýt"
      },
      lineOverrides: {
        1: { role: 'A', text: "もしもし、今日そちらに行った者なんですが。", textHiragana: "もしもし、今日(きょう)そちらに行(い)った者(もの)なんですが。", translation: "Alo, tôi là người đã đến đó vào hôm nay.", isUser: true }
      }
    }
  ]
};
