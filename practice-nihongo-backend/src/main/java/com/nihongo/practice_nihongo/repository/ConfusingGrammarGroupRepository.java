package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.ConfusingGrammarGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfusingGrammarGroupRepository extends JpaRepository<ConfusingGrammarGroup, Long> {
    Optional<ConfusingGrammarGroup> findByTitle(String title);
}
