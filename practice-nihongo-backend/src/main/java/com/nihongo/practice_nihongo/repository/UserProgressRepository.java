package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    Optional<UserProgress> findByUserIdAndProgressKey(Long userId, String progressKey);
}
