package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.AiUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AiUsageRepository extends JpaRepository<AiUsage, Long> {
    Optional<AiUsage> findByUsageDate(LocalDate usageDate);
}
