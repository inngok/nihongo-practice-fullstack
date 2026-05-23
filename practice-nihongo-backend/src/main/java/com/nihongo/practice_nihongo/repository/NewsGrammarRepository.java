package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.NewsGrammar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsGrammarRepository extends JpaRepository<NewsGrammar, Long> {
    List<NewsGrammar> findByNewsArticleId(Long newsId);
}
