package com.nihongo.practice_nihongo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "vocab_folders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabFolder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Ví dụ: "NHK" hoặc "Ngày 8/5"

    private String description; // Mô tả ngắn nếu cần
    
    @Column(columnDefinition = "TEXT")
    private String sourceUrl; // Link đính kèm bài báo, web...

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_id")
    private VocabFolder parent; // Để tạo thư mục con (ví dụ: thư mục cha là NHK, thư mục con là ngày 8/5)

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
}
