package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.ConfusingGrammarPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfusingGrammarPointRepository extends JpaRepository<ConfusingGrammarPoint, Long> {
}
