package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.JlptPastVocab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JlptPastVocabRepository extends JpaRepository<JlptPastVocab, Long> {
    Optional<JlptPastVocab> findFirstByWordAndLevel(String word, String level);
    Optional<JlptPastVocab> findFirstByWord(String word);
    List<JlptPastVocab> findAllByOrderByAppearanceCountDesc();
    List<JlptPastVocab> findAllByLevelOrderByAppearanceCountDesc(String level);
    boolean existsByLevelAndExamHistoryContaining(String level, String examPeriod);
    List<JlptPastVocab> findAllByLevelAndExamHistoryContaining(String level, String examPeriod);
}
