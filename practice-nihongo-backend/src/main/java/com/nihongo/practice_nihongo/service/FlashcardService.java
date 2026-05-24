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

    // FSRS v4 Weights
    private static final double[] W = {
        0.4, 0.6, 2.4, 5.8, // w[0..3]
        4.93, 0.94, 0.86, 0.01, // w[4..7]
        1.49, 0.14, 0.94, // w[8..10]
        2.18, 0.05, 0.34, 1.26, // w[11..14]
        0.29, 2.61 // w[15..16]
    };

    public Flashcard reviewCard(Long cardId, int rating) {
        Flashcard card = flashcardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Flashcard not found"));

        Integer state = card.getState() == null ? 0 : card.getState(); // 0=New, 1=Learning, 2=Review, 3=Relearning
        Double stability = card.getStability();
        Double difficulty = card.getDifficulty();
        Integer lapses = card.getLapses() == null ? 0 : card.getLapses();
        int repetition = card.getRepetition();

        // Convert legacy SM-2 cards to FSRS on the fly
        if (stability == null || difficulty == null) {
            if (repetition > 0) {
                stability = (double) card.getIntervalDays();
                difficulty = Math.max(1.0, Math.min(10.0, 11.0 - card.getEasiness())); 
                state = 2; // Review
            } else {
                state = 0; // New
            }
        }

        double nextStability = 0;
        double nextDifficulty = 0;

        if (state == 0 || state == 1) {
            // New or Learning
            if (rating == 1) { // Again
                nextStability = W[0];
                nextDifficulty = W[4] - W[5];
                state = 1;
            } else if (rating == 2) { // Hard
                nextStability = W[1];
                nextDifficulty = W[4];
                state = 1;
            } else if (rating == 3) { // Good
                nextStability = W[2];
                nextDifficulty = W[4] + W[5];
                state = 2;
            } else { // Easy
                nextStability = W[3];
                nextDifficulty = W[4] + W[5] * 2;
                state = 2;
            }
        } else {
            // Review or Relearning
            double retrievability = Math.exp(Math.log(0.9) * card.getIntervalDays() / stability);

            if (rating == 1) { // Lapse
                nextDifficulty = Math.min(10.0, Math.max(1.0, difficulty + W[6]));
                nextStability = W[11] * Math.pow(nextDifficulty, -W[12]) * Math.pow(stability + 1, W[13]) * Math.exp(W[14] * (1 - retrievability));
                lapses++;
                state = 3; // Relearning
            } else {
                nextDifficulty = difficulty;
                if (rating == 2) {
                    nextDifficulty += W[6];
                } else if (rating == 4) {
                    nextDifficulty -= W[6];
                }
                nextDifficulty = Math.min(10.0, Math.max(1.0, nextDifficulty));

                double sInc = Math.exp(W[8]) * Math.pow(nextDifficulty, -W[9]) * Math.pow(stability, -W[10]) * (Math.exp(1 - retrievability) - 1);

                if (rating == 2) {
                    sInc *= W[15]; // hard penalty
                } else if (rating == 4) {
                    sInc *= W[16]; // easy bonus
                }

                nextStability = stability * (1 + sInc);
                state = 2; // Review
            }
        }

        repetition++;

        // Calculate next interval for a target retention of 90% (R = 0.9)
        // Formula: I = S * 9 * (1/R - 1). With R=0.9, I = S.
        int nextInterval = (int) Math.round(nextStability);
        if (nextInterval < 1) nextInterval = 1;
        if (rating == 1) nextInterval = 1; // Again means learn it tomorrow or today

        // Update Card
        card.setStability(nextStability);
        card.setDifficulty(nextDifficulty);
        card.setState(state);
        card.setLapses(lapses);
        card.setRepetition(repetition);
        card.setIntervalDays(nextInterval);
        card.setNextReviewDate(LocalDate.now().plusDays(nextInterval));
        card.setLastReviewedAt(LocalDateTime.now());

        return flashcardRepository.save(card);
    }

    public void deleteFlashcard(Long cardId) {
        flashcardRepository.deleteById(cardId);
    }
}
