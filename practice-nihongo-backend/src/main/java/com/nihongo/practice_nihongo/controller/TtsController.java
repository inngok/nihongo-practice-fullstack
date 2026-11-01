package com.nihongo.practice_nihongo.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/tts")
@CrossOrigin
public class TtsController {

    // Simple in-memory cache: text -> audio bytes (max 500 entries)
    private final Map<String, byte[]> cache = new ConcurrentHashMap<>();
    private static final int MAX_CACHE_SIZE = 500;

    @GetMapping
    public ResponseEntity<byte[]> getAudio(
            @RequestParam String text,
            @RequestParam(defaultValue = "ja") String lang) {

        if (text == null || text.isBlank() || text.length() > 200) {
            return ResponseEntity.badRequest().build();
        }

        String cacheKey = lang + ":" + text;

        byte[] audioData = cache.get(cacheKey);
        if (audioData != null) {
            return buildAudioResponse(audioData);
        }

        try {
            String encoded = URLEncoder.encode(text, StandardCharsets.UTF_8);
            String ttsUrl = "https://translate.google.com/translate_tts"
                    + "?ie=UTF-8&client=tw-ob&tl=" + lang + "&q=" + encoded;

            HttpURLConnection conn = (HttpURLConnection) new URL(ttsUrl).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(5000);

            int status = conn.getResponseCode();
            if (status != 200) {
                conn.disconnect();
                return ResponseEntity.status(502).build();
            }

            try (InputStream is = conn.getInputStream();
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                byte[] buf = new byte[4096];
                int n;
                while ((n = is.read(buf)) != -1) {
                    baos.write(buf, 0, n);
                }
                audioData = baos.toByteArray();
            }
            conn.disconnect();

            if (audioData.length < 100) {
                return ResponseEntity.status(502).build();
            }

            // Cache with eviction
            if (cache.size() >= MAX_CACHE_SIZE) {
                // Remove ~100 oldest entries
                cache.keySet().stream().limit(100).forEach(cache::remove);
            }
            cache.put(cacheKey, audioData);

            return buildAudioResponse(audioData);
        } catch (Exception e) {
            return ResponseEntity.status(502).build();
        }
    }

    private ResponseEntity<byte[]> buildAudioResponse(byte[] data) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("audio/mpeg"));
        headers.setContentLength(data.length);
        headers.setCacheControl(CacheControl.maxAge(java.time.Duration.ofDays(30)));
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
}
