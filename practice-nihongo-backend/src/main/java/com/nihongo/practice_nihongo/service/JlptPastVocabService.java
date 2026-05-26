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

    public List<JlptPastVocab> getAllVocabs() {
        return repository.findAllByOrderByAppearanceCountDesc();
    }

    @Transactional
    public void importVocabs(List<JlptPastVocab> vocabs, String examPeriod) {
        for (JlptPastVocab newVocab : vocabs) {
            String word = newVocab.getWord();
            if (word == null || word.trim().isEmpty()) {
                continue;
            }

            Optional<JlptPastVocab> existingOpt = repository.findByWord(word);
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
                    
                    repository.save(existing);
                }
            } else {
                newVocab.setAppearanceCount(1);
                newVocab.setExamHistory(examPeriod);
                repository.save(newVocab);
            }
        }
    }
}
