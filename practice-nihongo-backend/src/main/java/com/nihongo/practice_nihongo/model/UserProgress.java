package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "progress_key"})
})
public class UserProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "progress_key", nullable = false, length = 100)
    private String progressKey;

    @Column(name = "progress_data", columnDefinition = "TEXT")
    private String progressData;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UserProgress() {}

    public UserProgress(User user, String progressKey, String progressData) {
        this.user = user;
        this.progressKey = progressKey;
        this.progressData = progressData;
    }

    // Getters Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getProgressKey() { return progressKey; }
    public void setProgressKey(String progressKey) { this.progressKey = progressKey; }
    public String getProgressData() { return progressData; }
    public void setProgressData(String progressData) { this.progressData = progressData; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
