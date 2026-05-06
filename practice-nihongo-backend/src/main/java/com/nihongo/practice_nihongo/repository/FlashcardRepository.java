package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {

    List<Flashcard> findByUserId(Long userId);

    @Query("SELECT f FROM Flashcard f WHERE f.user.id = :userId AND f.nextReviewDate <= :date")
    List<Flashcard> findDueCards(@Param("userId") Long userId, @Param("date") LocalDate date);

    Optional<Flashcard> findByUserIdAndVocabId(Long userId, Long vocabId);

    Optional<Flashcard> findByUserIdAndKanjiId(Long userId, Long kanjiId);

    @Query("SELECT COUNT(f) FROM Flashcard f WHERE f.user.id = :userId AND f.nextReviewDate <= :date")
    long countDueCards(@Param("userId") Long userId, @Param("date") LocalDate date);
}
