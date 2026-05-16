package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.VocabFolder;
import com.nihongo.practice_nihongo.repository.VocabFolderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VocabFolderService {

    private final VocabFolderRepository vocabFolderRepository;
    private final com.nihongo.practice_nihongo.repository.PersonalVocabRepository personalVocabRepository;

    public VocabFolderService(VocabFolderRepository vocabFolderRepository, com.nihongo.practice_nihongo.repository.PersonalVocabRepository personalVocabRepository) {
        this.vocabFolderRepository = vocabFolderRepository;
        this.personalVocabRepository = personalVocabRepository;
    }

    public List<VocabFolder> getFoldersByUser(Long userId) {
        return vocabFolderRepository.findByUserId(userId);
    }

    public List<VocabFolder> getRootFoldersByUser(Long userId) {
        return vocabFolderRepository.findByUserIdAndParentIsNull(userId);
    }

    public VocabFolder createFolder(VocabFolder folder) {
        if (folder.getParent() != null && folder.getParent().getId() != null) {
            VocabFolder parent = vocabFolderRepository.findById(folder.getParent().getId()).orElse(null);
            folder.setParent(parent);
        }
        return vocabFolderRepository.save(folder);
    }

    public VocabFolder updateFolder(Long id, VocabFolder folderDetails) {
        return vocabFolderRepository.findById(id).map(folder -> {
            folder.setName(folderDetails.getName());
            folder.setDescription(folderDetails.getDescription());
            folder.setSourceUrl(folderDetails.getSourceUrl());
            if (folderDetails.getParent() != null && folderDetails.getParent().getId() != null) {
                VocabFolder parent = vocabFolderRepository.findById(folderDetails.getParent().getId()).orElse(null);
                folder.setParent(parent);
            } else {
                folder.setParent(null);
            }
            return vocabFolderRepository.save(folder);
        }).orElse(null);
    }

    public void deleteFolder(Long id) {
        // Find and delete subfolders first
        List<VocabFolder> subFolders = vocabFolderRepository.findByParentId(id);
        for (VocabFolder f : subFolders) {
            deleteFolder(f.getId()); // Recursive
        }
        
        // Find and delete personal vocabs in this folder
        List<com.nihongo.practice_nihongo.model.PersonalVocab> vocabs = personalVocabRepository.findByFolderId(id);
        personalVocabRepository.deleteAll(vocabs);
        
        vocabFolderRepository.deleteById(id);
    }
}
