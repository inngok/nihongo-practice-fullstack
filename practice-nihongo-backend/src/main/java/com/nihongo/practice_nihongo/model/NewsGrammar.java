package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "news_grammars")
public class NewsGrammar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "news_id", nullable = false)
    private NewsArticle newsArticle;

    @Column(nullable = false)
    private String grammarPoint;

    @Column(columnDefinition = "TEXT")
    private String meaning;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    public NewsGrammar() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public NewsArticle getNewsArticle() { return newsArticle; }
    public void setNewsArticle(NewsArticle newsArticle) { this.newsArticle = newsArticle; }
    public String getGrammarPoint() { return grammarPoint; }
    public void setGrammarPoint(String grammarPoint) { this.grammarPoint = grammarPoint; }
    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
