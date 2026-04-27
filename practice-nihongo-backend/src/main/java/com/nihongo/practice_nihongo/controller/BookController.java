package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.Book;
import com.nihongo.practice_nihongo.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
@Tag(name = "Book Management", description = "APIs để quản lý các giáo trình ngữ pháp (Mimikara, Soumatome, v.v.)")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả giáo trình", description = "Trả về danh sách toàn bộ các cuốn sách đang có trong hệ thống")
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin giáo trình theo ID", description = "Tìm kiếm một cuốn sách cụ thể bằng ID của nó")
    public Book getBookById(@PathVariable Long id) {
        return bookService.getBookById(id);
    }

    @PostMapping
    @Operation(summary = "Thêm giáo trình mới", description = "Tạo mới một cuốn sách giáo trình vào database")
    public Book createBook(@RequestBody Book book) {
        return bookService.createBook(book);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật giáo trình", description = "Cập nhật thông tin của một cuốn sách đã tồn tại")
    public Book updateBook(@PathVariable Long id, @RequestBody Book book) {
        return bookService.updateBook(id, book);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa giáo trình", description = "Xóa hoàn toàn một cuốn sách khỏi hệ thống")
    public void deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
    }
}
