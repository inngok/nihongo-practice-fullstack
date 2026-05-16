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
    private final java.util.concurrent.atomic.AtomicInteger keyIndex = new java.util.concurrent.atomic.AtomicInteger(0);

    public AiService(AiUsageRepository aiUsageRepository) {
        this.aiUsageRepository = aiUsageRepository;
    }

    private List<String> getApiKeys() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(apiKey.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private String getNextApiKey(List<String> keys) {
        if (keys.isEmpty()) return null;
        int index = Math.abs(keyIndex.getAndIncrement() % keys.size());
        return keys.get(index);
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

        List<String> keys = getApiKeys();
        int numKeys = Math.max(1, keys.size());
        int limit = numKeys * 1500; // 1500 RPD limit per key
        int used = usage.getTotalCalls();
        int remaining = Math.max(0, limit - used);

        Map<String, Object> stats = new HashMap<>();
        stats.put("used", used);
        stats.put("success", usage.getSuccessCalls());
        stats.put("fail", usage.getFailCalls());
        stats.put("limit", limit);
        stats.put("remaining", remaining);
        stats.put("rpmLimit", numKeys * 15);
        stats.put("isKeyConfigured", !keys.isEmpty());
        stats.put("configuredKeysCount", keys.size());
        return stats;
    }

    public String formatDataForImport(String rawData, String type) throws Exception {
        try {
            List<String> keys = getApiKeys();
            if (keys.isEmpty()) {
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
            List<String> keys = getApiKeys();
            if (keys.isEmpty()) {
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
            System.err.println("Gemini Error: " + e.getMessage());
            String safeError = e.getMessage() != null ? e.getMessage().replace("\"", "'").replace("\n", " ") : "Unknown Error";
            return String.format("{\"reading\": \"[Lỗi AI]\", \"meaning\": \"Server AI từ chối: %s\", \"example\": \"\", \"exampleMeaning\": \"\"}", safeError);
        }
    }

    public String generateGrammarDetails(String structure) throws Exception {
        try {
            List<String> keys = getApiKeys();
            if (keys.isEmpty()) {
                recordAiUsage(true);
                return "{\"meaning\": \"[Không có API Key]\", \"explanation\": \"\", \"exampleSentence\": \"\", \"exampleMeaning\": \"\"}";
            }
            String prompt = "You are a professional Japanese teacher. For the Japanese grammar structure provided, " +
                    "generate its Vietnamese meaning, a brief explanation of how to use it in Vietnamese, a natural Japanese example sentence, and the Vietnamese translation of that example sentence. " +
                    "Return the response strictly as a JSON object with the following keys:\n" +
                    "{\n" +
                    "  \"meaning\": \"(Vietnamese meaning)\",\n" +
                    "  \"explanation\": \"(Vietnamese explanation of usage)\",\n" +
                    "  \"exampleSentence\": \"(natural Japanese example sentence)\",\n" +
                    "  \"exampleMeaning\": \"(Vietnamese translation of the example sentence)\"\n" +
                    "}\n" +
                    "Do not include any formatting, markdown, or other text except the clean JSON object.\n" +
                    "Structure: " + structure;
            String res = callGemini(prompt);
            recordAiUsage(true);
            return res;
        } catch (Exception e) {
            recordAiUsage(false);
            System.err.println("Gemini Error: " + e.getMessage());
            String safeError = e.getMessage() != null ? e.getMessage().replace("\"", "'").replace("\n", " ") : "Unknown Error";
            return String.format("{\"meaning\": \"[Lỗi AI]\", \"explanation\": \"Server AI từ chối: %s\", \"exampleSentence\": \"\", \"exampleMeaning\": \"\"}", safeError);
        }
    }

    public String generateKanjiDetails(String character) throws Exception {
        try {
            List<String> keys = getApiKeys();
            if (keys.isEmpty()) {
                recordAiUsage(true);
                return "{\"hanviet\": \"[Không có API Key]\", \"meaning\": \"\", \"onyomi\": \"\", \"kunyomi\": \"\"}";
            }
            String prompt = "You are a professional Japanese Kanji dictionary. For the provided Japanese Kanji character, " +
                    "generate its Sino-Vietnamese reading (Âm Hán Việt), Vietnamese meaning, Onyomi (in Katakana), and Kunyomi (in Hiragana). " +
                    "Return the response strictly as a JSON object with the following keys:\n" +
                    "{\n" +
                    "  \"hanviet\": \"(Sino-Vietnamese reading)\",\n" +
                    "  \"meaning\": \"(Vietnamese meaning)\",\n" +
                    "  \"onyomi\": \"(Onyomi in Katakana)\",\n" +
                    "  \"kunyomi\": \"(Kunyomi in Hiragana)\"\n" +
                    "}\n" +
                    "Do not include any formatting, markdown, or other text except the clean JSON object.\n" +
                    "Kanji: " + character;
            String res = callGemini(prompt);
            recordAiUsage(true);
            return res;
        } catch (Exception e) {
            recordAiUsage(false);
            System.err.println("Gemini Error: " + e.getMessage());
            String safeError = e.getMessage() != null ? e.getMessage().replace("\"", "'").replace("\n", " ") : "Unknown Error";
            return String.format("{\"hanviet\": \"[Lỗi AI]\", \"meaning\": \"Server AI từ chối: %s\", \"onyomi\": \"\", \"kunyomi\": \"\"}", safeError);
        }
    }

    private String buildPrompt(String rawData, String type) {
        String schema;
        String typeUpper = type != null ? type.toUpperCase() : "";

        if (typeUpper.contains("KANJI")) {
            schema = "[{\"character\": \"...\", \"kunyomi\": \"...\", \"onyomi\": \"...\", \"hanviet\": \"...\", \"meaning\": \"...\", \"examples\": \"...\", \"week\": null, \"day\": null, \"page\": null}]";
        } else if (typeUpper.contains("GRAMMAR")) {
            schema = "[{\"structure\": \"...\", \"meaning\": \"...\", \"explanation\": \"...\", \"exampleSentence\": \"...\", \"exampleMeaning\": \"...\", \"level\": \"N3\", \"week\": null, \"day\": null}]";
        } else {
            schema = "[{\"word\": \"...\", \"reading\": \"...\", \"meaning\": \"...\", \"example\": \"...\", \"exampleMeaning\": \"...\", \"week\": null, \"day\": null, \"page\": null}]";
        }

        return "You are a professional Japanese data formatter. Convert the following messy data into a valid JSON array strictly following this schema: " + schema + 
               ". \n\nInput data:\n" + rawData + 
               "\n\nRules:\n" +
               "1. Return ONLY the JSON array. No other text.\n" +
               "2. Ensure all fields are present. Use null for numeric fields (week, day, page) and empty strings for text fields if information is missing.\n" +
               "3. For Kanji, separate kunyomi and onyomi correctly if possible. If only one reading is provided, try to identify if it is Kun or On. If the Vietnamese meaning (\"meaning\") is missing, translate the Kanji's meaning into Vietnamese.\n" +
               "4. For Vocabulary, if the Vietnamese meaning (\"meaning\") of the word/phrase is missing or empty, you MUST translate and populate the meaning in Vietnamese.\n" +
               "5. For Vocabulary/Grammar, if the Japanese example sentence (\"example\" or \"exampleSentence\") or its Vietnamese translation (\"exampleMeaning\") is missing, you MUST generate a natural, beginner-friendly Japanese example sentence containing that word/structure and translate it correctly into Vietnamese for \"exampleMeaning\".\n" +
               "6. For Grammar, if explanation is missing, provide a short, clear explanation in Vietnamese about how to use the structure.\n" +
               "7. For Kanji, the \"examples\" field MUST contain 3-5 high-quality vocabulary entries. Each entry MUST follow this exact format: \"Word (Reading): Vietnamese meaning\". Separate each entry with a semicolon (;). Example: \"地形 (ちけい): địa hình; 形成 (けいせい): hình thành;\".\n" +
               "8. Ensure the JSON is valid, properly escaped, and encoded in UTF-8.";
    }

    private String callGemini(String prompt) throws Exception {
        List<String> keys = getApiKeys();
        if (keys.isEmpty()) {
            throw new Exception("No Gemini API keys configured");
        }

        // Use modern 2026 models based on the user's available quota
        // Automatically fallback to 2.5 Flash when 3 Flash hits the 20/day limit
        List<String> modelPriority = List.of("gemini-3-flash", "gemini-2.5-flash", "gemini-2-flash");
        
        int maxRetries = keys.size();
        Exception lastException = null;

        for (int i = 0; i < maxRetries; i++) {
            String activeKey = getNextApiKey(keys);
            
            for (String model : modelPriority) {
                try {
                    return executeGeminiCall(prompt, activeKey, model);
                } catch (Exception e) {
                    System.err.println("AI Error with model " + model + ": " + e.getMessage());
                    lastException = e;
                    // Fallback to next model or next key if possible
                    continue; 
                }
            }
        }

        System.err.println("CRITICAL: All AI models and keys exhausted. Last error: " + (lastException != null ? lastException.getMessage() : "Unknown"));
        throw new Exception("Dịch vụ AI hiện không khả dụng. Vui lòng kiểm tra API Key hoặc hạn mức. Lỗi: " + (lastException != null ? lastException.getMessage() : "Unknown"));
    }

    private String executeGeminiCall(String prompt, String activeKey, String model) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (activeKey != null && !activeKey.isEmpty()) {
            headers.set("x-goog-api-key", activeKey);
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
        throw new Exception("HTTP Error: " + response.getStatusCode());
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

    public String generateChatResponse(String scenario, List<Map<String, String>> history, String userMessage) throws Exception {
        StringBuilder historyPrompt = new StringBuilder();
        if (history != null && !history.isEmpty()) {
            // Keep only last 6 messages to keep tokens low!
            int start = Math.max(0, history.size() - 6);
            for (int i = start; i < history.size(); i++) {
                Map<String, String> msg = history.get(i);
                String sender = "ai".equals(msg.get("sender")) ? "Japanese Speaker" : "Student";
                historyPrompt.append(sender).append(": ").append(msg.get("text")).append("\n");
            }
        }

        String scenarioInstructions = "";
        if ("casual_friend".equalsIgnoreCase(scenario)) {
            scenarioInstructions = "You are 'Kenji', a close Japanese friend chatting casually and warmly. Use casual conversational Japanese (Kougotai, short-forms, friendly sentence-ending particles like ね, よ, dative contractions like ちゃう, てる). Avoid overly textbook polite form (desu/masu) unless context demands it.";
        } else if ("ramen_shop".equalsIgnoreCase(scenario)) {
            scenarioInstructions = "You are the staff member ('Tenin') at a busy Ramen shop in Tokyo. Use polite service speech (Keigo, or polite desu/masu). Prompt the customer natural service questions (e.g., noodle hardness, toppings, payment).";
        } else if ("hotel_reception".equalsIgnoreCase(scenario)) {
            scenarioInstructions = "You are the professional receptionist at a hotel in Kyoto. Use highly polite hospitality speech (Keigo, Kenjougo/Sonkeigo). Help the guest with checking in, checking out, or requesting services.";
        } else if ("asking_directions".equalsIgnoreCase(scenario)) {
            scenarioInstructions = "You are a helpful passerby in Shibuya. Use polite but friendly everyday speech (desu/masu). Give simple, friendly directions to nearby stations or cafes.";
        } else if ("parttime_interview".equalsIgnoreCase(scenario)) {
            scenarioInstructions = "You are the interviewer/manager at a convenience store hiring for a part-time job. Use formal interview speech (polite desu/masu). Ask the applicant natural questions about their shifts, Japanese level, and experience.";
        } else {
            scenarioInstructions = "You are a friendly Japanese conversational partner. Use natural, everyday conversational Japanese.";
        }

        String prompt = "You are an expert Japanese speech tutor and conversationalist.\n" +
                "Roleplay Setting:\n" + scenarioInstructions + "\n\n" +
                "Conversation History:\n" + historyPrompt.toString() +
                "Student just said: " + userMessage + "\n\n" +
                "Your task:\n" +
                "1. Analyze the Student's latest message. Check for spelling, grammar (e.g., incorrect particles), and naturalness in everyday conversational Japanese.\n" +
                "2. Generate a natural reply in Japanese matching your Roleplay Setting.\n" +
                "3. Provide 3 short, natural Japanese conversational suggestions the Student could use next to continue the chat.\n\n" +
                "You MUST return your response strictly as a JSON object following this exact schema:\n" +
                "{\n" +
                "  \"reply\": \"(your next natural Japanese reply, including kanji/kana)\",\n" +
                "  \"romaji\": \"(romaji pronunciation of your reply)\",\n" +
                "  \"translation\": \"(Vietnamese translation of your reply)\",\n" +
                "  \"feedback\": \"(gentle Vietnamese feedback checking the student's spelling, grammar, and naturalness. If they made mistakes, show the correct way. If perfect, compliment them warmly.)\",\n" +
                "  \"suggestions\": [\n" +
                "    {\"text\": \"(natural option 1 the student could say next in Japanese)\", \"translation\": \"(Vietnamese translation of option 1)\"},\n" +
                "    {\"text\": \"(natural option 2 the student could say next in Japanese)\", \"translation\": \"(Vietnamese translation of option 2)\"},\n" +
                "    {\"text\": \"(natural option 3 the student could say next in Japanese)\", \"translation\": \"(Vietnamese translation of option 3)\"}\n" +
                "  ]\n" +
                "}\n" +
                "Return ONLY the raw, clean JSON object. No markdown code blocks, no intro, and no extra characters.";

        String res = callGemini(prompt);
        recordAiUsage(true);
        return res;
    }
}
