package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vocabularies")
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String word; 

    private String reading; 

    private String meaning; 

    @Column(columnDefinition = "TEXT")
    private String exampleSentence;

    @Column(columnDefinition = "TEXT")
    private String exampleMeaning;

    public Vocabulary() {}

    public Vocabulary(Long id, String word, String reading, String meaning, String exampleSentence, String exampleMeaning) {
        this.id = id;
        this.word = word;
        this.reading = reading;
        this.meaning = meaning;
        this.exampleSentence = exampleSentence;
        this.exampleMeaning = exampleMeaning;
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
    public String getExampleSentence() { return exampleSentence; }
    public void setExampleSentence(String exampleSentence) { this.exampleSentence = exampleSentence; }
    public String getExampleMeaning() { return exampleMeaning; }
    public void setExampleMeaning(String exampleMeaning) { this.exampleMeaning = exampleMeaning; }

    public static class VocabularyBuilder {
        private Long id;
        private String word;
        private String reading;
        private String meaning;
        private String exampleSentence;
        private String exampleMeaning;

        public VocabularyBuilder id(Long id) { this.id = id; return this; }
        public VocabularyBuilder word(String word) { this.word = word; return this; }
        public VocabularyBuilder reading(String reading) { this.reading = reading; return this; }
        public VocabularyBuilder meaning(String meaning) { this.meaning = meaning; return this; }
        public VocabularyBuilder exampleSentence(String exampleSentence) { this.exampleSentence = exampleSentence; return this; }
        public VocabularyBuilder exampleMeaning(String exampleMeaning) { this.exampleMeaning = exampleMeaning; return this; }

        public Vocabulary build() {
            return new Vocabulary(id, word, reading, meaning, exampleSentence, exampleMeaning);
        }
    }

    public static VocabularyBuilder builder() {
        return new VocabularyBuilder();
    }
}
