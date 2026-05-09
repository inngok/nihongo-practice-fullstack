package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "ai_usage")
public class AiUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usage_date", unique = true, nullable = false)
    private LocalDate usageDate;

    @Column(name = "total_calls", nullable = false)
    private int totalCalls = 0;

    @Column(name = "success_calls", nullable = false)
    private int successCalls = 0;

    @Column(name = "fail_calls", nullable = false)
    private int failCalls = 0;

    public AiUsage() {}

    public AiUsage(LocalDate usageDate) {
        this.usageDate = usageDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getUsageDate() {
        return usageDate;
    }

    public void setUsageDate(LocalDate usageDate) {
        this.usageDate = usageDate;
    }

    public int getTotalCalls() {
        return totalCalls;
    }

    public void setTotalCalls(int totalCalls) {
        this.totalCalls = totalCalls;
    }

    public int getSuccessCalls() {
        return successCalls;
    }

    public void setSuccessCalls(int successCalls) {
        this.successCalls = successCalls;
    }

    public int getFailCalls() {
        return failCalls;
    }

    public void setFailCalls(int failCalls) {
        this.failCalls = failCalls;
    }
}
