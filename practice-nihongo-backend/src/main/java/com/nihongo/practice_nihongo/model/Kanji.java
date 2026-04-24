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

    @Column(nullable = false, unique = true)
    private String character; // Chữ Hán (vd: 日)

    private String meaning; // Nghĩa (vd: Nhật, ngày)
    
    private String onyomi; // Âm On (vd: ニチ, ジツ)
    
    private String kunyomi; // Âm Kun (vd: ひ, -び)
    
    private String level; // N5, N4...
}
