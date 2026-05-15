package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "kanjis")
public class Kanji {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String character;

    private String kunyomi;
    private String onyomi;
    private String hanviet;
    private String meaning;
    
    @Column(columnDefinition = "TEXT")
    private String examples;

    private Integer week;
    private Integer day;
    private Integer page;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id")
    private Book book;

    public Kanji() {}

    public Kanji(Long id, String character, String kunyomi, String onyomi, String hanviet, String meaning, String examples, Integer week, Integer day, Integer page, Book book) {
        this.id = id;
        this.character = character;
        this.kunyomi = kunyomi;
        this.onyomi = onyomi;
        this.hanviet = hanviet;
        this.meaning = meaning;
        this.examples = examples;
        this.week = week;
        this.day = day;
        this.page = page;
        this.book = book;
    }

    // Manual Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCharacter() { return character; }
    public void setCharacter(String character) { this.character = character; }
    public String getKunyomi() { return kunyomi; }
    public void setKunyomi(String kunyomi) { this.kunyomi = kunyomi; }
    public String getOnyomi() { return onyomi; }
    public void setOnyomi(String onyomi) { this.onyomi = onyomi; }
    public String getHanviet() { return hanviet; }
    public void setHanviet(String hanviet) { this.hanviet = hanviet; }
    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }
    public String getExamples() { return examples; }
    public void setExamples(String examples) { this.examples = examples; }
    public Integer getWeek() { return week; }
    public void setWeek(Integer week) { this.week = week; }
    public Integer getDay() { return day; }
    public void setDay(Integer day) { this.day = day; }
    public Integer getPage() { return page; }
    public void setPage(Integer page) { this.page = page; }
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    // Minimal builder-like pattern if needed, but standard setters are enough for now
    public static class KanjiBuilder {
        private Long id;
        private String character;
        private String kunyomi;
        private String onyomi;
        private String hanviet;
        private String meaning;
        private String examples;
        private Integer week;
        private Integer day;
        private Integer page;
        private Book book;

        public KanjiBuilder id(Long id) { this.id = id; return this; }
        public KanjiBuilder character(String character) { this.character = character; return this; }
        public KanjiBuilder kunyomi(String kunyomi) { this.kunyomi = kunyomi; return this; }
        public KanjiBuilder onyomi(String onyomi) { this.onyomi = onyomi; return this; }
        public KanjiBuilder hanviet(String hanviet) { this.hanviet = hanviet; return this; }
        public KanjiBuilder meaning(String meaning) { this.meaning = meaning; return this; }
        public KanjiBuilder examples(String examples) { this.examples = examples; return this; }
        public KanjiBuilder week(Integer week) { this.week = week; return this; }
        public KanjiBuilder day(Integer day) { this.day = day; return this; }
        public KanjiBuilder page(Integer page) { this.page = page; return this; }
        public KanjiBuilder book(Book book) { this.book = book; return this; }
        
        public Kanji build() {
            return new Kanji(id, character, kunyomi, onyomi, hanviet, meaning, examples, week, day, page, book);
        }
    }

    public static KanjiBuilder builder() {
        return new KanjiBuilder();
    }
}
