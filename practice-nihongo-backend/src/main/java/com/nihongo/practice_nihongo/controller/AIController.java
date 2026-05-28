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

    @PostMapping({"/format-import", "/generate-bulk"})
    public ResponseEntity<String> formatImport(@RequestBody Map<String, String> request) {
        try {
            String rawData = request.get("rawData");
            if (rawData == null) {
                rawData = request.get("text");
            }
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

    @PostMapping("/generate-grammar")
    public ResponseEntity<String> generateGrammar(@RequestBody Map<String, String> request) {
        try {
            String structure = request.get("structure");
            String existingSentence = request.get("existingSentence");
            String result = aiService.generateGrammarDetails(structure, existingSentence);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/generate-kanji")
    public ResponseEntity<String> generateKanji(@RequestParam String character) {
        try {
            String result = aiService.generateKanjiDetails(character);
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

    @PostMapping("/translate")
    public ResponseEntity<String> translateSentence(@RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Vui lòng cung cấp văn bản cần dịch.");
            }
            String prompt = "Dịch đoạn văn tiếng Nhật sau sang tiếng Việt một cách tự nhiên, đúng ngữ cảnh. Chỉ trả về bản dịch, không giải thích thêm:\n" + text;
            String result = aiService.generateContent(prompt, 500);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(aiService.getAiUsageStats());
    }
}
