package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grammars")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grammar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String structure; // Cấu trúc ngữ pháp (vd: ~たことがある)

    @Column(columnDefinition = "TEXT")
    private String meaning; // Ý nghĩa

    @Column(columnDefinition = "TEXT")
    private String explanation; // Giải thích chi tiết

    @Column(columnDefinition = "TEXT")
    private String exampleSentence; // Câu ví dụ tiếng Nhật

    @Column(columnDefinition = "TEXT")
    private String exampleMeaning; // Nghĩa của câu ví dụ

    private String level; // Cấp độ (N5, N4, N3, N2, N1)

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;
}
