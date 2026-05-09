package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.Book;
import com.nihongo.practice_nihongo.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Book> getAllBooks() {
        List<Book> books = bookRepository.findAll();
        boolean needsUpdate = false;
        for (Book book : books) {
            if (book.getType() == null) {
                String titleLower = book.getTitle().toLowerCase();
                if (titleLower.contains("hán tự") || titleLower.contains("kanji") || titleLower.contains("chữ hán")) {
                    book.setType("KANJI");
                } else if (titleLower.contains("ngữ pháp") || titleLower.contains("grammar") || titleLower.contains("cấu trúc")) {
                    book.setType("GRAMMAR");
                } else {
                    book.setType("VOCABULARY");
                }
                bookRepository.save(book);
            }
        }
        return books;
    }

    public Book getBookById(Long id) {
        Book book = bookRepository.findById(id).orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        if (book.getType() == null) {
            book.setType("VOCABULARY");
            bookRepository.save(book);
        }
        return book;
    }

    public Book createBook(Book book) {
        if (book.getType() == null) {
            book.setType("VOCABULARY");
        }
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book bookDetails) {
        Book book = getBookById(id);
        book.setTitle(bookDetails.getTitle());
        book.setJapaneseTitle(bookDetails.getJapaneseTitle());
        book.setLevelLabel(bookDetails.getLevelLabel());
        book.setNum(bookDetails.getNum());
        book.setType(bookDetails.getType() != null ? bookDetails.getType() : "VOCABULARY");
        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        Book book = getBookById(id);
        bookRepository.delete(book);
    }
}
