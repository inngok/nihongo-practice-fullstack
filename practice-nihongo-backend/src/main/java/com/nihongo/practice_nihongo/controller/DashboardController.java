package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.repository.*;
import com.nihongo.practice_nihongo.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final BookRepository bookRepository;
    private final KanjiRepository kanjiRepository;
    private final VocabRepository vocabRepository;
    private final GrammarRepository grammarRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    public DashboardController(BookRepository bookRepository,
                               KanjiRepository kanjiRepository,
                               VocabRepository vocabRepository,
                               GrammarRepository grammarRepository,
                               UserRepository userRepository,
                               AiService aiService) {
        this.bookRepository = bookRepository;
        this.kanjiRepository = kanjiRepository;
        this.vocabRepository = vocabRepository;
        this.grammarRepository = grammarRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("booksCount", bookRepository.count());
        stats.put("kanjisCount", kanjiRepository.count());
        stats.put("vocabsCount", vocabRepository.count());
        stats.put("grammarCount", grammarRepository.count());
        stats.put("usersCount", userRepository.count());
        stats.put("aiUsage", aiService.getAiUsageStats());
        return ResponseEntity.ok(stats);
    }
}
