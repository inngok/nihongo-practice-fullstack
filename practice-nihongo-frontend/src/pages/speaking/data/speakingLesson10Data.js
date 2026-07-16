export const speakingLesson10Data = {
  lessonId: 10,
  title: "Luyện Hội Thoại - Bài 10",
  baseConversation: [
    { role: 'B', text: "はい、[store_name]です。" },
    { role: 'A', text: "もしもし、今日のお昼にそちらで食事をした者なんですが。", isUser: true },
    { role: 'B', text: "はい。" },
    { role: 'A', text: "そちらに[item]を忘れ{{てしまったようなんです}}。かばんに入れた{{つもりだったんですが}}、なかった{{もので}}……。", isUser: true },
    { role: 'B', text: "そうですか。どんな[item]ですか。" },
    { role: 'A', text: "[item_description]です。", isUser: true },
    { role: 'B', text: "どの辺りに座っていらっしゃいましたか。" },
    { role: 'A', text: "[seat_location]です。[place_left]に[action_left]{{ように思うんですが}}、もしかしたら、下に落ちているかもしれません。", isUser: true },
    { role: 'B', text: "わかりました。少々お待ちください。……お待たせいたしました。こちらにございます。" },
    { role: 'A', text: "ああ、よかったです。", isUser: true },
    { role: 'B', text: "どうしましょうか。" },
    { role: 'A', text: "あ、実はそちらには[reason]て、今は帰りの[transportation]の中なんです。", isUser: true },
    { role: 'B', text: "あー、そうなんですか。" },
    { role: 'A', text: "すみませんが、着払いの宅配便で送って{{もらってもいいですか}}。", isUser: true },
    { role: 'B', text: "はい、わかりました。では、お名前とご住所を……" }
  ],
  scenarios: [
    {
      id: "lesson10_base",
      title: "Bài mẫu gốc",
      jpDescription: "基本会話 (Hội thoại cơ bản)",
      viDescription: "Đoạn hội thoại gốc trong sách.",
      details: [],
      replacements: {
        store_name: "レストランみやび",
        item: "カーディガン",
        item_description: "色はグレーで、胸の所にペンギンのマークが付いてるん",
        seat_location: "窓側の奥の席",
        place_left: "いす",
        action_left: "かけた",
        reason: "旅行で行っ",
        transportation: "新幹線"
      },
      lineOverrides: {}
    },
    {
      id: "lesson10_bamen6",
      title: "場面６ (忘れ物)",
      jpDescription: "あなたは喫茶店に財布を忘れました。帰りのバスの中で、そのことに気がつきました。喫茶店に電話をしてください。あなたは右の窓側の席に座りました。財布はテーブルの上に置いたと思いますが、はっきり覚えていません。見つかったら、着払いの宅配便で送ってもらえるようにお願いしてください。",
      viDescription: "Bạn để quên ví ở quán nước. Bạn nhận ra việc đó khi đang trên xe buýt về. Hãy gọi điện cho quán nước. Bạn đã ngồi ở ghế cạnh cửa sổ bên phải. Bạn nghĩ là đã để trên bàn nhưng không nhớ rõ. Nếu tìm thấy, hãy nhờ họ gửi bằng dịch vụ chuyển phát trả tiền sau.",
      details: [
        { label: "忘れ物", value: "財布 (四角い・グレー・花模様がある・名前もつけてある)" },
        { label: "場所", value: "右の窓側の席 / テーブルの上" },
        { label: "状況", value: "帰りのバスの中" }
      ],
      replacements: {
        store_name: "喫茶店",
        item: "財布",
        item_description: "四角くてグレーで、花模様があって、名前もつけてあるん",
        seat_location: "右の窓側の席",
        place_left: "テーブルの上",
        action_left: "置いた",
        reason: "出かけ",
        transportation: "バス"
      },
      lineOverrides: {
        1: { role: 'A', text: "もしもし、今日そちらに行った者なんですが。", isUser: true }
      }
    }
  ]
};
