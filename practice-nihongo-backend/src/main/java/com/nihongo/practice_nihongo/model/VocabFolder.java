package com.nihongo.practice_nihongo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vocab_folders")
public class VocabFolder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; 

    private String description; 
    
    @Column(columnDefinition = "TEXT")
    private String sourceUrl; 

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_id")
    private VocabFolder parent; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public VocabFolder() {}

    public VocabFolder(Long id, String name, String description, String sourceUrl, VocabFolder parent, User user, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.sourceUrl = sourceUrl;
        this.parent = parent;
        this.user = user;
        this.createdAt = createdAt;
    }

    // Manual Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public VocabFolder getParent() { return parent; }
    public void setParent(VocabFolder parent) { this.parent = parent; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class VocabFolderBuilder {
        private Long id;
        private String name;
        private String description;
        private String sourceUrl;
        private VocabFolder parent;
        private User user;
        private LocalDateTime createdAt;

        public VocabFolderBuilder id(Long id) { this.id = id; return this; }
        public VocabFolderBuilder name(String name) { this.name = name; return this; }
        public VocabFolderBuilder description(String description) { this.description = description; return this; }
        public VocabFolderBuilder sourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; return this; }
        public VocabFolderBuilder parent(VocabFolder parent) { this.parent = parent; return this; }
        public VocabFolderBuilder user(User user) { this.user = user; return this; }
        public VocabFolderBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public VocabFolder build() {
            return new VocabFolder(id, name, description, sourceUrl, parent, user, createdAt);
        }
    }

    public static VocabFolderBuilder builder() {
        return new VocabFolderBuilder();
    }
}
