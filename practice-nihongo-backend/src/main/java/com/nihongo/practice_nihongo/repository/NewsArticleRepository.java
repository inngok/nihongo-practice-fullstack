package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {
    Optional<NewsArticle> findByNewsId(String newsId);
    boolean existsByNewsId(String newsId);
}
