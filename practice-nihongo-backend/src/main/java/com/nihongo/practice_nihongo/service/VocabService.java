package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.Vocab;
import com.nihongo.practice_nihongo.model.Book;
import com.nihongo.practice_nihongo.repository.VocabRepository;
import com.nihongo.practice_nihongo.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VocabService {

    private final VocabRepository vocabRepository;
    private final BookRepository bookRepository;

    public VocabService(VocabRepository vocabRepository, BookRepository bookRepository) {
        this.vocabRepository = vocabRepository;
        this.bookRepository = bookRepository;
    }

    public List<Vocab> getAllVocabs() {
        return vocabRepository.findAll();
    }

    public Vocab getVocabById(Long id) {
        return vocabRepository.findById(id).orElse(null);
    }

    public Vocab createVocab(Vocab vocab) {
        if (vocab.getBook() != null && vocab.getBook().getId() != null) {
            Book book = bookRepository.findById(vocab.getBook().getId()).orElse(null);
            vocab.setBook(book);
        }
        return vocabRepository.save(vocab);
    }

    public Vocab updateVocab(Long id, Vocab vocab) {
        if (vocabRepository.existsById(id)) {
            vocab.setId(id);
            if (vocab.getBook() != null && vocab.getBook().getId() != null) {
                Book book = bookRepository.findById(vocab.getBook().getId()).orElse(null);
                vocab.setBook(book);
            }
            return vocabRepository.save(vocab);
        }
        return null;
    }

    public void deleteVocab(Long id) {
        vocabRepository.deleteById(id);
    }
}
