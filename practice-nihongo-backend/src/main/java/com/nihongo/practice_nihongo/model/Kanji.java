package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kanjis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Kanji {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String character;

    private String kunyomi;
    private String onyomi;
    private String meaning;
    
    @Column(columnDefinition = "TEXT")
    private String examples;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id")
    private Book book;
}
