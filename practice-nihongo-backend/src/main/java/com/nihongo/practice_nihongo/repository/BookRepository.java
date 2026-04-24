package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
}
