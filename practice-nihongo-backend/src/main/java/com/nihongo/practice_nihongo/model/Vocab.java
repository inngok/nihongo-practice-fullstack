package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vocabs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vocab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String word;

    private String reading;
    private String meaning;
    
    @Column(columnDefinition = "TEXT")
    private String example;
    
    @Column(columnDefinition = "TEXT")
    private String exampleMeaning;

    private Integer week;
    private Integer day;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id")
    private Book book;
}
