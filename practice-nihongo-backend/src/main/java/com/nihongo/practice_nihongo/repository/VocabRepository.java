package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.Vocab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabRepository extends JpaRepository<Vocab, Long> {
    List<Vocab> findByBookId(Long bookId);
    List<Vocab> findByBookIdAndWeekAndDay(Long bookId, Integer week, Integer day);

    @org.springframework.transaction.annotation.Transactional
    void deleteByBookId(Long bookId);
}
