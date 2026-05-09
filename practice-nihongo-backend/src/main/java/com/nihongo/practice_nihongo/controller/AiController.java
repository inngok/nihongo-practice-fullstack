package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @Operation(summary = "Xử lý dữ liệu thô bằng AI để nhập vào hệ thống")
    @PostMapping("/format-import")
    public ResponseEntity<String> formatImport(@RequestBody Map<String, String> request) {
        String rawData = request.get("rawData");
        String type = request.get("type"); // "kanjis" or "vocabs"
        
        if (rawData == null || rawData.isEmpty()) {
            return ResponseEntity.badRequest().body("Raw data is required");
        }

        try {
            String formattedJson = aiService.formatDataForImport(rawData, type);
            return ResponseEntity.ok(formattedJson);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing AI request: " + e.getMessage());
        }
    }

    @Operation(summary = "Tự động phân tích và sinh thông tin từ vựng bằng AI")
    @GetMapping("/generate-vocab")
    public ResponseEntity<String> generateVocab(@RequestParam String word) {
        if (word == null || word.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Word is required");
        }
        try {
            String jsonResult = aiService.generateVocabDetails(word);
            return ResponseEntity.ok(jsonResult);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing AI request: " + e.getMessage());
        }
    }

    @Operation(summary = "Đàm thoại tiếng Nhật thực tế nhập vai với AI")
    @PostMapping("/chat")
    public ResponseEntity<String> chatWithAi(@RequestBody Map<String, Object> request) {
        String scenario = (String) request.get("scenario");
        String userMessage = (String) request.get("userMessage");
        java.util.List<java.util.Map<String, String>> history = (java.util.List<java.util.Map<String, String>>) request.get("history");

        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("User message is required");
        }
        try {
            String jsonResult = aiService.generateChatResponse(scenario, history, userMessage);
            return ResponseEntity.ok(jsonResult);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing AI chat: " + e.getMessage());
        }
    }
}
