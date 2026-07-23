package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.AiUsage;
import com.nihongo.practice_nihongo.repository.AiUsageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.time.LocalDate;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

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
            log.error("Error saving AI usage stats to database: " + e.getMessage());
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
                    "generate its reading, Sino-Vietnamese reading (Âm Hán Việt), Vietnamese meaning, a natural Japanese example sentence, and the Vietnamese translation of that example sentence. " +
                    "Return the response strictly as a JSON object with the following keys:\n" +
                    "{\n" +
                    "  \"reading\": \"(only hiragana/katakana representation, no kanji, no spaces)\",\n" +
                    "  \"hanviet\": \"(Sino-Vietnamese reading, e.g. HỌC SINH. Leave empty if no kanji)\",\n" +
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
            log.error("Gemini Error: " + e.getMessage());
            String safeError = e.getMessage() != null ? e.getMessage().replace("\"", "'").replace("\n", " ") : "Unknown Error";
            return String.format("{\"reading\": \"[Lỗi AI]\", \"meaning\": \"Server AI từ chối: %s\", \"example\": \"\", \"exampleMeaning\": \"\"}", safeError);
        }
    }

    public String extractHanvietBulk(List<String> words) throws Exception {
        try {
            List<String> keys = getApiKeys();
            if (keys.isEmpty()) {
                recordAiUsage(true);
                return "{}";
            }
            
            String wordsList = String.join(", ", words);
            String prompt = "You are a Japanese linguistics expert. I will give you a list of Japanese words. " +
                    "For each word, extract ONLY the Sino-Vietnamese reading (Âm Hán Việt) of its Kanji characters. " +
                    "If a word has no Kanji (only Hiragana/Katakana), return an empty string for it. " +
                    "Return the response strictly as a JSON object where the keys are the exact Japanese words and the values are their Sino-Vietnamese readings.\n" +
                    "Example:\n" +
                    "{\n" +
                    "  \"学生\": \"HỌC SINH\",\n" +
                    "  \"食べる\": \"THỰC\",\n" +
                    "  \"りんご\": \"\"\n" +
                    "}\n" +
                    "Do not include any formatting, markdown, or other text except the clean JSON object.\n" +
                    "Words to process: " + wordsList;
            String res = callGemini(prompt);
            recordAiUsage(true);
            return res;
        } catch (Exception e) {
            recordAiUsage(false);
            log.error("Gemini Error bulk hanviet: " + e.getMessage());
            return "{}";
        }
    }

    public String generateGrammarDetails(String structure, String existingSentence) throws Exception {
        try {
            List<String> keys = getApiKeys();
            if (keys.isEmpty()) {
                recordAiUsage(true);
                return "{\"meaning\": \"[Không có API Key]\", \"explanation\": \"\", \"exampleSentence\": \"\", \"exampleMeaning\": \"\", \"quizSentence\": \"\"}";
            }
            
            String existingPrompt = "";
            if (existingSentence != null && !existingSentence.trim().isEmpty()) {
                existingPrompt = "\nIMPORTANT EXISTING SENTENCES:\nThe user already has the following example sentences:\n" + existingSentence + 
                                 "\n\nCRITICAL INSTRUCTION: You MUST KEEP these existing sentences exactly as they are in your output 'exampleSentence'. You MUST also append AT LEAST ONE NEW natural Japanese example sentence showing a different context or nuance. Separate multiple sentences using \\n.\n";
            }
            
            String prompt = "You are a professional Japanese teacher and linguistics expert. For the Japanese grammar structure provided, " +
                    "generate its Vietnamese meaning, a precise, highly accurate, concise, and academically correct explanation of its usage, nuances, and context in Vietnamese, a natural Japanese example sentence, and the Vietnamese translation of that example sentence. The explanation MUST be EXTREMELY short, strictly maximum 2 sentences, straight to the point, clear, and easy to understand without any unnecessary fluff or long-winded context. " +
                    "IMPORTANT: If the grammar structure contains multiple synonymous patterns separated by slashes (/) or dots (・) (e.g. 〜ものですから / 〜ものだから / 〜もので), you MUST provide AT LEAST ONE example sentence for EACH pattern. Additionally, if it has multiple usage forms (e.g., Verb vs Noun), cover them as well. Separate the multiple Japanese sentences in 'exampleSentence' using a newline character (\\n), and separate their corresponding Vietnamese translations in 'exampleMeaning' using a newline character (\\n)." +
                    existingPrompt +
                    "\nReturn the response strictly as a JSON object with the following keys:\n" +
                    "{\n" +
                    "  \"meaning\": \"(Vietnamese meaning)\",\n" +
                    "  \"explanation\": \"(CRITICAL: Put the conjugation formula exactly starting with 'Cấu trúc: \\n'. MUST ALWAYS format the formula using this exact custom block syntax: \\n[[\\nVる / Vた\\nAい\\nAな (+な)\\nN (+だ)\\n||\\n+ わけではない\\n]]\\nThe left side (before ||) MUST list the word types separated by newlines. The right side (after ||) MUST be the grammar suffix. YOU MUST ALWAYS use this [[ left || right ]] block format, even if there is only one word type on the left. The grammar suffix MUST be placed INSIDE the block after ||, NOT outside. MUST use Japanese terminology (e.g., V普通形, Aい, Aな, N). Then add an extra newline \\n, and write the explanation starting with 'Giải thích: '. KEEP THE EXPLANATION EXTREMELY SHORT, MAXIMUM 2 SENTENCES!)\",\n" +
                    "  \"exampleSentence\": \"(natural Japanese example sentence(s), separated by \\n if multiple)\",\n" +
                    "  \"exampleMeaning\": \"(Vietnamese translation(s) of the example sentence(s), separated by \\n if multiple)\",\n" +
                    "  \"quizSentence\": \"(Create a natural fill-in-the-blank version of the exampleSentence. CRITICAL RULE: You must replace the ENTIRE logical grammatical chunk (including the conjugated verb/noun/adjective that attaches to the grammar point) with exactly ONE '_____'. Do NOT arbitrarily cut the word in half! For example, if the structure is '〜てから' and the sentence is 'ご飯を食べてから寝ます', the quizSentence MUST be 'ご飯を_____寝ます' (missing text: 食べてから). If the structure is 'ご〜いたします' and the sentence is '私がご案内いたします', the quizSentence MUST be '私が_____' (missing text: ご案内いたします). ABSOLUTE REQUIREMENT: The rest of the sentence (before and after '_____') MUST EXACTLY MATCH the original exampleSentence character-by-character, so that the exact missing string can be algorithmically extracted. Separate multiple sentences by \\n.)\"\n" +
                    "}\n" +
                    "CRITICAL RULE: DO NOT use any markdown formatting (like **bold**, *italics*), tables, or horizontal lines/separators (like ---, |||) inside any of the JSON values. Provide ONLY pure text.\n" +
                    "Do not include any formatting, markdown, or other text except the clean JSON object.\n" +
                    "Structure: " + structure;
            String res = callGemini(prompt);
            recordAiUsage(true);
            return res;
        } catch (Exception e) {
            recordAiUsage(false);
            log.error("Gemini Error: " + e.getMessage());
            String safeError = e.getMessage() != null ? e.getMessage().replace("\"", "'").replace("\n", " ") : "Unknown Error";
            return String.format("{\"meaning\": \"[Lỗi AI]\", \"explanation\": \"Server AI từ chối: %s\", \"exampleSentence\": \"\", \"exampleMeaning\": \"\", \"quizSentence\": \"\"}", safeError);
        }
    }

    public String extractVocabularyFromNews(String text) throws Exception {
        try {
            List<String> keys = getApiKeys();
            if (keys.isEmpty()) {
                recordAiUsage(true);
                return "[{\"word\": \"[Lỗi]\", \"reading\": \"\", \"meaning\": \"Chưa cấu hình API Key cho tính năng AI\"}]";
            }
            String prompt = "You are a Japanese teacher. Read the following Japanese news article and extract 5 to 10 important vocabulary words (especially JLPT N4, N3, N2 level words). " +
                    "For each word, provide its reading in Hiragana/Katakana and its meaning in Vietnamese. " +
                    "Return the response strictly as a JSON array of objects with the following keys:\n" +
                    "[\n" +
                    "  {\n" +
                    "    \"word\": \"(the word in Kanji or Kana as it appears in the text)\",\n" +
                    "    \"reading\": \"(reading in Hiragana/Katakana)\",\n" +
                    "    \"meaning\": \"(Vietnamese meaning)\"\n" +
                    "  }\n" +
                    "]\n" +
                    "Do not include any formatting, markdown, or other text except the clean JSON array.\n" +
                    "Article Text:\n" + text;
            String res = callGemini(prompt);
            recordAiUsage(true);
            return res;
        } catch (Exception e) {
            recordAiUsage(false);
            log.error("Gemini Error: " + e.getMessage());
            return "[]";
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

    public String generateContent(String prompt, int maxTokens) throws Exception {
        try {
            List<String> keys = getApiKeys();
            if (keys.isEmpty()) {
                recordAiUsage(true);
                return "[Không có API Key cho dịch thuật]";
            }
            String res = callGemini(prompt);
            recordAiUsage(true);
            return res;
        } catch (Exception e) {
            recordAiUsage(false);
            log.error("Gemini Error generating content: " + e.getMessage());
            throw e;
        }
    }

    private String buildPrompt(String rawData, String type) {
        String schema;
        String typeUpper = type != null ? type.toUpperCase() : "";

        if (typeUpper.contains("KANJI")) {
            schema = "[{\"character\": \"...\", \"kunyomi\": \"...\", \"onyomi\": \"...\", \"hanviet\": \"...\", \"meaning\": \"...\", \"examples\": \"...\", \"week\": null, \"day\": null, \"page\": null}]";
        } else if (typeUpper.contains("GRAMMAR")) {
            schema = "[{\"structure\": \"...\", \"meaning\": \"...\", \"explanation\": \"...\", \"exampleSentence\": \"...\", \"exampleMeaning\": \"...\", \"quizSentence\": \"...\", \"level\": null, \"week\": null, \"day\": null}]";
        } else {
            schema = "[{\"word\": \"...\", \"reading\": \"...\", \"hanviet\": \"...\", \"meaning\": \"...\", \"example\": \"...\", \"exampleMeaning\": \"...\", \"week\": null, \"day\": null, \"page\": null}]";
        }

        return "You are a professional Japanese data formatter and linguistics expert. Convert the following messy data into a valid JSON array strictly following this schema: " + schema +
               ". \n\nInput data:\n" + rawData +
               "\n\nRules:\n" +
               "1. Return ONLY the JSON array. No other text.\n" +
               "2. Ensure all fields are present. Use null for numeric fields (week, day, page) and empty strings for text fields if information is missing.\n" +
               "3. For Kanji, separate kunyomi and onyomi correctly if possible. If only one reading is provided, try to identify if it is Kun or On. If the Vietnamese meaning (\"meaning\") is missing, translate the Kanji's meaning into Vietnamese.\n" +
               "4. For Vocabulary, if the Vietnamese meaning (\"meaning\") of the word/phrase is missing or empty, you MUST translate and populate the meaning in Vietnamese. Also, MUST extract the Sino-Vietnamese reading (Âm Hán Việt) of the Kanji characters in the word and put it in \"hanviet\" (e.g. \"HỌC SINH\"). If the word has no Kanji, leave \"hanviet\" empty.\n" +
               "5. For Vocabulary/Grammar, if the Japanese example sentence (\"example\" or \"exampleSentence\") or its Vietnamese translation (\"exampleMeaning\") is missing, you MUST generate a natural, beginner-friendly Japanese example sentence containing that word/structure and translate it correctly into Vietnamese for \"exampleMeaning\". For Grammar specifically, if the structure contains multiple synonymous patterns separated by slashes (/) or dots (・) (e.g. 〜ものですから / 〜ものだから / 〜もので), you MUST provide AT LEAST ONE example sentence for EACH pattern. If it has multiple usage forms, cover them as well. Join multiple sentences using \\n.\n" +
               "6. For Grammar, the \"quizSentence\" MUST be a natural fill-in-the-blank version of the \"exampleSentence\". CRITICAL RULE: You must replace the ENTIRE logical grammatical chunk (including the conjugated verb/noun/adjective that attaches to the grammar point) with exactly ONE '_____'. Do NOT arbitrarily cut the word in half! For example, if the structure is '〜てから' and the sentence is 'ご飯を食べてから寝ます', the quizSentence MUST be 'ご飯を_____寝ます' (missing text: 食べてから). ABSOLUTE REQUIREMENT: The rest of the sentence (before and after '_____') MUST EXACTLY MATCH the original exampleSentence character-by-character, so that the missing string can be perfectly extracted.\n" +
               "7. For Grammar, if explanation is missing, provide a precise, highly accurate, and academically correct explanation in Vietnamese detailing its nuances, context, and usage. The explanation MUST be EXTREMELY short, strictly maximum 2 sentences, straight to the point, clear, and easy to understand without any unnecessary fluff or long-winded context.\n" +
               "8. For Kanji, the \"examples\" field MUST contain 3-5 high-quality vocabulary entries. Each entry MUST follow this exact format: \"Word (Reading): Vietnamese meaning\". Separate each entry with a semicolon (;). Example: \"地形 (ちけい): địa hình; 形成 (けいせい): hình thành;\".\n" +
               "9. CRITICAL FOR GRAMMAR: The \"structure\" field MUST ONLY contain the Japanese grammar point using a tilde '〜' (e.g. '〜に囲まれている', '〜を占める'). DO NOT include conjugation formulas (like 'N +' or 'V-ru +') in the \"structure\" field. All conjugation formulas MUST be placed at the very beginning of the \"explanation\" field, starting with 'Cấu trúc: \\n'. MUST ALWAYS format the formula using this exact custom block syntax: \\n[[\\nVる / Vた\\nAい\\nAな (+な)\\nN (+だ)\\n||\\n+ わけではない\\n]]\\nThe left side (before ||) MUST list the word types separated by newlines. The right side (after ||) MUST be the grammar suffix. YOU MUST ALWAYS use this [[ left || right ]] block format, even if there is only one word type on the left. The grammar suffix MUST be placed INSIDE the block after ||, NOT outside. You MUST use Japanese terminology (e.g., V普通形, Aい, Aな, N). Then, YOU MUST insert an extra newline character (\\n), and start the actual usage explanation with 'Giải thích: '. KEEP THE EXPLANATION EXTREMELY SHORT, MAXIMUM 2 SENTENCES!\n" +
               "10. Ensure the JSON is valid, properly escaped, and encoded in UTF-8.\n" +
               "11. ABSOLUTE CRITICAL RULE: You MUST process and extract EVERY SINGLE item from the input data. DO NOT omit, summarize, combine, or skip ANY items under ANY circumstances. If the input has 150 lines/items, you MUST output exactly 150 objects. Your primary duty is to ensure 100% data retention. Missing even a single item is a strict violation.\n" +
               "12. CRITICAL FOR KANJI - PRESERVE USER VOCABULARY: If the input data already lists vocabulary words for a Kanji (in any format such as '会談 (Hội Đàm) - かいだん: hội đàm', '面談 - めんだん: meeting', '体験談: câu chuyện kinh nghiệm'), you MUST parse ALL of those entries and include them verbatim in the \"examples\" field. Format each as: \"Word (Reading): Meaning\". Example input '会談 (Hội Đàm) - かいだん: hội đàm. 面談 - めんだん: gặp mặt trao đổi' => examples field: \"会談 (かいだん): hội đàm; 面談 (めんだん): gặp mặt trao đổi;\". DO NOT discard, ignore, or replace any user-provided vocabulary.\n" +
               "13. KANJI EXAMPLES PRIORITY: Always place user-provided vocabulary FIRST in the \"examples\" field. Only add AI-generated supplementary entries AFTER the user-provided ones if the total is still less than 3 entries. Never produce fewer example entries than what the user explicitly listed in their input.\n" +
               "14. KNOWLEDGE CORRECTION RULE: You are an expert. If the user provides INCORRECT knowledge (e.g. wrong meaning, wrong grammar usage, or wrong reading), you MUST CORRECT it to be academically accurate. DO NOT blindly copy incorrect information into the output.\n" +
               "15. STRICT NO-MARKDOWN RULE: DO NOT use any markdown formatting (like **bold**, *italics*), tables, or horizontal lines/separators (like ---, |||) inside any of the JSON values. Provide ONLY pure plain text.\n" +
               "16. SPLIT MULTIPLE ITEMS: If a single string, line, or row contains MULTIPLE distinct vocabulary words (e.g. '17 締め切った 20 ぞろぞろ' or '食べる ăn 飲む uống'), you MUST split them into SEPARATE JSON objects. DO NOT combine them into a single 'word' field. Identify distinct items based on numbers, spacing, or alternating languages.";
    }

    private String callGemini(String prompt) throws Exception {
        List<String> keys = getApiKeys();
        if (keys.isEmpty()) {
            throw new Exception("No Gemini API keys configured");
        }

        List<String> modelPriority = List.of("gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-2.5-flash", "gemini-3-flash");
        
        int maxRetries = keys.size();
        Exception lastException = null;

        for (int i = 0; i < maxRetries; i++) {
            String activeKey = getNextApiKey(keys);
            
            for (String model : modelPriority) {
                try {
                    return executeGeminiCall(prompt, activeKey, model);
                } catch (Exception e) {
                    log.error("AI Error with model " + model + ": " + e.getMessage());
                    lastException = e;
                    // Fallback to next model or next key if possible
                    continue; 
                }
            }
        }

        log.error("CRITICAL: All AI models and keys exhausted. Last error: " + (lastException != null ? lastException.getMessage() : "Unknown"));
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
        headers.setContentType(new MediaType("application", "json", java.nio.charset.StandardCharsets.UTF_8));
        headers.setAcceptCharset(List.of(java.nio.charset.StandardCharsets.UTF_8));
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
                
                // Clean markdown code blocks and extract only the JSON part
                text = text.replaceAll("```json", "").replaceAll("```", "").trim();
                int startObj = text.indexOf("{");
                int endObj = text.lastIndexOf("}");
                int startArr = text.indexOf("[");
                int endArr = text.lastIndexOf("]");
                
                // Check if it's an object or an array
                if (startObj != -1 && endObj != -1 && (startArr == -1 || startObj < startArr)) {
                    return text.substring(startObj, endObj + 1);
                } else if (startArr != -1 && endArr != -1) {
                    return text.substring(startArr, endArr + 1);
                }
                
                return text;
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

    public String generateGrammarAssistantResponse(List<Map<String, String>> history, String userMessage) throws Exception {
        StringBuilder historyPrompt = new StringBuilder();
        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - 6);
            for (int i = start; i < history.size(); i++) {
                Map<String, String> msg = history.get(i);
                String sender = "ai".equals(msg.get("sender")) ? "AI" : "User";
                historyPrompt.append(sender).append(": ").append(msg.get("text")).append("\n");
            }
        }

        String prompt = "You are a friendly and expert Japanese grammar assistant. Your task is to explain Japanese grammar to a Vietnamese student.\n" +
                "The explanation must be in Vietnamese, simple, easy to understand, short, and must include Japanese example sentences with Vietnamese translations.\n" +
                "Conversation History:\n" + historyPrompt.toString() +
                "Student just asked: " + userMessage + "\n\n" +
                "Respond directly with your explanation in Markdown format. Do not use JSON. Just plain Markdown text.";

        String res = callGemini(prompt);
        recordAiUsage(true);
        return res;
    }

    public String generateChatResponse(String scenario, List<Map<String, String>> history, String userMessage) throws Exception {
        StringBuilder historyPrompt = new StringBuilder();
        if (history != null && !history.isEmpty()) {
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

    public String explainConfusingGrammar(String groupTitle, String itemsJson) throws Exception {
        try {
            List<String> keys = getApiKeys();
            if (keys.isEmpty()) {
                recordAiUsage(true);
                return "{\"explanation\": \"Chưa cấu hình API Key để kích hoạt tính năng giải thích AI.\", \"tip\": \"Vui lòng cấu hình API Key trong trang quản trị.\", \"examples\": []}";
            }
            
            String prompt = "You are a professional Japanese teacher. Explain the differences, nuances, and usage contexts of the following group of confusing Japanese grammar structures.\n" +
                    "Group: " + groupTitle + "\n" +
                    "Structures:\n" + itemsJson + "\n\n" +
                    "Your task:\n" +
                    "1. Provide a detailed, easy-to-understand explanation in Vietnamese contrasting these grammar points, explaining when to use which, and their specific nuances.\n" +
                    "2. Generate 1 natural Japanese example sentence for each grammar point to demonstrate the contrast. For each example, provide its Romaji, Hiragana reading, and Vietnamese translation.\n" +
                    "3. Highlight a key tip or common mistake in Vietnamese to help students avoid confusion.\n\n" +
                    "You MUST return the response strictly as a JSON object with the following keys:\n" +
                    "{\n" +
                    "  \"explanation\": \"(detailed comparison in Vietnamese, with clear paragraphs and bullet points if needed)\",\n" +
                    "  \"tip\": \"(key tip or common mistake in Vietnamese)\",\n" +
                    "  \"examples\": [\n" +
                    "    {\n" +
                    "      \"pattern\": \"(the grammar pattern, e.g. 〜てもいい)\",\n" +
                    "      \"sentence\": \"(natural Japanese example sentence)\",\n" +
                    "      \"romaji\": \"(Romaji translation)\",\n" +
                    "      \"translation\": \"(Vietnamese translation)\"\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n" +
                    "Do not include any formatting, markdown, or other text except the clean JSON object.";
            String res = callGemini(prompt);
            recordAiUsage(true);
            return res;
        } catch (Exception e) {
            recordAiUsage(false);
            log.error("AI Error explaining confusing grammar: " + e.getMessage());
            throw e;
        }
    }

    public String generateConfusingGrammarFromPatterns(String groupTitle, String groupDescription, List<String> patterns) throws Exception {
        try {
            List<String> keys = getApiKeys();
            if (keys.isEmpty()) {
                throw new Exception("No Gemini API keys configured");
            }
            
            String patternsStr = String.join(", ", patterns);
            String prompt = "You are a professional Japanese teacher. Create a comparative analysis for these patterns: " + patternsStr + ".\n" +
                    "Group Title: " + groupTitle + "\n" +
                    "Group Description: " + groupDescription + "\n\n" +
                    "CRITICAL RULES:\n" +
                    "- ALL Vietnamese text (explanation, tip, baseMeaning, nuance, exampleTranslation) MUST be written with full Vietnamese diacritical marks (dau tieng Viet day du). For example: 'Tự động từ', 'Trạng thái', 'Hành động', NOT 'Tu dong tu' or 'Trang thai'.\n" +
                    "- DO NOT use any emojis, icons, or decorative symbols (such as ✦, ■, ⚠️, ✨, etc.) in the 'explanation' or 'tip' fields. Use only pure text.\n" +
                    "- Each pattern must have its own separate item in the 'items' array.\n\n" +
                    "Return strictly JSON:\n" +
                    "{\n" +
                    "  \"explanation\": \"(pure text comparative explanation in Vietnamese)\",\n" +
                    "  \"tip\": \"(pure text memory tip in Vietnamese)\",\n" +
                    "  \"items\": [\n" +
                    "    {\n" +
                    "      \"pattern\": \"(the pattern, e.g. 〜てもいい)\",\n" +
                    "      \"baseMeaning\": \"(literal meaning in Vietnamese)\",\n" +
                    "      \"nuance\": \"(nuance tag in Vietnamese, e.g. ĐƯỢC PHÉP)\",\n" +
                    "      \"similarityPercentage\": (integer percentage, e.g. 80),\n" +
                    "      \"exampleSentence\": \"(single Japanese sentence)\",\n" +
                    "      \"exampleRomaji\": \"(Romaji)\",\n" +
                    "      \"exampleTranslation\": \"(Vietnamese translation)\"\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n" +
                    "Do not include any formatting or text outside the raw JSON.";
            String res = callGemini(prompt);
            recordAiUsage(true);
            return res;
        } catch (Exception e) {
            recordAiUsage(false);
            log.error("AI Error generating confusing grammar: " + e.getMessage());
            throw e;
        }
    }

    public String generateConfusingGrammarFromPrompt(String userPrompt) throws Exception {
        try {
            List<String> keys = getApiKeys();
            if (keys.isEmpty()) {
                throw new Exception("No Gemini API keys configured");
            }
            
            String prompt = "You are a professional Japanese teacher. Create a JSON response for a confusing grammar group based on this request: \"" + userPrompt + "\".\n\n" +
                    "CRITICAL RULES:\n" +
                    "- ALL Vietnamese text (title, description, explanation, tip, baseMeaning, nuance, exampleTranslation) MUST be written with full Vietnamese diacritical marks (dau tieng Viet day du). For example: 'Tự động từ', 'Trạng thái tự nhiên', NOT 'Tu dong tu' or 'Trang thai tu nhien'.\n" +
                    "- DO NOT use any emojis, icons, or decorative symbols (such as ✦, ■, ⚠️, ✨, etc.) in the 'explanation' or 'tip' fields. Use only pure text.\n" +
                    "- Treat each compared pattern/verb as a SEPARATE item in the 'items' array. Never combine them (e.g. create separate items for '開く (あく)' and '開ける (あける)').\n" +
                    "- 'similarityPercentage' must be 40-50% for opposing verbs like transitive/intransitive, not 100%.\n\n" +
                    "Return strictly JSON:\n" +
                    "{\n" +
                    "  \"title\": \"(descriptive title in Vietnamese)\",\n" +
                    "  \"description\": \"(concise description in Vietnamese)\",\n" +
                    "  \"explanation\": \"(pure text comparative explanation in Vietnamese)\",\n" +
                    "  \"tip\": \"(pure text memory tip in Vietnamese)\",\n" +
                    "  \"items\": [\n" +
                    "    {\n" +
                    "      \"pattern\": \"(the pattern, e.g. 開く (あく))\",\n" +
                    "      \"baseMeaning\": \"(literal meaning in Vietnamese)\",\n" +
                    "      \"nuance\": \"(concise nuance tag, e.g. TRẠNG THÁI TỰ NHIÊN)\",\n" +
                    "      \"similarityPercentage\": (integer 10-100),\n" +
                    "      \"exampleSentence\": \"(single Japanese sentence)\",\n" +
                    "      \"exampleRomaji\": \"(Romaji)\",\n" +
                    "      \"exampleTranslation\": \"(Vietnamese translation)\"\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n" +
                    "Do not include any formatting or text outside the raw JSON.";
            String res = callGemini(prompt);
            recordAiUsage(true);
            return res;
        } catch (Exception e) {
            recordAiUsage(false);
            log.error("AI Error generating confusing grammar from prompt: " + e.getMessage());
            throw e;
        }
    }
}
