package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "page_visits")
public class PageVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visit_date", unique = true, nullable = false)
    private LocalDate visitDate;

    @Column(name = "visit_count", nullable = false)
    private long visitCount = 0;

    public PageVisit() {}

    public PageVisit(LocalDate visitDate) {
        this.visitDate = visitDate;
        this.visitCount = 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public long getVisitCount() {
        return visitCount;
    }

    public void setVisitCount(long visitCount) {
        this.visitCount = visitCount;
    }
}
