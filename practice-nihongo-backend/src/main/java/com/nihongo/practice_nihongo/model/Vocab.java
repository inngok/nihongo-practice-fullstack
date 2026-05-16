package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vocabs")
public class Vocab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String word;

    private String reading;
    private String meaning;
    
    @Column(columnDefinition = "TEXT")
    private String example;
    
    @Column(columnDefinition = "TEXT")
    private String exampleMeaning;

    private Integer week;
    private Integer day;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id")
    private Book book;

    public Vocab() {}

    public Vocab(Long id, String word, String reading, String meaning, String example, String exampleMeaning, Integer week, Integer day, Book book) {
        this.id = id;
        this.word = word;
        this.reading = reading;
        this.meaning = meaning;
        this.example = example;
        this.exampleMeaning = exampleMeaning;
        this.week = week;
        this.day = day;
        this.book = book;
    }

    // Manual Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getWord() { return word; }
    public void setWord(String word) { this.word = word; }
    public String getReading() { return reading; }
    public void setReading(String reading) { this.reading = reading; }
    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }
    public String getExample() { return example; }
    public void setExample(String example) { this.example = example; }
    public String getExampleMeaning() { return exampleMeaning; }
    public void setExampleMeaning(String exampleMeaning) { this.exampleMeaning = exampleMeaning; }
    public Integer getWeek() { return week; }
    public void setWeek(Integer week) { this.week = week; }
    public Integer getDay() { return day; }
    public void setDay(Integer day) { this.day = day; }
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public static class VocabBuilder {
        private Long id;
        private String word;
        private String reading;
        private String meaning;
        private String example;
        private String exampleMeaning;
        private Integer week;
        private Integer day;
        private Book book;

        public VocabBuilder id(Long id) { this.id = id; return this; }
        public VocabBuilder word(String word) { this.word = word; return this; }
        public VocabBuilder reading(String reading) { this.reading = reading; return this; }
        public VocabBuilder meaning(String meaning) { this.meaning = meaning; return this; }
        public VocabBuilder example(String example) { this.example = example; return this; }
        public VocabBuilder exampleMeaning(String exampleMeaning) { this.exampleMeaning = exampleMeaning; return this; }
        public VocabBuilder week(Integer week) { this.week = week; return this; }
        public VocabBuilder day(Integer day) { this.day = day; return this; }
        public VocabBuilder book(Book book) { this.book = book; return this; }

        public Vocab build() {
            return new Vocab(id, word, reading, meaning, example, exampleMeaning, week, day, book);
        }
    }

    public static VocabBuilder builder() {
        return new VocabBuilder();
    }
}
