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

    public Grammar getGrammarById(Long id) {
        return grammarRepository.findById(id).orElseThrow(() -> new RuntimeException("Grammar not found with id: " + id));
    }

    public Grammar updateGrammar(Long id, Grammar grammarDetails) {
        Grammar grammar = getGrammarById(id);
        grammar.setStructure(grammarDetails.getStructure());
        grammar.setMeaning(grammarDetails.getMeaning());
        grammar.setExplanation(grammarDetails.getExplanation());
        grammar.setExampleSentence(grammarDetails.getExampleSentence());
        grammar.setExampleMeaning(grammarDetails.getExampleMeaning());
        grammar.setLevel(grammarDetails.getLevel());
        grammar.setBook(grammarDetails.getBook());
        grammar.setWeek(grammarDetails.getWeek());
        grammar.setDay(grammarDetails.getDay());
        return grammarRepository.save(grammar);
    }

    public void deleteGrammar(Long id) {
        Grammar grammar = getGrammarById(id);
        grammarRepository.delete(grammar);
    }

    public void deleteAllGrammars() {
        grammarRepository.deleteAll();
    }

    public void deleteGrammarsByBook(Long bookId) {
        List<Grammar> grammars = grammarRepository.findByBookId(bookId);
        grammarRepository.deleteAll(grammars);
    }

    public List<Grammar> getByLevel(String level) {
        return grammarRepository.findByLevel(level);
    }
}
