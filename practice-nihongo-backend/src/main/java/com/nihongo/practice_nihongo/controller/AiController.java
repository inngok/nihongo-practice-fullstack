package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

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
}
