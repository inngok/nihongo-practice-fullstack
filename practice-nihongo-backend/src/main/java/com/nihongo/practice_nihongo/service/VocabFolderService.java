package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.VocabFolder;
import com.nihongo.practice_nihongo.repository.VocabFolderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VocabFolderService {

    private final VocabFolderRepository vocabFolderRepository;
    private final com.nihongo.practice_nihongo.repository.VocabRepository vocabRepository;

    public VocabFolderService(VocabFolderRepository vocabFolderRepository, com.nihongo.practice_nihongo.repository.VocabRepository vocabRepository) {
        this.vocabFolderRepository = vocabFolderRepository;
        this.vocabRepository = vocabRepository;
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
        List<VocabFolder> allFolders = vocabFolderRepository.findAll();
        for (VocabFolder f : allFolders) {
            if (f.getParent() != null && f.getParent().getId().equals(id)) {
                deleteFolder(f.getId()); // Recursive
            }
        }
        
        // Find and delete vocabs in this folder
        List<com.nihongo.practice_nihongo.model.Vocab> vocabs = vocabRepository.findAll();
        for (com.nihongo.practice_nihongo.model.Vocab v : vocabs) {
            if (v.getFolder() != null && v.getFolder().getId().equals(id)) {
                vocabRepository.delete(v);
            }
        }
        
        vocabFolderRepository.deleteById(id);
    }
}
