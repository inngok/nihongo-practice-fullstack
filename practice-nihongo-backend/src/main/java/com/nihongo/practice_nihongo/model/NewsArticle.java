package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "news_articles")
public class NewsArticle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String newsId; // NHK's unique ID for the news

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String contentWithFurigana;

    @Column(columnDefinition = "TEXT")
    private String contentRaw;

    @Column(columnDefinition = "TEXT")
    private String translation; // AI translated text

    private String imageUrl;
    
    private String audioUrl;
    
    private String sourceUrl;

    private LocalDateTime publishedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public NewsArticle() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNewsId() { return newsId; }
    public void setNewsId(String newsId) { this.newsId = newsId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContentWithFurigana() { return contentWithFurigana; }
    public void setContentWithFurigana(String contentWithFurigana) { this.contentWithFurigana = contentWithFurigana; }
    public String getContentRaw() { return contentRaw; }
    public void setContentRaw(String contentRaw) { this.contentRaw = contentRaw; }
    public String getTranslation() { return translation; }
    public void setTranslation(String translation) { this.translation = translation; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
