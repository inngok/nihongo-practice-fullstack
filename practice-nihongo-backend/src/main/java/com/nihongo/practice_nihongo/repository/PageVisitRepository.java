package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.PageVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PageVisitRepository extends JpaRepository<PageVisit, Long> {
    Optional<PageVisit> findByVisitDate(LocalDate visitDate);

    @Query("SELECT SUM(p.visitCount) FROM PageVisit p")
    Long sumAllVisits();
}
