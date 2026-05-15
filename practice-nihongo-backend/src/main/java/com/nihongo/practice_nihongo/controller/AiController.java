package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    private final AiService aiService;

    public AIController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/format-import")
    public ResponseEntity<String> formatImport(@RequestBody Map<String, String> request) {
        try {
            String rawData = request.get("rawData");
            String type = request.get("type");
            String result = aiService.formatDataForImport(rawData, type);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/generate-vocab")
    public ResponseEntity<String> generateVocab(@RequestParam String word) {
        try {
            String result = aiService.generateVocabDetails(word);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody Map<String, Object> request) {
        try {
            String scenario = (String) request.get("scenario");
            java.util.List<Map<String, String>> history = (java.util.List<Map<String, String>>) request.get("history");
            String userMessage = (String) request.get("userMessage");
            String result = aiService.generateChatResponse(scenario, history, userMessage);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
