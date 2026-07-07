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
    private final com.nihongo.practice_nihongo.repository.VocabFolderRepository vocabFolderRepository;

    public VocabService(VocabRepository vocabRepository, BookRepository bookRepository, com.nihongo.practice_nihongo.repository.VocabFolderRepository vocabFolderRepository) {
        this.vocabRepository = vocabRepository;
        this.bookRepository = bookRepository;
        this.vocabFolderRepository = vocabFolderRepository;
    }

    public List<Vocab> getAllVocabs() {
        return vocabRepository.findAll();
    }

    public List<Vocab> getSystemVocabs() {
        return vocabRepository.findAll();
    }

    public List<Vocab> getVocabsByBook(Long bookId) {
        return vocabRepository.findByBookId(bookId);
    }

    public List<Vocab> getVocabsByBookWeekDay(Long bookId, Integer week, Integer day) {
        return vocabRepository.findByBookIdAndWeekAndDay(bookId, week, day);
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

    public List<Vocab> createVocabsBulk(List<Vocab> vocabs) {
        for (Vocab vocab : vocabs) {
            if (vocab.getBook() != null && vocab.getBook().getId() != null) {
                Book book = bookRepository.findById(vocab.getBook().getId()).orElse(null);
                vocab.setBook(book);
            }
        }
        return vocabRepository.saveAll(vocabs);
    }

    @org.springframework.transaction.annotation.Transactional
    public void bulkUpdateVocabs(List<Long> ids, Integer week, Integer day) {
        List<Vocab> vocabs = vocabRepository.findAllById(ids);
        for (Vocab vocab : vocabs) {
            if (week != null) vocab.setWeek(week);
            if (day != null) vocab.setDay(day);
        }
        vocabRepository.saveAll(vocabs);
    }

    public Vocab updateVocab(Long id, Vocab vocab) {
        Vocab existing = vocabRepository.findById(id).orElse(null);
        if (existing != null) {
            if (vocab.getWord() != null) existing.setWord(vocab.getWord());
            if (vocab.getReading() != null) existing.setReading(vocab.getReading());
            if (vocab.getMeaning() != null) existing.setMeaning(vocab.getMeaning());
            if (vocab.getHanviet() != null) existing.setHanviet(vocab.getHanviet());
            if (vocab.getExample() != null) existing.setExample(vocab.getExample());
            if (vocab.getExampleMeaning() != null) existing.setExampleMeaning(vocab.getExampleMeaning());
            if (vocab.getWeek() != null) existing.setWeek(vocab.getWeek());
            if (vocab.getDay() != null) existing.setDay(vocab.getDay());
            if (vocab.getPublish() != null) existing.setPublish(vocab.getPublish());

            if (vocab.getBook() != null && vocab.getBook().getId() != null) {
                Book book = bookRepository.findById(vocab.getBook().getId()).orElse(null);
                existing.setBook(book);
            }

            return vocabRepository.save(existing);
        }
        return null;
    }

    public void deleteVocab(Long id) {
        vocabRepository.deleteById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteVocabsByBook(Long bookId) {
        vocabRepository.deleteByBookId(bookId);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteAllVocabs() {
        vocabRepository.deleteAll();
    }
}
