-- Xóa bảng cũ nếu tồn tại để khởi tạo lại
DROP TABLE IF EXISTS grammars;
DROP TABLE IF EXISTS kanjis;
DROP TABLE IF EXISTS vocabularies;

-- Tạo bảng Grammar
CREATE TABLE grammars (
    id SERIAL PRIMARY KEY,
    structure VARCHAR(255) NOT NULL,
    meaning TEXT,
    explanation TEXT,
    example_sentence TEXT,
    example_meaning TEXT,
    level VARCHAR(10)
);

-- Tạo bảng Kanji
CREATE TABLE kanjis (
    id SERIAL PRIMARY KEY,
    character VARCHAR(10) NOT NULL UNIQUE,
    meaning VARCHAR(255),
    onyomi VARCHAR(255),
    kunyomi VARCHAR(255),
    level VARCHAR(10)
);

-- Tạo bảng Vocabulary
CREATE TABLE vocabularies (
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    reading VARCHAR(255),
    meaning VARCHAR(255),
    example_sentence TEXT,
    example_meaning TEXT
);
