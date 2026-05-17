package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.JlptPastVocab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JlptPastVocabRepository extends JpaRepository<JlptPastVocab, Long> {
    Optional<JlptPastVocab> findByWord(String word);
    List<JlptPastVocab> findAllByOrderByAppearanceCountDesc();
}
