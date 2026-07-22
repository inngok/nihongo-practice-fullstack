package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.JlptPastVocab;
import com.nihongo.practice_nihongo.repository.JlptPastVocabRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class JlptPastVocabService {

    private final JlptPastVocabRepository repository;

    public JlptPastVocabService(JlptPastVocabRepository repository) {
        this.repository = repository;
    }

    public List<JlptPastVocab> getAllVocabs(String level) {
        if (level == null || level.trim().isEmpty() || level.equalsIgnoreCase("all")) {
            return repository.findAllByOrderByAppearanceCountDesc();
        }
        return repository.findAllByLevelOrderByAppearanceCountDesc(level);
    }

    @Transactional
    public void importVocabs(List<JlptPastVocab> vocabs, String examPeriod, String level) {
        if (repository.existsByLevelAndExamHistoryContaining(level, examPeriod)) {
            throw new RuntimeException("Đợt thi " + examPeriod + " đã được import cho cấp độ " + level + " rồi!");
        }

        for (JlptPastVocab newVocab : vocabs) {
            String word = newVocab.getWord();
            if (word == null || word.trim().isEmpty()) {
                continue;
            }

            Optional<JlptPastVocab> existingOpt = repository.findFirstByWordAndLevel(word, level);
            
            // Migration for old data where level is null
            if (existingOpt.isEmpty()) {
                Optional<JlptPastVocab> legacyOpt = repository.findFirstByWord(word);
                if (legacyOpt.isPresent() && legacyOpt.get().getLevel() == null) {
                    existingOpt = legacyOpt;
                }
            }

            if (existingOpt.isPresent()) {
                JlptPastVocab existing = existingOpt.get();
                
                String history = existing.getExamHistory() != null ? existing.getExamHistory() : "";
                
                if (!history.contains(examPeriod)) {
                    existing.setAppearanceCount(existing.getAppearanceCount() + 1);
                    if (history.isEmpty()) {
                        existing.setExamHistory(examPeriod);
                    } else {
                        existing.setExamHistory(history + ", " + examPeriod);
                    }
                    
                    if (newVocab.getKanji() != null && !newVocab.getKanji().isEmpty()) {
                        existing.setKanji(newVocab.getKanji());
                    }
                    if (newVocab.getMeaning() != null && !newVocab.getMeaning().isEmpty()) {
                        existing.setMeaning(newVocab.getMeaning());
                    }
                    
                    if (existing.getLevel() == null) {
                        existing.setLevel(level);
                    }
                    repository.save(existing);
                } else if (existing.getLevel() == null) {
                    existing.setLevel(level);
                    repository.save(existing);
                }
            } else {
                newVocab.setAppearanceCount(1);
                newVocab.setExamHistory(examPeriod);
                newVocab.setLevel(level);
                repository.save(newVocab);
            }
        }
    }

    public void deleteByExamPeriodAndLevel(String examPeriod, String level) {
        List<JlptPastVocab> affectedVocabs = repository.findAllByLevelAndExamHistoryContaining(level, examPeriod);
        if (affectedVocabs.isEmpty()) {
            throw new RuntimeException("Không tìm thấy dữ liệu của đợt thi " + examPeriod + " (" + level + ")");
        }

        for (JlptPastVocab vocab : affectedVocabs) {
            String history = vocab.getExamHistory();
            if (history == null) continue;

            if (history.trim().equals(examPeriod)) {
                // If it only appeared in this exam period, delete the vocab entirely
                repository.delete(vocab);
            } else {
                // Remove the exam period from history
                String newHistory = history.replace(examPeriod, "")
                                           .replace(", ,", ",")
                                           .replaceAll("^, |, $", "")
                                           .trim();
                vocab.setExamHistory(newHistory);
                vocab.setAppearanceCount(Math.max(1, vocab.getAppearanceCount() - 1));
                repository.save(vocab);
            }
        }
    }
}
