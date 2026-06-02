package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.NewsArticle;
import com.nihongo.practice_nihongo.repository.NewsArticleRepository;
import com.nihongo.practice_nihongo.service.NhkNewsCrawlerService;
import com.nihongo.practice_nihongo.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {

    @Autowired
    private NewsArticleRepository newsArticleRepository;

    @Autowired
    private NhkNewsCrawlerService nhkNewsCrawlerService;

    @Autowired
    private AiService aiService;

    @GetMapping
    @Cacheable(value = "newsListCache")
    public List<NewsArticle> getAllNews() {
        return newsArticleRepository.findAll(Sort.by(Sort.Direction.DESC, "publishedAt"));
    }

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
        nhkNewsCrawlerService.crawlHistoricalNews(pages);
        return ResponseEntity.ok("Đang tiến hành crawl " + pages + " trang báo lịch sử dưới nền. Quá trình này có thể mất vài phút. Hãy kiểm tra log hệ thống để xem tiến độ chi tiết.");
    }

    @PostMapping("/{id}/extract-vocab")
    @CacheEvict(value = {"newsListCache", "newsDetailCache"}, allEntries = true)
    public ResponseEntity<NewsArticle> extractVocab(@PathVariable Long id) {
        try {
            NewsArticle article = newsArticleRepository.findById(id).orElse(null);
            if (article == null) {
                return ResponseEntity.notFound().build();
            }

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

    @PostMapping("/{id}/translate")
    @CacheEvict(value = {"newsListCache", "newsDetailCache"}, allEntries = true)
    public ResponseEntity<NewsArticle> translateNews(@PathVariable Long id) {
        try {
            NewsArticle article = newsArticleRepository.findById(id).orElse(null);
            if (article == null) {
                return ResponseEntity.notFound().build();
            }

            if (article.getTranslation() != null && !article.getTranslation().trim().isEmpty()) {
                return ResponseEntity.ok(article);
            }

            String text = article.getContentRaw();
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            String translation = aiService.generateContent("Dịch bài báo tiếng Nhật sau sang tiếng Việt tự nhiên và dễ hiểu, chỉ trả về nội dung dịch, không có bất kỳ giải thích nào khác:\n\n" + text, 2500);
            article.setTranslation(translation);

            newsArticleRepository.save(article);

            return ResponseEntity.ok(article);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
