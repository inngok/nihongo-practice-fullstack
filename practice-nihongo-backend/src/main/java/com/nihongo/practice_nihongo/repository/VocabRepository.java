package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.Vocab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VocabRepository extends JpaRepository<Vocab, Long> {
}
