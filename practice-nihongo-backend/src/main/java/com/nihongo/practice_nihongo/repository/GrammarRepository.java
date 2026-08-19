package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.Grammar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarRepository extends JpaRepository<Grammar, Long> {
    // Bạn có thể thêm các hàm tìm kiếm nhanh ở đây, ví dụ:
    List<Grammar> findByLevel(String level);
    List<Grammar> findByStructureContaining(String keyword);
    List<Grammar> findByBookId(Long bookId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM grammars WHERE example_meaning IS NOT NULL AND example_sentence IS NOT NULL AND level = :level ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Grammar findRandomGrammarWithExampleByLevel(@org.springframework.data.repository.query.Param("level") String level);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM grammars WHERE example_meaning IS NOT NULL AND example_sentence IS NOT NULL AND book_id = :bookId ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Grammar findRandomGrammarWithExampleByBookId(@org.springframework.data.repository.query.Param("bookId") Long bookId);
}
