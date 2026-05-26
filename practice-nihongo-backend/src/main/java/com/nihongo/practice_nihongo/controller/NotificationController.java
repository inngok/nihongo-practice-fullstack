package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.NewsArticle;
import com.nihongo.practice_nihongo.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import io.swagger.v3.oas.annotations.Operation;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Operation(summary = "Đăng ký nhận thông báo thời gian thực qua Server-Sent Events (SSE)")
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        return notificationService.subscribe();
    }

    @Operation(summary = "Gửi thông báo tin tức giả lập để test real-time")
    @PostMapping("/test")
    public ResponseEntity<String> sendTestNotification(@RequestParam(required = false) String title) {
        String finalTitle = title != null ? title : "Nhật Bản phát triển robot AI hỗ trợ học tiếng Nhật cực đỉnh!";
        NewsArticle testArticle = new NewsArticle();
        testArticle.setId(9999L);
        testArticle.setNewsId("test-12345");
        testArticle.setTitle(finalTitle);
        testArticle.setContentRaw("Đây là nội dung báo kiểm thử được kích hoạt thủ công từ quản trị.");
        testArticle.setPublishedAt(LocalDateTime.now());
        testArticle.setImageUrl("https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600");
        testArticle.setSourceUrl("https://nhkeasier.com");

        notificationService.broadcastNewArticle(testArticle);
        return ResponseEntity.ok("Đã broadcast thông báo test thành công: " + finalTitle);
    }
}
