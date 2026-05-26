package com.nihongo.practice_nihongo.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "confusing_grammar_points")
public class ConfusingGrammarPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String pattern;

    private String baseMeaning;

    private String nuance;

    private Integer similarityPercentage;

    @Column(columnDefinition = "TEXT")
    private String exampleSentence;

    private String exampleRomaji;

    @Column(columnDefinition = "TEXT")
    private String exampleTranslation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    @JsonIgnore
    private ConfusingGrammarGroup group;

    public ConfusingGrammarPoint() {}

    public ConfusingGrammarPoint(String pattern, String baseMeaning, String nuance, Integer similarityPercentage) {
        this.pattern = pattern;
        this.baseMeaning = baseMeaning;
        this.nuance = nuance;
        this.similarityPercentage = similarityPercentage;
    }

    public ConfusingGrammarPoint(String pattern, String baseMeaning, String nuance, Integer similarityPercentage, 
                                 String exampleSentence, String exampleRomaji, String exampleTranslation) {
        this.pattern = pattern;
        this.baseMeaning = baseMeaning;
        this.nuance = nuance;
        this.similarityPercentage = similarityPercentage;
        this.exampleSentence = exampleSentence;
        this.exampleRomaji = exampleRomaji;
        this.exampleTranslation = exampleTranslation;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public String getBaseMeaning() {
        return baseMeaning;
    }

    public void setBaseMeaning(String baseMeaning) {
        this.baseMeaning = baseMeaning;
    }

    public String getNuance() {
        return nuance;
    }

    public void setNuance(String nuance) {
        this.nuance = nuance;
    }

    public Integer getSimilarityPercentage() {
        return similarityPercentage;
    }

    public void setSimilarityPercentage(Integer similarityPercentage) {
        this.similarityPercentage = similarityPercentage;
    }

    public String getExampleSentence() {
        return exampleSentence;
    }

    public void setExampleSentence(String exampleSentence) {
        this.exampleSentence = exampleSentence;
    }

    public String getExampleRomaji() {
        return exampleRomaji;
    }

    public void setExampleRomaji(String exampleRomaji) {
        this.exampleRomaji = exampleRomaji;
    }

    public String getExampleTranslation() {
        return exampleTranslation;
    }

    public void setExampleTranslation(String exampleTranslation) {
        this.exampleTranslation = exampleTranslation;
    }

    public ConfusingGrammarGroup getGroup() {
        return group;
    }

    public void setGroup(ConfusingGrammarGroup group) {
        this.group = group;
    }
}
