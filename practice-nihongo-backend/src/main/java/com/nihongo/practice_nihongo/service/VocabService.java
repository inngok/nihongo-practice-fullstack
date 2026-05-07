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

    public List<Vocab> getPersonalVocabs(Long userId) {
        return vocabRepository.findByUserId(userId);
    }

    public List<Vocab> getSystemAndPersonalVocabs(Long userId) {
        return vocabRepository.findByUserIdOrUserIsNull(userId);
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
        if (vocab.getFolder() != null && vocab.getFolder().getId() != null) {
            com.nihongo.practice_nihongo.model.VocabFolder folder = vocabFolderRepository.findById(vocab.getFolder().getId()).orElse(null);
            vocab.setFolder(folder);
        }
        return vocabRepository.save(vocab);
    }

    public List<Vocab> createVocabsBulk(List<Vocab> vocabs) {
        for (Vocab vocab : vocabs) {
            if (vocab.getBook() != null && vocab.getBook().getId() != null) {
                Book book = bookRepository.findById(vocab.getBook().getId()).orElse(null);
                vocab.setBook(book);
            }
            if (vocab.getFolder() != null && vocab.getFolder().getId() != null) {
                com.nihongo.practice_nihongo.model.VocabFolder folder = vocabFolderRepository.findById(vocab.getFolder().getId()).orElse(null);
                vocab.setFolder(folder);
            }
        }
        return vocabRepository.saveAll(vocabs);
    }

    public Vocab updateVocab(Long id, Vocab vocab) {
        Vocab existing = vocabRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setWord(vocab.getWord());
            existing.setReading(vocab.getReading());
            existing.setMeaning(vocab.getMeaning());
            existing.setExample(vocab.getExample());
            existing.setExampleMeaning(vocab.getExampleMeaning());
            existing.setWeek(vocab.getWeek());
            existing.setDay(vocab.getDay());

            if (vocab.getBook() != null && vocab.getBook().getId() != null) {
                Book book = bookRepository.findById(vocab.getBook().getId()).orElse(null);
                existing.setBook(book);
            } else {
                existing.setBook(null);
            }

            if (vocab.getFolder() != null && vocab.getFolder().getId() != null) {
                com.nihongo.practice_nihongo.model.VocabFolder folder = vocabFolderRepository.findById(vocab.getFolder().getId()).orElse(null);
                existing.setFolder(folder);
            } else {
                existing.setFolder(null);
            }

            // Keep the original user associated with the personal vocabulary
            return vocabRepository.save(existing);
        }
        return null;
    }

    public void deleteVocab(Long id) {
        vocabRepository.deleteById(id);
    }
}
