package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.NewsVocab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsVocabRepository extends JpaRepository<NewsVocab, Long> {
    List<NewsVocab> findByNewsArticleId(Long newsId);
}
