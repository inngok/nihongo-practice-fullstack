package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "jlpt_past_vocab")
public class JlptPastVocab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String word;

    private String kanji;

    private String meaning;

    @Column(name = "appearance_count", nullable = false)
    private int appearanceCount = 1;

    @Column(name = "exam_history")
    private String examHistory;

    // Default constructor
    public JlptPastVocab() {}

    public JlptPastVocab(String word, String kanji, String meaning, int appearanceCount, String examHistory) {
        this.word = word;
        this.kanji = kanji;
        this.meaning = meaning;
        this.appearanceCount = appearanceCount;
        this.examHistory = examHistory;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public String getKanji() {
        return kanji;
    }

    public void setKanji(String kanji) {
        this.kanji = kanji;
    }

    public String getMeaning() {
        return meaning;
    }

    public void setMeaning(String meaning) {
        this.meaning = meaning;
    }

    public int getAppearanceCount() {
        return appearanceCount;
    }

    public void setAppearanceCount(int appearanceCount) {
        this.appearanceCount = appearanceCount;
    }

    public String getExamHistory() {
        return examHistory;
    }

    public void setExamHistory(String examHistory) {
        this.examHistory = examHistory;
    }
}
