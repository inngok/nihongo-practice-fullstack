package com.nihongo.practice_nihongo.dto;

import com.nihongo.practice_nihongo.model.JlptPastVocab;
import java.util.List;

public class JlptPastVocabImportRequest {
    private String examPeriod;
    private String level;
    private List<JlptPastVocab> vocabs;

    public String getExamPeriod() {
        return examPeriod;
    }

    public void setExamPeriod(String examPeriod) {
        this.examPeriod = examPeriod;
    }

    public List<JlptPastVocab> getVocabs() {
        return vocabs;
    }

    public void setVocabs(List<JlptPastVocab> vocabs) {
        this.vocabs = vocabs;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }
}
