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
}
