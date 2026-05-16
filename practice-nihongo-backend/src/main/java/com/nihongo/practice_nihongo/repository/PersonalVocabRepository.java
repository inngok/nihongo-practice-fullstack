package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.PersonalVocab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PersonalVocabRepository extends JpaRepository<PersonalVocab, Long> {
    List<PersonalVocab> findByUserId(Long userId);
    List<PersonalVocab> findByFolderId(Long folderId);
    List<PersonalVocab> findByUserIdAndFolderIdIsNull(Long userId);
}
