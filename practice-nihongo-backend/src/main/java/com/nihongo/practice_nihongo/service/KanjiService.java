package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.Kanji;
import com.nihongo.practice_nihongo.model.Book;
import com.nihongo.practice_nihongo.repository.KanjiRepository;
import com.nihongo.practice_nihongo.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KanjiService {

    private final KanjiRepository kanjiRepository;
    private final BookRepository bookRepository;

    public KanjiService(KanjiRepository kanjiRepository, BookRepository bookRepository) {
        this.kanjiRepository = kanjiRepository;
        this.bookRepository = bookRepository;
    }

    public List<Kanji> getAllKanjis() {
        return kanjiRepository.findAll();
    }

    public List<Kanji> getKanjisByBook(Long bookId) {
        return kanjiRepository.findByBookId(bookId);
    }

    public List<Kanji> getKanjisByBookWeekDay(Long bookId, Integer week, Integer day) {
        return kanjiRepository.findByBookIdAndWeekAndDay(bookId, week, day);
    }

    public Kanji getKanjiById(Long id) {
        return kanjiRepository.findById(id).orElse(null);
    }

    public Kanji createKanji(Kanji kanji) {
        if (kanji.getBook() != null && kanji.getBook().getId() != null) {
            Book book = bookRepository.findById(kanji.getBook().getId()).orElse(null);
            kanji.setBook(book);
        }
        return kanjiRepository.save(kanji);
    }

    public List<Kanji> createKanjisBulk(List<Kanji> kanjis) {
        for (Kanji kanji : kanjis) {
            if (kanji.getBook() != null && kanji.getBook().getId() != null) {
                Book book = bookRepository.findById(kanji.getBook().getId()).orElse(null);
                kanji.setBook(book);
            }
        }
        return kanjiRepository.saveAll(kanjis);
    }

    public Kanji updateKanji(Long id, Kanji kanji) {
        if (kanjiRepository.existsById(id)) {
            kanji.setId(id);
            if (kanji.getBook() != null && kanji.getBook().getId() != null) {
                Book book = bookRepository.findById(kanji.getBook().getId()).orElse(null);
                kanji.setBook(book);
            }
            return kanjiRepository.save(kanji);
        }
        return null;
    }

    public void deleteKanji(Long id) {
        kanjiRepository.deleteById(id);
    }
}
