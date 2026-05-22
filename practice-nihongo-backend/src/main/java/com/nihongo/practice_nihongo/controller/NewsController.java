package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.NewsArticle;
import com.nihongo.practice_nihongo.repository.NewsArticleRepository;
import com.nihongo.practice_nihongo.service.NhkNewsCrawlerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*") // Đảm bảo frontend có thể gọi API
public class NewsController {

    @Autowired
    private NewsArticleRepository newsArticleRepository;

    @Autowired
    private NhkNewsCrawlerService nhkNewsCrawlerService;

    @Autowired
    private com.nihongo.practice_nihongo.service.AiService aiService;

    // Lấy danh sách toàn bộ bài báo, sắp xếp mới nhất lên đầu
    @GetMapping
    public ResponseEntity<List<NewsArticle>> getAllNews() {
        List<NewsArticle> news = newsArticleRepository.findAll(Sort.by(Sort.Direction.DESC, "publishedAt"));
        return ResponseEntity.ok(news);
    }

    // Lấy chi tiết 1 bài báo bằng ID
    @GetMapping("/{id}")
    public ResponseEntity<NewsArticle> getNewsById(@PathVariable Long id) {
        return newsArticleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/crawl")
    public ResponseEntity<String> triggerCrawlManually() {
        nhkNewsCrawlerService.crawlDailyNhkNews();
        return ResponseEntity.ok("Đã chạy tiến trình crawl báo thủ công. Kiểm tra log của backend để xem chi tiết.");
    }

    // Endpoint để trích xuất từ vựng từ bài báo bằng AI
    @PostMapping("/{id}/extract-vocab")
    public ResponseEntity<NewsArticle> extractVocab(@PathVariable Long id) {
        try {
            NewsArticle article = newsArticleRepository.findById(id).orElse(null);
            if (article == null) {
                return ResponseEntity.notFound().build();
            }

            // Nếu đã extract rồi thì không gọi AI nữa để tiết kiệm
            if (article.getExtractedVocab() != null && !article.getExtractedVocab().trim().isEmpty() && !article.getExtractedVocab().equals("[]")) {
                return ResponseEntity.ok(article);
            }

            String text = article.getContentRaw();
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            String extractedJson = aiService.extractVocabularyFromNews(text);
            article.setExtractedVocab(extractedJson);

            newsArticleRepository.save(article);

            return ResponseEntity.ok(article);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
