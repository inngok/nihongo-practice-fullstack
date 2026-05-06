package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.Flashcard;
import com.nihongo.practice_nihongo.model.User;
import com.nihongo.practice_nihongo.repository.UserRepository;
import com.nihongo.practice_nihongo.service.FlashcardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flashcards")
@CrossOrigin(origins = "*")
@Tag(name = "Flashcard Management")
public class FlashcardController {

    private final FlashcardService flashcardService;
    private final UserRepository userRepository;

    public FlashcardController(FlashcardService flashcardService, UserRepository userRepository) {
        this.flashcardService = flashcardService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return userRepository.findByEmail(authentication.getName()).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Flashcard>> getAllFlashcards() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(flashcardService.getAllFlashcards(user.getId()));
    }

    @GetMapping("/due")
    public ResponseEntity<List<Flashcard>> getDueFlashcards() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(flashcardService.getDueFlashcards(user.getId()));
    }

    @GetMapping("/due/count")
    public ResponseEntity<Map<String, Long>> getDueCount() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        long count = flashcardService.getDueCount(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping
    public ResponseEntity<Flashcard> addToFlashcards(
            @RequestParam(required = false) Long vocabId,
            @RequestParam(required = false) Long kanjiId) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            Flashcard flashcard = flashcardService.addToFlashcards(user.getId(), vocabId, kanjiId);
            return ResponseEntity.ok(flashcard);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<Flashcard> reviewCard(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> payload) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        Integer rating = payload.get("rating");
        if (rating == null || rating < 1 || rating > 4) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Flashcard updated = flashcardService.reviewCard(id, rating);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlashcard(@PathVariable Long id) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            flashcardService.deleteFlashcard(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
