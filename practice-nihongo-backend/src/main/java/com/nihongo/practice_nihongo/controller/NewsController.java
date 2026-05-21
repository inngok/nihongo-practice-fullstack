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

    // Endpoint để trigger việc crawl báo thủ công
    @PostMapping("/crawl")
    public ResponseEntity<String> triggerCrawlManually() {
        nhkNewsCrawlerService.crawlDailyNhkNews();
        return ResponseEntity.ok("Đã chạy tiến trình crawl báo thủ công. Kiểm tra log của backend để xem chi tiết.");
    }
}
