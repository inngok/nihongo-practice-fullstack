package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.Kanji;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KanjiRepository extends JpaRepository<Kanji, Long> {
    List<Kanji> findByBookId(Long bookId);
    List<Kanji> findByBookIdAndWeekAndDay(Long bookId, Integer week, Integer day);
}
