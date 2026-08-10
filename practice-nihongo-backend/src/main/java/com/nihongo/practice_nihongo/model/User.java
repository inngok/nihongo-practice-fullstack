package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "role", length = 255)
    private String role = "STUDENT";

    @Column(name = "jlpt_level", length = 10)
    private String jlptLevel = "N3";

    @Column(name = "is_verified", nullable = false, columnDefinition = "boolean default false")
    private boolean isVerified = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public User() {}

    public User(Long id, String name, String email, String password, LocalDateTime createdAt, String role, String jlptLevel, boolean isVerified) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.role = role;
        this.jlptLevel = jlptLevel;
        this.isVerified = isVerified;
    }

    // Manual Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getJlptLevel() { return jlptLevel; }
    public void setJlptLevel(String jlptLevel) { this.jlptLevel = jlptLevel; }
    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public static class UserBuilder {
        private Long id;
        private String name;
        private String email;
        private String password;
        private LocalDateTime createdAt;
        private String role = "STUDENT";
        private String jlptLevel = "N3";
        private boolean isVerified = false;

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder role(String role) { this.role = role; return this; }
        public UserBuilder jlptLevel(String jlptLevel) { this.jlptLevel = jlptLevel; return this; }
        public UserBuilder isVerified(boolean isVerified) { this.isVerified = isVerified; return this; }

        public User build() {
            return new User(id, name, email, password, createdAt, role, jlptLevel, isVerified);
        }
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }
}
