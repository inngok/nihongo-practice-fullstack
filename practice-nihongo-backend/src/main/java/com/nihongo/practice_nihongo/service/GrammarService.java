package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.Grammar;
import com.nihongo.practice_nihongo.repository.GrammarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Sort;
import java.util.List;

@Service
public class GrammarService {

    @Autowired
    private GrammarRepository grammarRepository;

    public List<Grammar> getAllGrammars() {
        Sort sort = Sort.by(Sort.Order.asc("book.id"), Sort.Order.asc("week"), Sort.Order.asc("day"), Sort.Order.asc("sortOrder"));
        return grammarRepository.findAll(sort);
    }

    public Grammar createGrammar(Grammar grammar) {
        return grammarRepository.save(grammar);
    }

    public Grammar getGrammarById(Long id) {
        return grammarRepository.findById(id).orElseThrow(() -> new RuntimeException("Grammar not found with id: " + id));
    }

    public Grammar updateGrammar(Long id, Grammar grammarDetails) {
        Grammar grammar = getGrammarById(id);
        
        if (grammarDetails.getStructure() != null) grammar.setStructure(grammarDetails.getStructure());
        if (grammarDetails.getMeaning() != null) grammar.setMeaning(grammarDetails.getMeaning());
        if (grammarDetails.getExplanation() != null) grammar.setExplanation(grammarDetails.getExplanation());
        if (grammarDetails.getExampleSentence() != null) grammar.setExampleSentence(grammarDetails.getExampleSentence());
        if (grammarDetails.getExampleMeaning() != null) grammar.setExampleMeaning(grammarDetails.getExampleMeaning());
        if (grammarDetails.getQuizSentence() != null) grammar.setQuizSentence(grammarDetails.getQuizSentence());
        if (grammarDetails.getLevel() != null) grammar.setLevel(grammarDetails.getLevel());
        if (grammarDetails.getBook() != null) grammar.setBook(grammarDetails.getBook());
        if (grammarDetails.getWeek() != null) grammar.setWeek(grammarDetails.getWeek());
        if (grammarDetails.getDay() != null) grammar.setDay(grammarDetails.getDay());
        if (grammarDetails.getSortOrder() != null) grammar.setSortOrder(grammarDetails.getSortOrder());
        if (grammarDetails.getPublish() != null) grammar.setPublish(grammarDetails.getPublish());
        
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
