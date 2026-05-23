package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "news_vocabs")
public class NewsVocab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "news_id", nullable = false)
    private NewsArticle newsArticle;

    @Column(nullable = false)
    private String word;

    private String furigana;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String meaning;

    private String jlptLevel; // N5, N4, N3...

    public NewsVocab() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public NewsArticle getNewsArticle() { return newsArticle; }
    public void setNewsArticle(NewsArticle newsArticle) { this.newsArticle = newsArticle; }
    public String getWord() { return word; }
    public void setWord(String word) { this.word = word; }
    public String getFurigana() { return furigana; }
    public void setFurigana(String furigana) { this.furigana = furigana; }
    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }
    public String getJlptLevel() { return jlptLevel; }
    public void setJlptLevel(String jlptLevel) { this.jlptLevel = jlptLevel; }
}
