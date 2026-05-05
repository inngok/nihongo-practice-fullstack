package com.nihongo.practice_nihongo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;

@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String formatDataForImport(String rawData, String type) throws Exception {
        if (apiKey == null || apiKey.isEmpty()) {
            // Fallback for demo if no API key is provided
            return simulateAiProcessing(rawData, type);
        }

        String prompt = buildPrompt(rawData, type);
        return callGemini(prompt);
    }

    private String buildPrompt(String rawData, String type) {
        String schema = type.equals("kanjis") 
            ? "[{\"character\": \"...\", \"kunyomi\": \"...\", \"onyomi\": \"...\", \"hanviet\": \"...\", \"meaning\": \"...\", \"examples\": \"...\", \"week\": null, \"day\": null}]"
            : "[{\"word\": \"...\", \"reading\": \"...\", \"meaning\": \"...\", \"example\": \"...\", \"exampleMeaning\": \"...\", \"week\": null, \"day\": null}]";

        return "You are a professional Japanese data formatter. Convert the following messy data into a valid JSON array strictly following this schema: " + schema + 
               ". \n\nInput data:\n" + rawData + 
               "\n\nRules:\n" +
               "1. Return ONLY the JSON array. No other text.\n" +
               "2. Ensure all fields are present. Use null for numeric fields (week, day) and empty strings for text fields if information is missing.\n" +
               "3. For Kanji, separate kunyomi and onyomi correctly if possible. If only one reading is provided, try to identify if it is Kun or On.\n" +
               "4. For Examples, please format as: 'Word (Reading): Meaning'.\n" +
               "5. Ensure the JSON is valid and encoded in UTF-8.";
    }

    private String callGemini(String prompt) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

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
        // Simple fallback if no API key
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
}
