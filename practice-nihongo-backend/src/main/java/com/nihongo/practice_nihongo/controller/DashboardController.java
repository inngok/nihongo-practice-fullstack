package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.repository.*;
import com.nihongo.practice_nihongo.service.AiService;
import com.nihongo.practice_nihongo.model.PageVisit;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
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
    private final PageVisitRepository pageVisitRepository;
    private final AiService aiService;

    public DashboardController(BookRepository bookRepository,
                               KanjiRepository kanjiRepository,
                               VocabRepository vocabRepository,
                               GrammarRepository grammarRepository,
                               UserRepository userRepository,
                               PageVisitRepository pageVisitRepository,
                               AiService aiService) {
        this.bookRepository = bookRepository;
        this.kanjiRepository = kanjiRepository;
        this.vocabRepository = vocabRepository;
        this.grammarRepository = grammarRepository;
        this.userRepository = userRepository;
        this.pageVisitRepository = pageVisitRepository;
        this.aiService = aiService;
    }

    @PostMapping("/visits")
    public ResponseEntity<Void> recordVisit() {
        LocalDate today = LocalDate.now();
        PageVisit todayVisit = pageVisitRepository.findByVisitDate(today)
                .orElseGet(() -> new PageVisit(today));
        todayVisit.setVisitCount(todayVisit.getVisitCount() + 1);
        pageVisitRepository.save(todayVisit);
        return ResponseEntity.ok().build();
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

        Long totalVisits = pageVisitRepository.sumAllVisits();
        stats.put("totalVisits", totalVisits != null ? totalVisits : 0);

        PageVisit todayVisit = pageVisitRepository.findByVisitDate(LocalDate.now()).orElse(null);
        stats.put("todayVisits", todayVisit != null ? todayVisit.getVisitCount() : 0);

        return ResponseEntity.ok(stats);
    }
}
