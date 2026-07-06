package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.Kanji;
import com.nihongo.practice_nihongo.model.Book;
import com.nihongo.practice_nihongo.repository.KanjiRepository;
import com.nihongo.practice_nihongo.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;


@Service
public class KanjiService {

    private final KanjiRepository kanjiRepository;
    private final BookRepository bookRepository;

    public KanjiService(KanjiRepository kanjiRepository, BookRepository bookRepository) {
        this.kanjiRepository = kanjiRepository;
        this.bookRepository = bookRepository;
    }

    public List<Kanji> getAllKanjis() {
        Sort sort = Sort.by(Sort.Order.asc("book.id"), Sort.Order.asc("week"), Sort.Order.asc("day"), Sort.Order.asc("sortOrder"));
        return kanjiRepository.findAll(sort);
    }

    public List<Kanji> getKanjisByBook(Long bookId) {
        List<Kanji> list = kanjiRepository.findByBookId(bookId);
        list.sort(Comparator.comparing(Kanji::getWeek, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Kanji::getDay, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Kanji::getSortOrder, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Kanji::getId, Comparator.nullsLast(Comparator.naturalOrder())));
        return list;
    }

    public List<Kanji> getKanjisByBookWeekDay(Long bookId, Integer week, Integer day) {
        List<Kanji> list = kanjiRepository.findByBookIdAndWeekAndDay(bookId, week, day);
        list.sort(Comparator.comparing(Kanji::getSortOrder, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Kanji::getId, Comparator.nullsLast(Comparator.naturalOrder())));
        return list;
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
            Optional<Kanji> existingOpt;
            if (kanji.getBook() != null && kanji.getBook().getId() != null) {
                existingOpt = kanjiRepository.findFirstByCharacterAndBookId(kanji.getCharacter(), kanji.getBook().getId());
            } else {
                existingOpt = kanjiRepository.findFirstByCharacter(kanji.getCharacter());
            }
            existingOpt.ifPresentOrElse(existing -> {
                Optional.ofNullable(kanji.getHanviet()).ifPresent(existing::setHanviet);
                Optional.ofNullable(kanji.getMeaning()).ifPresent(existing::setMeaning);
                Optional.ofNullable(kanji.getKunyomi()).ifPresent(existing::setKunyomi);
                Optional.ofNullable(kanji.getOnyomi()).ifPresent(existing::setOnyomi);
                Optional.ofNullable(kanji.getExamples()).ifPresent(existing::setExamples);
                Optional.ofNullable(kanji.getWeek()).ifPresent(existing::setWeek);
                Optional.ofNullable(kanji.getDay()).ifPresent(existing::setDay);
                Optional.ofNullable(kanji.getPage()).ifPresent(existing::setPage);

                Optional.ofNullable(kanji.getBook())
                        .map(Book::getId)
                        .flatMap(bookRepository::findById)
                        .ifPresent(existing::setBook);

                kanji.setId(existing.getId());
                kanji.setBook(existing.getBook());
            }, () -> {
                Optional.ofNullable(kanji.getBook())
                        .map(Book::getId)
                        .flatMap(bookRepository::findById)
                        .ifPresent(kanji::setBook);
            });
        }
        return kanjiRepository.saveAll(kanjis);
    }

    public Kanji updateKanji(Long id, Kanji kanji) {
        return kanjiRepository.findById(id).map(existing -> {
            Optional.ofNullable(kanji.getCharacter()).ifPresent(existing::setCharacter);
            Optional.ofNullable(kanji.getHanviet()).ifPresent(existing::setHanviet);
            Optional.ofNullable(kanji.getKunyomi()).ifPresent(existing::setKunyomi);
            Optional.ofNullable(kanji.getOnyomi()).ifPresent(existing::setOnyomi);
            Optional.ofNullable(kanji.getMeaning()).ifPresent(existing::setMeaning);
            Optional.ofNullable(kanji.getExamples()).ifPresent(existing::setExamples);
            Optional.ofNullable(kanji.getWeek()).ifPresent(existing::setWeek);
            Optional.ofNullable(kanji.getDay()).ifPresent(existing::setDay);
            Optional.ofNullable(kanji.getPage()).ifPresent(existing::setPage);
            Optional.ofNullable(kanji.getSortOrder()).ifPresent(existing::setSortOrder);
            Optional.ofNullable(kanji.getPublish()).ifPresent(existing::setPublish);

            Optional.ofNullable(kanji.getBook())
                    .map(Book::getId)
                    .flatMap(bookRepository::findById)
                    .ifPresent(existing::setBook);

            return kanjiRepository.save(existing);
        }).orElse(null);
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
