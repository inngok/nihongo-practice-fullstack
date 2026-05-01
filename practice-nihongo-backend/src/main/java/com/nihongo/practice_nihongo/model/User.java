package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(columnDefinition = "varchar(255) default 'STUDENT'")
    @Builder.Default
    private String role = "STUDENT";

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
