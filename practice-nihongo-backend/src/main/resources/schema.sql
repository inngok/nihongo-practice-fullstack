-- Xóa bảng cũ nếu tồn tại để khởi tạo lại
DROP TABLE IF EXISTS grammars CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS kanjis CASCADE;
DROP TABLE IF EXISTS vocabularies CASCADE;
DROP TABLE IF EXISTS vocabs CASCADE;

-- Tạo bảng Books trước để Grammar có thể tham chiếu
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    japanese_title VARCHAR(255),
    level_label VARCHAR(255),
    num VARCHAR(10)
);

-- Tạo bảng Grammar
CREATE TABLE grammars (
    id SERIAL PRIMARY KEY,
    structure VARCHAR(255) NOT NULL,
    meaning TEXT,
    explanation TEXT,
    example_sentence TEXT,
    example_meaning TEXT,
    level VARCHAR(10),
    book_id INTEGER REFERENCES books(id) ON DELETE SET NULL
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
