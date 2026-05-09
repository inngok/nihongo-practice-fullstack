package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.AiUsage;
import com.nihongo.practice_nihongo.repository.AiUsageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.time.LocalDate;
import java.util.*;

@Service
public class AiService {

    @Value("${GEMINI_API_KEY:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final AiUsageRepository aiUsageRepository;

    public AiService(AiUsageRepository aiUsageRepository) {
        this.aiUsageRepository = aiUsageRepository;
    }

    private synchronized void recordAiUsage(boolean isSuccess) {
        try {
            LocalDate today = LocalDate.now();
            AiUsage usage = aiUsageRepository.findByUsageDate(today)
                    .orElseGet(() -> new AiUsage(today));
            
            usage.setTotalCalls(usage.getTotalCalls() + 1);
            if (isSuccess) {
                usage.setSuccessCalls(usage.getSuccessCalls() + 1);
            } else {
                usage.setFailCalls(usage.getFailCalls() + 1);
            }
            aiUsageRepository.save(usage);
        } catch (Exception e) {
            System.err.println("Error saving AI usage stats to database: " + e.getMessage());
        }
    }

    public Map<String, Object> getAiUsageStats() {
        LocalDate today = LocalDate.now();
        AiUsage usage = aiUsageRepository.findByUsageDate(today)
                .orElseGet(() -> new AiUsage(today));

        int limit = 1500; // Gemini RPD limit
        int used = usage.getTotalCalls();
        int remaining = Math.max(0, limit - used);

        Map<String, Object> stats = new HashMap<>();
        stats.put("used", used);
        stats.put("success", usage.getSuccessCalls());
        stats.put("fail", usage.getFailCalls());
        stats.put("limit", limit);
        stats.put("remaining", remaining);
        stats.put("rpmLimit", 15);
        stats.put("isKeyConfigured", apiKey != null && !apiKey.trim().isEmpty());
        return stats;
    }

    public String formatDataForImport(String rawData, String type) throws Exception {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                // Fallback for demo if no API key is provided
                String res = simulateAiProcessing(rawData, type);
                recordAiUsage(true);
                return res;
            }

            String prompt = buildPrompt(rawData, type);
            String res = callGemini(prompt);
            recordAiUsage(true);
            return res;
        } catch (Exception e) {
            recordAiUsage(false);
            throw e;
        }
    }

    public String generateVocabDetails(String word) throws Exception {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                String res = simulateVocabGeneration(word);
                recordAiUsage(true);
                return res;
            }
            String prompt = "You are a professional Japanese teacher. For the Japanese word or phrase provided, " +
                    "generate its reading, Vietnamese meaning, a natural Japanese example sentence, and the Vietnamese translation of that example sentence. " +
                    "Return the response strictly as a JSON object with the following keys:\n" +
                    "{\n" +
                    "  \"reading\": \"(only hiragana/katakana representation, no kanji, no spaces)\",\n" +
                    "  \"meaning\": \"(Vietnamese translation)\",\n" +
                    "  \"example\": \"(natural Japanese example sentence containing the word)\",\n" +
                    "  \"exampleMeaning\": \"(Vietnamese translation of the example sentence)\"\n" +
                    "}\n" +
                    "Do not include any formatting, markdown, or other text except the clean JSON object.\n" +
                    "Word: " + word;
            String res = callGemini(prompt);
            recordAiUsage(true);
            return res;
        } catch (Exception e) {
            recordAiUsage(false);
            throw e;
        }
    }

    private String buildPrompt(String rawData, String type) {
        String schema = type.equals("kanjis") 
            ? "[{\"character\": \"...\", \"kunyomi\": \"...\", \"onyomi\": \"...\", \"hanviet\": \"...\", \"meaning\": \"...\", \"examples\": \"...\", \"week\": null, \"day\": null, \"page\": null}]"
            : "[{\"word\": \"...\", \"reading\": \"...\", \"meaning\": \"...\", \"example\": \"...\", \"exampleMeaning\": \"...\", \"week\": null, \"day\": null, \"page\": null}]";

        return "You are a professional Japanese data formatter. Convert the following messy data into a valid JSON array strictly following this schema: " + schema + 
               ". \n\nInput data:\n" + rawData + 
               "\n\nRules:\n" +
               "1. Return ONLY the JSON array. No other text.\n" +
               "2. Ensure all fields are present. Use null for numeric fields (week, day, page) and empty strings for text fields if information is missing.\n" +
               "3. For Kanji, separate kunyomi and onyomi correctly if possible. If only one reading is provided, try to identify if it is Kun or On.\n" +
               "4. For Examples, please format as: 'Word (Reading): Meaning'.\n" +
               "5. Ensure the JSON is valid and encoded in UTF-8.";
    }

    private String callGemini(String prompt) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            headers.set("x-goog-api-key", apiKey.trim());
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            Map body = response.getBody();
            if (body != null) {
                List candidates = (List) body.get("candidates");
                Map firstCandidate = (Map) candidates.get(0);
                Map content = (Map) firstCandidate.get("content");
                List parts = (List) content.get("parts");
                Map firstPart = (Map) parts.get(0);
                String text = (String) firstPart.get("text");
                
                // Clean markdown code blocks if present
                return text.replaceAll("```json", "").replaceAll("```", "").trim();
            }
        }
        throw new Exception("Failed to call Gemini API: " + response.getStatusCode());
    }

    private String simulateAiProcessing(String rawData, String type) {
        String[] lines = rawData.split("\n");
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < lines.length; i++) {
            if (lines[i].trim().isEmpty()) continue;
            String line = lines[i].replace("\"", "\\\"");
            if (type.equals("kanjis")) {
                sb.append(String.format("{\"character\": \"%s\", \"meaning\": \"Formatted from raw\"}", line));
            } else {
                sb.append(String.format("{\"word\": \"%s\", \"meaning\": \"Formatted from raw\"}", line));
            }
            if (i < lines.length - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private String simulateVocabGeneration(String word) {
        return String.format("{\"reading\": \"[Học viên tự thêm]\", \"meaning\": \"Nghĩa của từ %s\", \"example\": \"%sを勉強します。\", \"exampleMeaning\": \"Tôi học từ %s.\"}", word, word, word);
    }
}
