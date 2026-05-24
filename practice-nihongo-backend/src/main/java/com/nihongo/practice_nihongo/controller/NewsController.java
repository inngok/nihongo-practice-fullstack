package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.NewsArticle;
import com.nihongo.practice_nihongo.repository.NewsArticleRepository;
import com.nihongo.practice_nihongo.service.NhkNewsCrawlerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
    @Cacheable(value = "newsListCache")
    public List<NewsArticle> getAllNews() {
        return newsArticleRepository.findAll(Sort.by(Sort.Direction.DESC, "publishedAt"));
    }

    // Lấy chi tiết 1 bài báo bằng ID
    @GetMapping("/{id}")
    @Cacheable(value = "newsDetailCache", key = "#id")
    public NewsArticle getNewsById(@PathVariable Long id) {
        return newsArticleRepository.findById(id).orElse(null);
    }

    @PostMapping("/crawl")
    @CacheEvict(value = {"newsListCache", "newsDetailCache"}, allEntries = true)
    public ResponseEntity<String> triggerCrawlManually() {
        nhkNewsCrawlerService.crawlDailyNhkNews();
        return ResponseEntity.ok("Đã chạy tiến trình crawl báo thủ công. Kiểm tra log của backend để xem chi tiết.");
    }

    @PostMapping("/crawl-history")
    @CacheEvict(value = {"newsListCache", "newsDetailCache"}, allEntries = true)
    public ResponseEntity<String> triggerCrawlHistory(@RequestParam(defaultValue = "3") int pages) {
        // Chạy dưới nền (background thread) để không bị timeout (vì AI tốn nhiều thời gian)
        new Thread(() -> {
            nhkNewsCrawlerService.crawlHistoricalNews(pages);
        }).start();
        return ResponseEntity.ok("Đang tiến hành crawl " + pages + " trang báo lịch sử dưới nền. Quá trình này có thể mất vài phút. Hãy kiểm tra log hệ thống để xem tiến độ chi tiết.");
    }

    // Endpoint để trích xuất từ vựng từ bài báo bằng AI
    @PostMapping("/{id}/extract-vocab")
    @CacheEvict(value = {"newsListCache", "newsDetailCache"}, allEntries = true)
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
