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

    @Column(columnDefinition = "TEXT")
    private String quizSentence;

    private String level; 

    private Integer week;
    private Integer day;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean publish = true;

    public Grammar() {}

    public Grammar(Long id, String structure, String meaning, String explanation, String exampleSentence, String exampleMeaning, String quizSentence, String level, Integer week, Integer day, Book book, Boolean publish) {
        this.id = id;
        this.structure = structure;
        this.meaning = meaning;
        this.explanation = explanation;
        this.exampleSentence = exampleSentence;
        this.exampleMeaning = exampleMeaning;
        this.quizSentence = quizSentence;
        this.level = level;
        this.week = week;
        this.day = day;
        this.book = book;
        this.publish = publish != null ? publish : true;
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
    public String getQuizSentence() { return quizSentence; }
    public void setQuizSentence(String quizSentence) { this.quizSentence = quizSentence; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public Integer getWeek() { return week; }
    public void setWeek(Integer week) { this.week = week; }
    public Integer getDay() { return day; }
    public void setDay(Integer day) { this.day = day; }
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
    public Boolean getPublish() { return publish; }
    public void setPublish(Boolean publish) { this.publish = publish; }

    public static class GrammarBuilder {
        private Long id;
        private String structure;
        private String meaning;
        private String explanation;
        private String exampleSentence;
        private String exampleMeaning;
        private String quizSentence;
        private String level;
        private Integer week;
        private Integer day;
        private Book book;
        private Boolean publish = true;

        public GrammarBuilder id(Long id) { this.id = id; return this; }
        public GrammarBuilder structure(String structure) { this.structure = structure; return this; }
        public GrammarBuilder meaning(String meaning) { this.meaning = meaning; return this; }
        public GrammarBuilder explanation(String explanation) { this.explanation = explanation; return this; }
        public GrammarBuilder exampleSentence(String exampleSentence) { this.exampleSentence = exampleSentence; return this; }
        public GrammarBuilder exampleMeaning(String exampleMeaning) { this.exampleMeaning = exampleMeaning; return this; }
        public GrammarBuilder quizSentence(String quizSentence) { this.quizSentence = quizSentence; return this; }
        public GrammarBuilder level(String level) { this.level = level; return this; }
        public GrammarBuilder week(Integer week) { this.week = week; return this; }
        public GrammarBuilder day(Integer day) { this.day = day; return this; }
        public GrammarBuilder book(Book book) { this.book = book; return this; }
        public GrammarBuilder publish(Boolean publish) { this.publish = publish; return this; }

        public Grammar build() {
            return new Grammar(id, structure, meaning, explanation, exampleSentence, exampleMeaning, quizSentence, level, week, day, book, publish);
        }
    }

    public static GrammarBuilder builder() {
        return new GrammarBuilder();
    }
}
