package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.VocabFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabFolderRepository extends JpaRepository<VocabFolder, Long> {
    List<VocabFolder> findByUserId(Long userId);
    List<VocabFolder> findByUserIdAndParentIsNull(Long userId);
    List<VocabFolder> findByParentId(Long parentId);
}
