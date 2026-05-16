package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.Kanji;
import com.nihongo.practice_nihongo.model.Book;
import com.nihongo.practice_nihongo.repository.KanjiRepository;
import com.nihongo.practice_nihongo.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


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
            Optional<Kanji> existingOpt = kanjiRepository.findByCharacter(kanji.getCharacter());
            if (existingOpt.isPresent()) {
                Kanji existing = existingOpt.get();
                existing.setHanviet(kanji.getHanviet());
                existing.setMeaning(kanji.getMeaning());
                if (kanji.getKunyomi() != null) existing.setKunyomi(kanji.getKunyomi());
                if (kanji.getOnyomi() != null) existing.setOnyomi(kanji.getOnyomi());
                if (kanji.getExamples() != null) existing.setExamples(kanji.getExamples());
                if (kanji.getWeek() != null) existing.setWeek(kanji.getWeek());
                if (kanji.getDay() != null) existing.setDay(kanji.getDay());
                if (kanji.getPage() != null) existing.setPage(kanji.getPage());
                
                if (kanji.getBook() != null && kanji.getBook().getId() != null) {
                    Book book = bookRepository.findById(kanji.getBook().getId()).orElse(null);
                    existing.setBook(book);
                }
                
                // Map fields over to ensure JPA updates the existing record
                kanji.setId(existing.getId());
                kanji.setBook(existing.getBook());
            } else {
                if (kanji.getBook() != null && kanji.getBook().getId() != null) {
                    Book book = bookRepository.findById(kanji.getBook().getId()).orElse(null);
                    kanji.setBook(book);
                }
            }
        }
        return kanjiRepository.saveAll(kanjis);
    }

    public Kanji updateKanji(Long id, Kanji kanji) {
        Optional<Kanji> existingOpt = kanjiRepository.findById(id);
        if (existingOpt.isPresent()) {
            Kanji existing = existingOpt.get();
            
            // Only update fields that are provided
            if (kanji.getCharacter() != null) existing.setCharacter(kanji.getCharacter());
            if (kanji.getHanviet() != null) existing.setHanviet(kanji.getHanviet());
            if (kanji.getKunyomi() != null) existing.setKunyomi(kanji.getKunyomi());
            if (kanji.getOnyomi() != null) existing.setOnyomi(kanji.getOnyomi());
            if (kanji.getMeaning() != null) existing.setMeaning(kanji.getMeaning());
            if (kanji.getExamples() != null) existing.setExamples(kanji.getExamples());
            if (kanji.getWeek() != null) existing.setWeek(kanji.getWeek());
            if (kanji.getDay() != null) existing.setDay(kanji.getDay());
            if (kanji.getPage() != null) existing.setPage(kanji.getPage());
            
            if (kanji.getBook() != null && kanji.getBook().getId() != null) {
                Book book = bookRepository.findById(kanji.getBook().getId()).orElse(null);
                existing.setBook(book);
            }
            
            return kanjiRepository.save(existing);
        }
        return null;
    }

    public void deleteKanji(Long id) {
        kanjiRepository.deleteById(id);
    }

    public void deleteAllKanjis() {
        kanjiRepository.deleteAll();
    }

    public void deleteKanjisByBook(Long bookId) {
        List<Kanji> kanjis = kanjiRepository.findByBookId(bookId);
        kanjiRepository.deleteAll(kanjis);
    }

    public void deleteKanjisByIds(List<Long> ids) {
        kanjiRepository.deleteAllById(ids);
    }
}
