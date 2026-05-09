package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.Flashcard;
import com.nihongo.practice_nihongo.model.Kanji;
import com.nihongo.practice_nihongo.model.User;
import com.nihongo.practice_nihongo.model.Vocab;
import com.nihongo.practice_nihongo.repository.FlashcardRepository;
import com.nihongo.practice_nihongo.repository.KanjiRepository;
import com.nihongo.practice_nihongo.repository.UserRepository;
import com.nihongo.practice_nihongo.repository.VocabRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final UserRepository userRepository;
    private final VocabRepository vocabRepository;
    private final KanjiRepository kanjiRepository;

    public FlashcardService(FlashcardRepository flashcardRepository,
                            UserRepository userRepository,
                            VocabRepository vocabRepository,
                            KanjiRepository kanjiRepository) {
        this.flashcardRepository = flashcardRepository;
        this.userRepository = userRepository;
        this.vocabRepository = vocabRepository;
        this.kanjiRepository = kanjiRepository;
    }

    public List<Flashcard> getDueFlashcards(Long userId) {
        return flashcardRepository.findDueCards(userId, LocalDate.now());
    }

    public List<Flashcard> getAllFlashcards(Long userId) {
        return flashcardRepository.findByUserId(userId);
    }

    public long getDueCount(Long userId) {
        return flashcardRepository.countDueCards(userId, LocalDate.now());
    }

    public Flashcard addToFlashcards(Long userId, Long vocabId, Long kanjiId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (vocabId != null) {
            Optional<Flashcard> existing = flashcardRepository.findByUserIdAndVocabId(userId, vocabId);
            if (existing.isPresent()) {
                return existing.get();
            }
            Vocab vocab = vocabRepository.findById(vocabId)
                    .orElseThrow(() -> new IllegalArgumentException("Vocabulary not found"));
            
            Flashcard flashcard = Flashcard.builder()
                    .user(user)
                    .vocab(vocab)
                    .repetition(0)
                    .intervalDays(1)
                    .easiness(2.5)
                    .nextReviewDate(LocalDate.now())
                    .build();
            return flashcardRepository.save(flashcard);
        } else if (kanjiId != null) {
            Optional<Flashcard> existing = flashcardRepository.findByUserIdAndKanjiId(userId, kanjiId);
            if (existing.isPresent()) {
                return existing.get();
            }
            Kanji kanji = kanjiRepository.findById(kanjiId)
                    .orElseThrow(() -> new IllegalArgumentException("Kanji not found"));
            
            Flashcard flashcard = Flashcard.builder()
                    .user(user)
                    .kanji(kanji)
                    .repetition(0)
                    .intervalDays(1)
                    .easiness(2.5)
                    .nextReviewDate(LocalDate.now())
                    .build();
            return flashcardRepository.save(flashcard);
        } else {
            throw new IllegalArgumentException("Either vocabId or kanjiId must be provided");
        }
    }

    public Flashcard reviewCard(Long cardId, int rating) {
        Flashcard card = flashcardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Flashcard not found"));

        int repetition = card.getRepetition();
        int intervalDays = card.getIntervalDays();
        double easiness = card.getEasiness();

        // SM-2 rating mapping:
        // rating: 1 (Forgot/Again), 2 (Hard), 3 (Good), 4 (Easy)
        // We map these to q values in the 0..5 range for standard SM-2 formula:
        // 1 -> q = 1 (incorrect response; the correct one remembered after significant effort)
        // 2 -> q = 2 (incorrect response; where the correct one seemed easy to recall)
        // 3 -> q = 4 (correct response after a hesitation)
        // 4 -> q = 5 (perfect response)
        int q = 3;
        if (rating == 1) q = 1;
        else if (rating == 2) q = 2;
        else if (rating == 3) q = 4;
        else if (rating == 4) q = 5;

        if (q < 3) {
            repetition = 0;
            intervalDays = 1;
        } else {
            if (repetition == 0) {
                intervalDays = 1;
            } else if (repetition == 1) {
                intervalDays = 6;
            } else {
                intervalDays = (int) Math.round(intervalDays * easiness);
            }
            repetition += 1;
        }

        // Update easiness factor
        easiness = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        if (easiness < 1.3) {
            easiness = 1.3;
        }

        card.setRepetition(repetition);
        card.setIntervalDays(intervalDays);
        card.setEasiness(easiness);
        card.setNextReviewDate(LocalDate.now().plusDays(intervalDays));
        card.setLastReviewedAt(LocalDateTime.now());

        return flashcardRepository.save(card);
    }

    public void deleteFlashcard(Long cardId) {
        flashcardRepository.deleteById(cardId);
    }
}
