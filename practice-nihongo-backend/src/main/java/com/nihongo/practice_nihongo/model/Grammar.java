package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "grammars")
public class Grammar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String structure; 

    @Column(columnDefinition = "TEXT")
    private String meaning; 

    @Column(columnDefinition = "TEXT")
    private String explanation; 

    @Column(columnDefinition = "TEXT")
    private String exampleSentence; 

    @Column(columnDefinition = "TEXT")
    private String exampleMeaning; 

    private String level; 

    private Integer week;
    private Integer day;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    public Grammar() {}

    public Grammar(Long id, String structure, String meaning, String explanation, String exampleSentence, String exampleMeaning, String level, Integer week, Integer day, Book book) {
        this.id = id;
        this.structure = structure;
        this.meaning = meaning;
        this.explanation = explanation;
        this.exampleSentence = exampleSentence;
        this.exampleMeaning = exampleMeaning;
        this.level = level;
        this.week = week;
        this.day = day;
        this.book = book;
    }

    // Manual Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStructure() { return structure; }
    public void setStructure(String structure) { this.structure = structure; }
    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getExampleSentence() { return exampleSentence; }
    public void setExampleSentence(String exampleSentence) { this.exampleSentence = exampleSentence; }
    public String getExampleMeaning() { return exampleMeaning; }
    public void setExampleMeaning(String exampleMeaning) { this.exampleMeaning = exampleMeaning; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public Integer getWeek() { return week; }
    public void setWeek(Integer week) { this.week = week; }
    public Integer getDay() { return day; }
    public void setDay(Integer day) { this.day = day; }
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public static class GrammarBuilder {
        private Long id;
        private String structure;
        private String meaning;
        private String explanation;
        private String exampleSentence;
        private String exampleMeaning;
        private String level;
        private Integer week;
        private Integer day;
        private Book book;

        public GrammarBuilder id(Long id) { this.id = id; return this; }
        public GrammarBuilder structure(String structure) { this.structure = structure; return this; }
        public GrammarBuilder meaning(String meaning) { this.meaning = meaning; return this; }
        public GrammarBuilder explanation(String explanation) { this.explanation = explanation; return this; }
        public GrammarBuilder exampleSentence(String exampleSentence) { this.exampleSentence = exampleSentence; return this; }
        public GrammarBuilder exampleMeaning(String exampleMeaning) { this.exampleMeaning = exampleMeaning; return this; }
        public GrammarBuilder level(String level) { this.level = level; return this; }
        public GrammarBuilder week(Integer week) { this.week = week; return this; }
        public GrammarBuilder day(Integer day) { this.day = day; return this; }
        public GrammarBuilder book(Book book) { this.book = book; return this; }

        public Grammar build() {
            return new Grammar(id, structure, meaning, explanation, exampleSentence, exampleMeaning, level, week, day, book);
        }
    }

    public static GrammarBuilder builder() {
        return new GrammarBuilder();
    }
}
