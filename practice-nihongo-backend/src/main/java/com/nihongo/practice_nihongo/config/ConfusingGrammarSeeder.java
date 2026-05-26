package com.nihongo.practice_nihongo.config;

import com.nihongo.practice_nihongo.model.ConfusingGrammarGroup;
import com.nihongo.practice_nihongo.model.ConfusingGrammarPoint;
import com.nihongo.practice_nihongo.repository.ConfusingGrammarGroupRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ConfusingGrammarSeeder implements CommandLineRunner {

    private final ConfusingGrammarGroupRepository repository;

    public ConfusingGrammarSeeder(ConfusingGrammarGroupRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Clear and reseed on startup to ensure updates to textbooks apply instantly
        repository.deleteAll();
        seedGroups();
    }

    private void seedGroups() {
        // Group 1: Cho phép - Bắt buộc - Lời khuyên
        ConfusingGrammarGroup g1 = new ConfusingGrammarGroup(
                "Cho phép - Bắt buộc - Lời khuyên",
                "Tổng hợp các cấu trúc cơ bản biểu đạt sự cho phép, ngăn cấm, bắt buộc hoặc đưa ra lời khuyên trong tiếng Nhật."
        );
        g1.setExplanation(
                "Các mẫu cấu trúc này tập trung vào tính chất tác động của hành động đối với người nghe:\n" +
                "1. **〜てもいい**: Cấp phép nhẹ nhàng, cho phép làm hoặc hỏi ý kiến đối phương có thể làm gì đó không.\n" +
                "2. **〜てはいけない**: Lệnh cấm tuyệt đối, dựa trên quy tắc xã hội, đạo đức hoặc luật pháp.\n" +
                "3. **〜なければならない**: Sự bắt buộc bắt nguồn từ nghĩa vụ bản thân hoặc ngoại cảnh. Không có chỗ cho sự lựa chọn.\n" +
                "4. **〜なくてもいい**: Giải tỏa áp lực nghĩa vụ, người nghe có quyền tự do thực hiện hoặc không thực hiện.\n" +
                "5. **〜たほうがいい / 〜ないほうがいい**: Đưa ra lời khuyên mạnh mẽ hoặc cảnh báo từ kinh nghiệm của bản thân. Nên dùng cẩn thận vì có thể mang tính chất áp đặt ý kiến."
        );
        g1.setTip("Sử dụng '〜たほうがいい' khi khuyên bảo người có vai vế thấp hơn hoặc trong tình huống khẩn cấp. Tránh dùng với cấp trên vì mang sắc thái dạy đời.");

        g1.addItem(new ConfusingGrammarPoint("〜てもいい", "...cũng được", "ĐƯỢC PHÉP", 40,
                "ここで写真を撮ってもいいですか。", "Koko de shashin wo tottemo ii desu ka?", "Tôi chụp ảnh ở đây có được không?"));
        
        g1.addItem(new ConfusingGrammarPoint("〜てはいけない", "...thì không được", "CẤM", 100,
                "芝生に入ってはいけません。", "Shibafu ni haitte wa ikemasen.", "Không được đi vào thảm cỏ."));
        
        g1.addItem(new ConfusingGrammarPoint("〜なければならない", "nếu không... thì không được", "PHẢI", 100,
                "毎日宿題uをしなければなりません。", "Mainichi shukudai wo shinakereba narimasen.", "Hàng ngày đều phải làm bài tập về nhà."));
        
        g1.addItem(new ConfusingGrammarPoint("〜なくてもいい", "dù không... cũng được", "KHÔNG CẦN THIẾT", 20,
                "日曜日は早く起きなくてもいいです。", "Nichiyoubi wa hayaku okinakute mo ii desu.", "Chủ nhật không cần dậy sớm cũng được."));
        
        g1.addItem(new ConfusingGrammarPoint("〜たほうがいい", "phía đã... thì tốt", "NÊN", 80,
                "病院へ行ったほうがいいですよ。", "Byouin he itta hou ga ii desu yo.", "Cậu nên đi đến bệnh viện đi nhé."));
        
        g1.addItem(new ConfusingGrammarPoint("〜ないほうがいい", "phía không... thì tốt", "KHÔNG NÊN", 80,
                "タバコは吸わないほうがいいです。", "Tabako wa suwanai hou ga ii desu.", "Không nên hút thuốc lá."));
        
        repository.save(g1);

        // Group 2: Phân biệt Tôn kính ngữ - Khiêm nhường ngữ
        ConfusingGrammarGroup g2 = new ConfusingGrammarGroup(
                "Kính Ngữ Master (Tôn kính & Khiêm nhường)",
                "Làm chủ hệ thống Kính ngữ chuyên sâu: Tôn kính ngữ, Khiêm nhường ngữ và Lịch sự ngữ."
        );
        g2.setExplanation(
                "✦ QUY TẮC CỐT LÕI (CHỦ THỂ HÀNH ĐỘNG):\n" +
                "- Tôn kính ngữ (Sonkeigo): Dùng khi chủ ngữ là đối phương, cấp trên, khách hàng (người khác làm).\n" +
                "- Khiêm nhường ngữ (Kenjougo): Dùng khi chủ ngữ là bản thân, đồng nghiệp, người thuộc phe mình (mình làm).\n\n" +
                "1. CHO & NHẬN HÀNH ĐỘNG (Vて + JUJU DOUSHI)\n" +
                "■ Mình làm cho người khác (Giving):\n" +
                "- 〜てあげる / 〜てやる: Làm cho bạn bè, người dưới, động vật (tránh dùng trực tiếp với cấp trên).\n" +
                "- 〜てさしあげる / 〜てさしあげましょうか: Cách nói lịch sự, khéo léo khi muốn giúp người lớn tuổi.\n" +
                "■ Người khác làm cho mình (Receiving - Góc nhìn của mình):\n" +
                "- 〜てもらう: Chủ ngữ là MÌNH. Bạn nhận được lòng tốt từ người khác.\n" +
                "- 〜ていただく: Cấp trên, người lớn tuổi làm giúp mình (Biết ơn sâu sắc).\n" +
                "■ Người khác làm cho mình (Giving - Góc nhìn của người làm):\n" +
                "- 〜てくれる: Bạn bè, người dưới làm giúp mình.\n" +
                "- 〜てくださる: Cấp trên, người lớn tuổi làm giúp mình.\n\n" +
                "2. NHỜ VẢ (REQUESTS - NHỜ AI ĐÓ LÀM GIÚP)\n" +
                "■ Thân mật: Vて / Vてくれない? / Vてもらえる?\n" +
                "■ Lịch sự vừa: Vてください / Vてくれませんか / Vてもらえませんか\n" +
                "■ Rất lịch sự (Đỉnh cao tôn kính): Vてくださいませんか / Vていただけませんか / Vていただけないでしょうか\n\n" +
                "3. XIN PHÉP (ASKING FOR PERMISSION - XIN ĐƯỢC LÀM)\n" +
                "■ Công thức: Thể Sai Khiến (Causative) + Động từ Nhận (Morau / Itadaku)\n" +
                "- Vさせて＋もらう / いただく (Xin hãy cho phép tôi được làm...)\n" +
                "⚠️ LƯU Ý CỰC KỲ DỄ NHẦM:\n" +
                "- Nhờ vả (Vてください): Nhờ NGƯỜI KHÁC LÀM.\n" +
                "- Xin phép (Vさせてください / Vさせていただきます): MÌNH LÀ NGƯỜI LÀM.\n\n" +
                "4. TÔN KÍNH NGỮ (SONKEIGO - 尊敬語)\n" +
                "■ Nâng tầm hành động, trạng thái của ĐỐI PHƯƠNG (Chủ ngữ là đối phương làm):\n" +
                "- お + V(bỏ masu) + になる (Ví dụ: 社長はお帰りになりました - Giám đốc đã đi về rồi ạ).\n" +
                "- お / ご + V(bỏ masu) + ください (Xin ngài vui lòng...)\n" +
                "- Chia về thể Bị Động (Vれる / Vられる) (Hình thức tôn kính nhẹ nhàng).\n\n" +
                "5. KHIÊM NHƯỜNG NGỮ (KENJOUGO - 謙譲語)\n" +
                "■ Hạ thấp hành động của BẢN THÂN để tôn trọng người nghe (Chủ ngữ là bản thân làm):\n" +
                "- お + V(bỏ masu) + する / 申し上げる (Ví dụ: お手伝いします - Tôi xin phép được giúp đỡ).\n" +
                "- Động từ đặc biệt: 行く/来る -> 参る (mairu), 言u -> 申す (mousu), 食べる/飲む -> いただく (itadaku)."
        );
        g2.setTip("Cực kỳ dễ nhầm với việc nhờ người khác làm. Hãy nhớ quy tắc vàng: Thấy 'V(sa)せて' -> MÌNH LÀ NGƯỜI LÀM. Tuyệt đối không dùng Tôn kính ngữ cho hành động của chính mình.");

        g2.addItem(new ConfusingGrammarPoint("〜てさしあげる", "Làm cho người khác (Lịch sự)", "CHO & NHẬN", 75,
                "先生, 荷物をお持ちしましょうか（お持ちしてさしあげましょうか）。", "Sensei, nimotsu wo omochi shimashou ka?", "Thầy ơi, em xin phép mang hành lý giúp thầy ạ."));
        
        g2.addItem(new ConfusingGrammarPoint("〜ていただく", "Được người trên làm cho (Khiêm nhường)", "CHO & NHẬN", 95,
                "田中部長に日本語を教えていただきました。", "Tanaka buchou ni Nihongo wo oshiete itadakimashita.", "Tôi đã được Trưởng phòng Tanaka dạy tiếng Nhật cho ạ."));
        
        g2.addItem(new ConfusingGrammarPoint("〜てくださる", "Người trên làm cho mình (Tôn kính)", "CHO & NHẬN", 95,
                "社長が新しいパソコンを買ってくださいました。", "Shachou ga atarashii pasokon wo katte kudasaimashita.", "Giám đốc đã mua máy tính mới cho tôi ạ."));
        
        g2.addItem(new ConfusingGrammarPoint("お + V(bỏ masu) + になる", "Hành động của người trên (Sonkeigo)", "TÔN KÍNH NGỮ", 90,
                "先生はもうお帰りになりました。", "Sensei wa mou okaeri ni narimashita.", "Thầy giáo đã về rồi ạ."));
        
        g2.addItem(new ConfusingGrammarPoint("お + V(bỏ masu) + する", "Hành động của bản thân (Kenjougo)", "KHIÊM NHƯỜNG NGỮ", 90,
                "私がご案内いたします（ご案内します）。", "Watashi ga goannai itashimasu.", "Em xin phép được dẫn đường cho ngài ạ."));
        
        repository.save(g2);

        // Group 3: Cấu trúc chỉ Biến đổi trạng thái
        ConfusingGrammarGroup g3 = new ConfusingGrammarGroup(
                "Diễn đạt Biến đổi trạng thái",
                "Phân biệt các cấu trúc diễn tả một trạng thái, hành động hoặc quyết định được thay đổi khách quan hay chủ quan."
        );
        g3.setExplanation(
                "Sự khác nhau cơ bản nằm ở ý chí và nguồn lực đưa ra quyết định/sự biến đổi:\n" +
                "1. **〜ようになる**: Diễn tả một sự biến đổi năng lực hoặc thói quen xảy ra một cách tự nhiên theo thời gian, thường không mang ý chí tức thời.\n" +
                "2. **〜ことにする**: Biểu thị quyết định mang tính chủ quan của bản thân chủ thể hành động.\n" +
                "3. **〜ことになる**: Biểu thị một quyết định mang tính khách quan do hoàn cảnh, tổ chức hoặc người khác tác động vào chủ thể."
        );
        g3.setTip("Dùng 'ことにしている' để chỉ thói quen tự mình đặt ra và thực hiện đều đặn. Dùng 'ことになっている' để chỉ quy định, lịch trình của tập thể.");

        g3.addItem(new ConfusingGrammarPoint("〜ようになる", "Trở nên (thay đổi năng lực/thói quen)", "BIẾN ĐỔI KHÁCH QUAN", 85,
                "毎日練習して, 日本語が話せるようになりました。", "Mainichi renshuu shite, Nihongo ga hanaseru you ni narimashita.", "Nhờ luyện tập hàng ngày, tôi đã trở nên nói được tiếng Nhật."));
        
        g3.addItem(new ConfusingGrammarPoint("〜ことにする", "Quyết định làm việc gì đó", "Ý CHÍ CHỦ QUAN CÁ NHÂN", 75,
                "健康のために, 毎日走ることにしました。", "Kenkou no tame ni, mainichi hashiru koto ni shimashita.", "Vì sức khỏe, tôi quyết định chạy bộ mỗi ngày."));
        
        g3.addItem(new ConfusingGrammarPoint("〜ことになる", "Được quyết định (tác động bên ngoài)", "QUYẾT ĐỊNH KHÁCH QUAN", 80,
                "来月, 日本へ出張することになりました。", "Raigetsu, Nihon he shucchou suru koto ni narimashita.", "Tôi đã được quyết định sẽ đi công tác Nhật Bản vào tháng tới."));
        
        repository.save(g3);

    }
}
