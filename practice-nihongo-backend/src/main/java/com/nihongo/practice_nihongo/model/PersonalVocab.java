package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "personal_vocabs")
public class PersonalVocab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String word;

    private String reading;

    @Column(name = "item_type")
    private String itemType; // VOCAB, TEXT

    @Column(columnDefinition = "TEXT")
    private String meaning;

    @Column(columnDefinition = "TEXT")
    private String example;

    @Column(columnDefinition = "TEXT")
    private String exampleMeaning;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "folder_id")
    private VocabFolder folder;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public PersonalVocab() {}

    public PersonalVocab(Long id, String word, String reading, String meaning, String example, String exampleMeaning, LocalDateTime createdAt, User user, VocabFolder folder, String itemType) {
        this.id = id;
        this.word = word;
        this.reading = reading;
        this.itemType = itemType != null ? itemType : "VOCAB";
        this.meaning = meaning;
        this.example = example;
        this.exampleMeaning = exampleMeaning;
        this.createdAt = createdAt;
        this.user = user;
        this.folder = folder;
    }

    // Manual Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getWord() { return word; }
    public void setWord(String word) { this.word = word; }
    public String getReading() { return reading; }
    public void setReading(String reading) { this.reading = reading; }
    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }
    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }
    public String getExample() { return example; }
    public void setExample(String example) { this.example = example; }
    public String getExampleMeaning() { return exampleMeaning; }
    public void setExampleMeaning(String exampleMeaning) { this.exampleMeaning = exampleMeaning; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public VocabFolder getFolder() { return folder; }
    public void setFolder(VocabFolder folder) { this.folder = folder; }

    public static class PersonalVocabBuilder {
        private Long id;
        private String word;
        private String reading;
        private String itemType = "VOCAB";
        private String meaning;
        private String example;
        private String exampleMeaning;
        private LocalDateTime createdAt;
        private User user;
        private VocabFolder folder;

        public PersonalVocabBuilder id(Long id) { this.id = id; return this; }
        public PersonalVocabBuilder word(String word) { this.word = word; return this; }
        public PersonalVocabBuilder reading(String reading) { this.reading = reading; return this; }
        public PersonalVocabBuilder itemType(String itemType) { this.itemType = itemType; return this; }
        public PersonalVocabBuilder meaning(String meaning) { this.meaning = meaning; return this; }
        public PersonalVocabBuilder example(String example) { this.example = example; return this; }
        public PersonalVocabBuilder exampleMeaning(String exampleMeaning) { this.exampleMeaning = exampleMeaning; return this; }
        public PersonalVocabBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public PersonalVocabBuilder user(User user) { this.user = user; return this; }
        public PersonalVocabBuilder folder(VocabFolder folder) { this.folder = folder; return this; }

        public PersonalVocab build() {
            return new PersonalVocab(id, word, reading, meaning, example, exampleMeaning, createdAt, user, folder, itemType);
        }
    }

    public static PersonalVocabBuilder builder() {
        return new PersonalVocabBuilder();
    }
}
