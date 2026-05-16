package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.PersonalVocab;
import com.nihongo.practice_nihongo.model.VocabFolder;
import com.nihongo.practice_nihongo.repository.PersonalVocabRepository;
import com.nihongo.practice_nihongo.repository.VocabFolderRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PersonalVocabService {
    private final PersonalVocabRepository personalVocabRepository;
    private final VocabFolderRepository vocabFolderRepository;

    public PersonalVocabService(PersonalVocabRepository personalVocabRepository, VocabFolderRepository vocabFolderRepository) {
        this.personalVocabRepository = personalVocabRepository;
        this.vocabFolderRepository = vocabFolderRepository;
    }

    public List<PersonalVocab> getPersonalVocabs(Long userId) {
        return personalVocabRepository.findByUserId(userId);
    }

    public List<PersonalVocab> getVocabsByFolder(Long folderId) {
        return personalVocabRepository.findByFolderId(folderId);
    }

    public PersonalVocab getById(Long id) {
        return personalVocabRepository.findById(id).orElse(null);
    }

    public PersonalVocab create(PersonalVocab vocab) {
        if (vocab.getFolder() != null && vocab.getFolder().getId() != null) {
            VocabFolder folder = vocabFolderRepository.findById(vocab.getFolder().getId()).orElse(null);
            vocab.setFolder(folder);
        }
        return personalVocabRepository.save(vocab);
    }

    public PersonalVocab update(Long id, PersonalVocab vocab) {
        PersonalVocab existing = personalVocabRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setWord(vocab.getWord());
            existing.setReading(vocab.getReading());
            existing.setMeaning(vocab.getMeaning());
            existing.setExample(vocab.getExample());
            existing.setExampleMeaning(vocab.getExampleMeaning());
            
            if (vocab.getFolder() != null && vocab.getFolder().getId() != null) {
                VocabFolder folder = vocabFolderRepository.findById(vocab.getFolder().getId()).orElse(null);
                existing.setFolder(folder);
            } else {
                existing.setFolder(null);
            }
            
            return personalVocabRepository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        personalVocabRepository.deleteById(id);
    }
}
