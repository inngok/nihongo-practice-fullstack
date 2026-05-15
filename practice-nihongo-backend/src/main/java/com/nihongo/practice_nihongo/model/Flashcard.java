package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "flashcards")
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vocab_id")
    private Vocab vocab;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kanji_id")
    private Kanji kanji;

    @Column(nullable = false)
    private Integer repetition = 0;

    @Column(name = "interval_days", nullable = false)
    private Integer intervalDays = 1;

    @Column(nullable = false)
    private Double easiness = 2.5;

    @Column(name = "next_review_date", nullable = false)
    private LocalDate nextReviewDate;

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (nextReviewDate == null) {
            nextReviewDate = LocalDate.now();
        }
    }

    public Flashcard() {}

    public Flashcard(Long id, User user, Vocab vocab, Kanji kanji, Integer repetition, Integer intervalDays, Double easiness, LocalDate nextReviewDate, LocalDateTime lastReviewedAt, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.vocab = vocab;
        this.kanji = kanji;
        this.repetition = repetition;
        this.intervalDays = intervalDays;
        this.easiness = easiness;
        this.nextReviewDate = nextReviewDate;
        this.lastReviewedAt = lastReviewedAt;
        this.createdAt = createdAt;
    }

    // Manual Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Vocab getVocab() { return vocab; }
    public void setVocab(Vocab vocab) { this.vocab = vocab; }
    public Kanji getKanji() { return kanji; }
    public void setKanji(Kanji kanji) { this.kanji = kanji; }
    public Integer getRepetition() { return repetition; }
    public void setRepetition(Integer repetition) { this.repetition = repetition; }
    public Integer getIntervalDays() { return intervalDays; }
    public void setIntervalDays(Integer intervalDays) { this.intervalDays = intervalDays; }
    public Double getEasiness() { return easiness; }
    public void setEasiness(Double easiness) { this.easiness = easiness; }
    public LocalDate getNextReviewDate() { return nextReviewDate; }
    public void setNextReviewDate(LocalDate nextReviewDate) { this.nextReviewDate = nextReviewDate; }
    public LocalDateTime getLastReviewedAt() { return lastReviewedAt; }
    public void setLastReviewedAt(LocalDateTime lastReviewedAt) { this.lastReviewedAt = lastReviewedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class FlashcardBuilder {
        private Long id;
        private User user;
        private Vocab vocab;
        private Kanji kanji;
        private Integer repetition = 0;
        private Integer intervalDays = 1;
        private Double easiness = 2.5;
        private LocalDate nextReviewDate;
        private LocalDateTime lastReviewedAt;
        private LocalDateTime createdAt;

        public FlashcardBuilder id(Long id) { this.id = id; return this; }
        public FlashcardBuilder user(User user) { this.user = user; return this; }
        public FlashcardBuilder vocab(Vocab vocab) { this.vocab = vocab; return this; }
        public FlashcardBuilder kanji(Kanji kanji) { this.kanji = kanji; return this; }
        public FlashcardBuilder repetition(Integer repetition) { this.repetition = repetition; return this; }
        public FlashcardBuilder intervalDays(Integer intervalDays) { this.intervalDays = intervalDays; return this; }
        public FlashcardBuilder easiness(Double easiness) { this.easiness = easiness; return this; }
        public FlashcardBuilder nextReviewDate(LocalDate nextReviewDate) { this.nextReviewDate = nextReviewDate; return this; }
        public FlashcardBuilder lastReviewedAt(LocalDateTime lastReviewedAt) { this.lastReviewedAt = lastReviewedAt; return this; }
        public FlashcardBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Flashcard build() {
            return new Flashcard(id, user, vocab, kanji, repetition, intervalDays, easiness, nextReviewDate, lastReviewedAt, createdAt);
        }
    }

    public static FlashcardBuilder builder() {
        return new FlashcardBuilder();
    }
}
