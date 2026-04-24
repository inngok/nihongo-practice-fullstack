package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.Kanji;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KanjiRepository extends JpaRepository<Kanji, Long> {
}
