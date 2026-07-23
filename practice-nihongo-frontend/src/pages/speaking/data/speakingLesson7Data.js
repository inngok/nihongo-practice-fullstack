export const speakingLesson7Data = {
  lessonId: 7,
  title: "Luyện Hội Thoại - Bài 7",
  baseConversation: [
    { role: 'A', text: "こんにちは。", textHiragana: "こんにちは。", translation: "Chào bạn.", isUser: true },
    { role: 'B', text: "こんにちは。今日は空いてますね。", textHiragana: "こんにちは。今日(きょう)は空(あ)いてますね。", translation: "Chào bạn. Hôm nay rảnh rỗi nhỉ." },
    { role: 'A', text: "あのう、Bさんは[event_name]って興味がありますか。", textHiragana: "あのう、Bさんは[event_name]って興味(きょうみ)がありますか。", translation: "À này, B có hứng thú với [event_name] không?", isUser: true },
    { role: 'B', text: "え？", textHiragana: "え？", translation: "Hả?" },
    { role: 'A', text: "実は今度[location]で[event_name]があるんです。それに参加しようと思ってるんですけど。", textHiragana: "実(じつ)は今度(こんど)[location]で[event_name]があるんです。それに参加(さんか)しようと思(おも)ってるんですけど。", translation: "Thực ra sắp tới có [event_name] ở [location]. Tôi đang định tham gia cái đó.", isUser: true },
    { role: 'B', text: "へえ。", textHiragana: "へえ。", translation: "Ồ." },
    { role: 'A', text: "[time]なんですけど、もしお時間があったらBさんにも来て{{もらえるかなと思って}}……。", textHiragana: "[time]なんですけど、もしお時間(じかん)があったらBさんにも来(き)て{{もらえるかなと思(おも)って}}……。", translation: "Diễn ra vào [time], nếu có thời gian thì tôi nghĩ B cũng đến được nên...", isUser: true },
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
      details: [],
      replacements: {
        event_name: "フリーマーケット",
        location: "さくら公園(こうえん)",
        time: "来週(らいしゅう)の日曜日(にちようび)",
        feature_topic: "中古品(ちゅうこひん)",
        feature_result: "いい物(もの)がある",
        purpose_topic: "300円(えん)のTシャツなら1枚(まい)",
        purpose_result: "30円(えん)の寄付(きふ)ができる"
      },
      replacementsVi: {
        event_name: "chợ đồ cũ",
        location: "công viên Sakura",
        time: "chủ nhật tuần sau",
        feature_topic: "đồ cũ",
        feature_result: "có nhiều đồ tốt",
        purpose_topic: "1 chiếc áo thun 300 yên được bán ra",
        purpose_result: "sẽ trích 30 yên để quyên góp"
      },
      lineOverrides: {
        8: { role: 'A', text: "この[event_name]、100ぐらいのお店が出るんですよ。[feature_topic]{{にしては}}[feature_result]って評判なんです。", textHiragana: "この[event_name]、100ぐらいのお店(みせ)が出(で)るんですよ。[feature_topic]{{にしては}}[feature_result]って評判(ひょうばん)なんです。", translation: "Cái [event_name] này, có khoảng 100 cửa hàng tham gia đấy. Tuy là [feature_topic] nhưng lại nổi tiếng là [feature_result].", isUser: true },
        10: { role: 'A', text: "しかも、売り上げの一部が介助犬の育成のために寄付されるんです。例えば、[purpose_topic]{{につき}}[purpose_result]んです。", textHiragana: "しかも、売(う)り上(あ)げの一部(いちぶ)が介助犬(かいじょけん)の育成(いくせい)のために寄付(きふ)されるんです。例(たと)えば、[purpose_topic]{{につき}}[purpose_result]んです。", translation: "Hơn nữa, một phần doanh thu sẽ được quyên góp để huấn luyện chó hỗ trợ. Ví dụ, cứ mỗi [purpose_topic] thì [purpose_result].", isUser: true }
      }
    },
    {
      id: "lesson7_bamen3_1",
      title: "場面3-① (学園祭)",
      jpDescription: "あなたは友達と学園祭に出店することにしました。同じ英語のクラスに通っているBさんにも来てもらいたいです。Bさんとは時々挨拶するくらいです。クラスで会ったとき、学園祭について説明し、都合を聞いて、誘ってください。",
      viDescription: "Bạn quyết định mở gian hàng ở lễ hội trường cùng bạn bè. Bạn muốn rủ B (học cùng lớp tiếng Anh, thỉnh thoảng có chào hỏi) đến tham gia cùng.",
      details: [
        { label: "日時", value: "来週の土曜日と日曜日 午前10時から" },
        { label: "特徴", value: "自分たちで作った作品や食べ物を売ってもいいです。" },
        { label: "目的", value: "集めたお金は地域の子どもたちのために使われます。" }
      ],
      replacements: {
        event_name: "学園祭(がくえんさい)",
        location: "大学(だいがく)",
        time: "来週(らいしゅう)の土曜日(どようび)と日曜日(にちようび)の午前(ごぜん)10時(じ)",
        feature_topic: "学生(がくせい)のイベント",
        feature_result: "自分(じぶん)たちで作(つく)った作品(さくひん)や食(た)べ物(もの)を売(う)ってもいい",
        purpose_topic: "売(う)り上(あ)げ1000円(えん)",
        purpose_result: "100円(えん)が地域(ちいき)の子(こ)どもたちのために使(つか)われる"
      },
      replacementsVi: {
        event_name: "lễ hội trường",
        location: "trường đại học",
        time: "10 giờ sáng thứ 7 và chủ nhật tuần sau",
        feature_topic: "sự kiện của sinh viên",
        feature_result: "được phép bán các tác phẩm hoặc đồ ăn tự làm",
        purpose_topic: "1000 yên doanh thu",
        purpose_result: "100 yên sẽ được dùng cho trẻ em trong khu vực"
      },
      lineOverrides: {}
    },
    {
      id: "lesson7_bamen3_2",
      title: "場面3-② (フリーマーケット)",
      jpDescription: "あなたは友達とフリーマーケットに出店することにしました。同じ英語のクラスに通っているBさんにも来てもらいたいです。Bさんとは時々挨拶するくらいです。クラスで会ったとき、フリーマーケットについて説明し、都合を聞いて、誘ってください。",
      viDescription: "Bạn quyết định mở gian hàng ở chợ trời cùng bạn bè. Bạn muốn rủ B (người học cùng lớp tiếng Anh, thỉnh thoảng có chào hỏi) cùng tham gia.",
      details: [
        { label: "日時", value: "来週の土曜日と日曜日 午前8時から" },
        { label: "特徴", value: "自分が作った料理を出してもいいです。" },
        { label: "目的", value: "売り上げの2割がホームレスの寄付金になります。" }
      ],
      replacements: {
        event_name: "フリーマーケット",
        location: "さくら公園(こうえん)",
        time: "来週(らいしゅう)の土曜日(どようび)と日曜日(にちようび)の午前(ごぜん)8時(じ)",
        feature_topic: "フリーマーケット",
        feature_result: "自分(じぶん)が作(つく)った料理(りょうり)を出(だ)してもいい",
        purpose_topic: "売(う)り上(あ)げ1000円(えん)",
        purpose_result: "200円(えん)がホームレスの寄付金(きふきん)になる"
      },
      replacementsVi: {
        event_name: "chợ đồ cũ",
        location: "công viên Sakura",
        time: "8 giờ sáng thứ 7 và chủ nhật tuần sau",
        feature_topic: "chợ đồ cũ",
        feature_result: "rất hiếm khi được bán đồ ăn tự nấu",
        purpose_topic: "1000 yên doanh thu",
        purpose_result: "sẽ trích 200 yên quyên góp cho người vô gia cư"
      },
      lineOverrides: {}
    },
    {
      id: "lesson7_bamen3_3",
      title: "場面3-③ (料理教室のイベント)",
      jpDescription: "あなたは友達と料理教室のイベントに出店することにしました。同じ英語のクラスに通っているBさんにも来てもらいたいです。Bさんとは時々挨拶するくらいです。クラスで会ったとき、料理教室のイベントについて説明し、都合を聞いて、誘ってください。",
      viDescription: "Bạn quyết định tham gia sự kiện lớp học nấu ăn cùng bạn bè. Bạn muốn rủ B (học cùng lớp tiếng Anh, thỉnh thoảng có chào hỏi) đến tham gia cùng.",
      details: [
        { label: "日時", value: "来月の第一土曜日 午前9時から" },
        { label: "特徴", value: "日本の伝統料理の作り方が習えます。" },
        { label: "特典", value: "作った料理はみんなで一緒に食べられます。" }
      ],
      replacements: {
        event_name: "料理教室(りょうりきょうしつ)のイベント",
        location: "市民(しみん)センター",
        time: "来月(らいげつ)の第一土曜日(だいいちどようび)の午前(ごぜん)9時(じ)",
        feature_topic: "無料(むりょう)のイベント",
        feature_result: "本格的(ほんかくてき)な日本料理(にほんりょうり)が作(つく)れる",
        purpose_topic: "1グループ",
        purpose_result: "1つのテーブルで、作(つく)った料理(りょうり)をみんなで一緒(いっしょ)に食(た)べられる"
      },
      replacementsVi: {
        event_name: "sự kiện lớp học nấu ăn",
        location: "trung tâm văn hóa",
        time: "9 giờ sáng thứ 7 tuần đầu tiên của tháng sau",
        feature_topic: "sự kiện miễn phí",
        feature_result: "có thể nấu được món Nhật bài bản",
        purpose_topic: "1 nhóm",
        purpose_result: "sẽ được cùng nhau ăn món đã nấu chung 1 bàn"
      },
      lineOverrides: {}
    },
    {
      id: "lesson7_bamen3_4",
      title: "場面3-④ (フードフェスティバル)",
      jpDescription: "あなたは友達とフードフェスティバルに出店することにしました。同じ英語のクラスに通っているBさんにも来てもらいたいです。Bさんとは時々挨拶するくらいです。クラスで会ったとき、フードフェスティバルについて説明し、都合を聞いて、誘ってください。",
      viDescription: "Bạn quyết định mở gian hàng ở lễ hội ẩm thực cùng bạn bè. Bạn muốn rủ B (học cùng lớp tiếng Anh, thỉnh thoảng có chào hỏi) đến tham gia cùng.",
      details: [
        { label: "日時", value: "来週末の土曜日と日曜日 午前11時から" },
        { label: "特徴", value: "世界中の料理が味わえます。" },
        { label: "目的", value: "売り上げの一部が食料支援団体への寄付になります。" }
      ],
      replacements: {
        event_name: "フードフェスティバル",
        location: "中央広場(ちゅうおうひろば)",
        time: "来週末(らいしゅうまつ)の土曜日(どようび)と日曜日(にちようび)の午前(ごぜん)11時(じ)",
        feature_topic: "町(まち)の小(ちい)さなお祭(まつ)り",
        feature_result: "世界(せかい)の料理(りょうり)が食(た)べられる",
        purpose_topic: "売(う)り上(あ)げ1000円(えん)",
        purpose_result: "100円(えん)が食料支援団体(しょくりょうしえんだんたい)への寄付(きふ)になる"
      },
      replacementsVi: {
        event_name: "lễ hội ẩm thực",
        location: "quảng trường trung tâm",
        time: "11 giờ sáng thứ 7 và chủ nhật cuối tuần sau",
        feature_topic: "lễ hội nhỏ của thị trấn",
        feature_result: "có thể thưởng thức món ăn các nước",
        purpose_topic: "1000 yên doanh thu",
        purpose_result: "100 yên sẽ được quyên góp cho tổ chức hỗ trợ lương thực"
      },
      lineOverrides: {}
    },
    {
      id: "lesson7_bamen4_1",
      title: "場面4-① (海岸のゴミ拾い)",
      jpDescription: "あなたは海岸のゴミ拾いというボランティア活動に参加することにしました。同じ英語の中級クラスに通っているBさんにも来てもらいたいです。Bさんとは時々挨拶するくらいです。クラスで会ったとき、活動について説明し、都合を聞いて、誘ってください。",
      viDescription: "Bạn quyết định tham gia hoạt động tình nguyện nhặt rác trên bãi biển. Bạn muốn rủ B (học cùng lớp tiếng Anh trung cấp, thỉnh thoảng có chào hỏi) đến tham gia cùng.",
      details: [
        { label: "日時", value: "毎月第2日曜日 午前7時から9時まで" },
        { label: "特徴", value: "近くの海岸でゴミを拾って、きれいにします。" },
        { label: "特典", value: "参加した人は環境保護の証明書がもらえます。" }
      ],
      replacements: {
        event_name: "ボランティア活動(かつどう)",
        location: "近(ちか)くの海岸(かいがん)",
        time: "毎月(まいげつ)第(だい)2日曜日(にちようび)の午前(ごぜん)7時(じ)から9時(じ)",
        feature_topic: "ボランティア",
        feature_result: "海(うみ)がきれいになって気持(きも)ちいい",
        purpose_topic: "参加者(さんかしゃ)1人(ひとり)",
        purpose_result: "環境保護(かんきょうほご)の証明書(しょうめいしょ)がもらえる"
      },
      replacementsVi: {
        event_name: "hoạt động tình nguyện",
        location: "bãi biển gần đây",
        time: "7 giờ đến 9 giờ sáng chủ nhật tuần thứ 2 mỗi tháng",
        feature_topic: "hoạt động tình nguyện",
        feature_result: "biển trở nên sạch đẹp và cảm thấy rất dễ chịu",
        purpose_topic: "1 người tham gia",
        purpose_result: "sẽ nhận được giấy chứng nhận bảo vệ môi trường"
      },
      lineOverrides: {}
    },
    {
      id: "lesson7_bamen4_2",
      title: "場面4-② (孤児院での英語教え)",
      jpDescription: "あなたはボランティア活動に参加することにしました。同じ英語の中級クラスに通っているBさんにも来てもらいたいです。Bさんとは時々挨拶するくらいです。クラスで会ったとき、ボランティア活動について説明し、都合を聞いて、誘ってください。",
      viDescription: "Bạn quyết định tham gia hoạt động tình nguyện. Bạn muốn rủ B (người học cùng lớp tiếng Anh trung cấp, thỉnh thoảng có chào hỏi) cùng tham gia.",
      details: [
        { label: "日時", value: "毎週の土曜日 午前8時から10時まで" },
        { label: "特徴", value: "地方の孤児院で子どもたちに初級レベルの英語を教える。" },
        { label: "特典", value: "活動に参加する人は後である英語の中級コースに無料で参加できる。" }
      ],
      replacements: {
        event_name: "ボランティア活動(かつどう)",
        location: "地方(ちほう)の孤児院(こじいん)",
        time: "毎週(まいしゅう)の土曜日(どようび)の午前(ごぜん)8時(じ)から10時(じ)",
        feature_topic: "ボランティア",
        feature_result: "自分(じぶん)の英語(えいご)の勉強(べんきょう)にもなる",
        purpose_topic: "参加者(さんかしゃ)1人(ひとり)",
        purpose_result: "英語(えいご)の中級(ちゅうきゅう)コースに無料(むりょう)で参加(さんか)できる"
      },
      replacementsVi: {
        event_name: "hoạt động tình nguyện",
        location: "trại trẻ mồ côi ở địa phương",
        time: "8 giờ đến 10 giờ sáng thứ bảy hàng tuần",
        feature_topic: "hoạt động tình nguyện",
        feature_result: "cũng giúp ích cho việc học tiếng Anh của bản thân",
        purpose_topic: "1 người tham gia",
        purpose_result: "sẽ được tham gia khóa học tiếng Anh trung cấp miễn phí"
      },
      lineOverrides: {
        11: { role: 'B', text: "ああ、いいね。あ、でも、私英語にあまり自信がないんだけど、大丈夫？", textHiragana: "ああ、いいね。あ、でも、私(わたし)英語(えいご)にあまり自信(じしん)がないんだけど、大丈夫(だいじょうぶ)？", translation: "À, hay đấy. Nhưng mà, tôi không tự tin vào tiếng Anh của mình lắm, có ổn không?" },
        12: { role: 'A', text: "あ、初級レベルを教えるから、心配しなくても大丈夫ですよ。", textHiragana: "あ、初級(しょきゅう)レベルを教(おし)えるから、心配(しんぱい)しなくても大丈夫(だいじょうぶ)ですよ。", translation: "À, vì chỉ dạy cấp độ sơ cấp thôi nên không cần lo đâu, ổn mà.", isUser: true }
      }
    },
    {
      id: "lesson7_bamen4_3",
      title: "場面4-③ (植林活動)",
      jpDescription: "あなたは植林（木を植える）活動というボランティア活動に参加することにしました。同じ英語の中級クラスに通っているBさんにも来てもらいたいです。Bさんとは時々挨拶するくらいです。クラスで会ったとき、活動について説明し、都合を聞いて、誘ってください。",
      viDescription: "Bạn quyết định tham gia hoạt động tình nguyện trồng rừng (trồng cây). Bạn muốn rủ B (học cùng lớp tiếng Anh trung cấp, thỉnh thoảng có chào hỏi) đến tham gia cùng.",
      details: [
        { label: "日時", value: "来月の土曜日 午前8時から12時まで" },
        { label: "特徴", value: "山で木を植えて、自然を守ります。" },
        { label: "特典", value: "参加した人は昼ご飯が無料でもらえます。" }
      ],
      replacements: {
        event_name: "ボランティア活動(かつどう)",
        location: "山(やま)",
        time: "来月(らいげつ)の土曜日(どようび)の午前(ごぜん)8時(じ)から12時(じ)",
        feature_topic: "ボランティア",
        feature_result: "楽(たの)しく自然(しぜん)が守(まも)れる",
        purpose_topic: "参加者(さんかしゃ)1人(ひとり)",
        purpose_result: "昼(ひる)ご飯(はん)が無料(むりょう)でもらえる"
      },
      replacementsVi: {
        event_name: "hoạt động tình nguyện",
        location: "trên núi",
        time: "8 giờ đến 12 giờ trưa thứ 7 tháng sau",
        feature_topic: "hoạt động tình nguyện",
        feature_result: "có thể bảo vệ thiên nhiên một cách vui vẻ",
        purpose_topic: "1 người tham gia",
        purpose_result: "sẽ được nhận bữa trưa miễn phí"
      },
      lineOverrides: {}
    },
    {
      id: "lesson7_bamen4_4",
      title: "場面4-④ (こども食堂の手伝い)",
      jpDescription: "あなたはこども食堂の手伝いというボランティア活動に参加することにしました。同じ英語の中級クラスに通っているBさんにも来てもらいたいです。Bさんとは時々挨拶するくらいです。クラスで会ったとき、活動について説明し、都合を聞いて、誘ってください。",
      viDescription: "Bạn quyết định tham gia hoạt động tình nguyện phụ giúp quán ăn trẻ em. Bạn muốn rủ B (học cùng lớp tiếng Anh trung cấp, thỉnh thoảng có chào hỏi) đến tham gia cùng.",
      details: [
        { label: "日時", value: "毎週土曜日 午前10時から午後1時まで" },
        { label: "特徴", value: "子どもたちに料理を作って出します。" },
        { label: "特典", value: "参加した人は無料で料理教室に参加できます。" }
      ],
      replacements: {
        event_name: "ボランティア活動(かつどう)",
        location: "こども食堂(しょくどう)",
        time: "毎週土曜日(まいしゅうどようび)の午前(ごぜん)10時(じ)から午後(ごご)1時(じ)",
        feature_topic: "ボランティア",
        feature_result: "子(こ)どもたちの笑顔(えがお)が見(み)られて楽(たの)しい",
        purpose_topic: "参加者(さんかしゃ)1人(ひとり)",
        purpose_result: "無料(むりょう)で料理教室(りょうりきょうしつ)に参加(さんか)できる"
      },
      replacementsVi: {
        event_name: "hoạt động tình nguyện",
        location: "quán ăn trẻ em",
        time: "10 giờ sáng đến 1 giờ chiều thứ 7 hàng tuần",
        feature_topic: "hoạt động tình nguyện",
        feature_result: "rất vui vì được nhìn thấy nụ cười của trẻ em",
        purpose_topic: "1 người tham gia",
        purpose_result: "sẽ được tham gia lớp học nấu ăn miễn phí"
      },
      lineOverrides: {
        11: { role: 'B', text: "ああ、いいね。あ、でも、私料理にあまり自信がないんだけど、大丈夫？", textHiragana: "ああ、いいね。あ、でも、私(わたし)料理(りょうり)にあまり自信(じしん)がないんだけど、大丈夫(だいじょうぶ)？", translation: "À, hay đấy. Nhưng mà, tôi không tự tin vào khả năng nấu nướng của mình lắm, có ổn không?" },
        12: { role: 'A', text: "あ、簡単な手伝いから始めるから、心配しなくても大丈夫ですよ。", textHiragana: "あ、簡単(かんたん)な手伝(てつだ)いから始(はじ)めるから、心配(しんぱい)しなくても大丈夫(だいじょうぶ)ですよ。", translation: "À, vì sẽ bắt đầu từ những việc phụ giúp đơn giản thôi nên không cần lo đâu, ổn mà.", isUser: true }
      }
    }
  ]
};
