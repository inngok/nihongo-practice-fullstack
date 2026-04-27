-- Thêm dữ liệu mẫu cho Grammar
INSERT INTO grammars (structure, meaning, level, example_sentence, example_meaning) 
VALUES ('~たことがある', 'Đã từng làm gì đó', 'N5', '日本へ行ったことがあります。', 'Tôi đã từng đi Nhật Bản.');

INSERT INTO grammars (structure, meaning, level, example_sentence, example_meaning) 
VALUES ('~ほうがいい', 'Nên làm gì đó', 'N5', '毎日勉強したほうがいいです。', 'Bạn nên học bài mỗi ngày.');

-- Thêm dữ liệu mẫu cho Kanji
INSERT INTO kanjis (character, meaning, onyomi, kunyomi, level)
VALUES ('日', 'Nhật, ngày', 'ニチ, ジツ', 'ひ, -び', 'N5');

INSERT INTO kanjis (character, meaning, onyomi, kunyomi, level)
VALUES ('本', 'Bản, sách', 'ホン', 'もと', 'N5');

-- Thêm dữ liệu mẫu cho Vocabulary
INSERT INTO vocabularies (word, reading, meaning, example_sentence, example_meaning)
VALUES ('日本語', 'にほんご', 'Tiếng Nhật', '日本語を勉強しています。', 'Tôi đang học tiếng Nhật.');

INSERT INTO vocabularies (word, reading, meaning, example_sentence, example_meaning)
VALUES ('先生', 'せんせい', 'Giáo viên', '田中さんは先生です。', 'Anh Tanaka là giáo viên.');
