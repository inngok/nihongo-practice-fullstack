package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.Grammar;
import com.nihongo.practice_nihongo.repository.GrammarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GrammarService {

    @Autowired
    private GrammarRepository grammarRepository;

    public List<Grammar> getAllGrammars() {
        return grammarRepository.findAll();
    }

    public Grammar createGrammar(Grammar grammar) {
        // Bạn có thể thêm logic kiểm tra dữ liệu ở đây
        return grammarRepository.save(grammar);
    }

    public List<Grammar> getByLevel(String level) {
        return grammarRepository.findByLevel(level);
    }
}
