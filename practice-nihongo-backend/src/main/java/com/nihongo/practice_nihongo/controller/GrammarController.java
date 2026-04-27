package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.Grammar;
import com.nihongo.practice_nihongo.service.GrammarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("/api/grammars")
@CrossOrigin(origins = "*")
@Tag(name = "Grammar Management", description = "APIs để quản lý các cấu trúc ngữ pháp tiếng Nhật")
public class GrammarController {

    @Autowired
    private GrammarService grammarService;

    // Lấy danh sách tất cả ngữ pháp
    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả ngữ pháp", description = "Trả về danh sách toàn bộ các cấu trúc ngữ pháp trong DB")
    public List<Grammar> getAllGrammars() {
        return grammarService.getAllGrammars();
    }

    // Thêm một cấu trúc ngữ pháp mới
    @PostMapping
    @Operation(summary = "Thêm ngữ pháp mới", description = "Lưu một cấu trúc ngữ pháp mới vào database")
    public Grammar createGrammar(@RequestBody Grammar grammar) {
        return grammarService.createGrammar(grammar);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy ngữ pháp theo ID", description = "Trả về thông tin chi tiết của một cấu trúc ngữ pháp")
    public Grammar getGrammarById(@PathVariable Long id) {
        return grammarService.getGrammarById(id);
    }

    // Cập nhật cấu trúc ngữ pháp
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật ngữ pháp", description = "Chỉnh sửa thông tin của cấu trúc ngữ pháp đã có")
    public Grammar updateGrammar(@PathVariable Long id, @RequestBody Grammar grammar) {
        return grammarService.updateGrammar(id, grammar);
    }

    // Xóa một cấu trúc ngữ pháp
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa ngữ pháp", description = "Xóa cấu trúc ngữ pháp khỏi database")
    public void deleteGrammar(@PathVariable Long id) {
        grammarService.deleteGrammar(id);
    }

    // Tìm kiếm theo Level (N1, N2...)
    @GetMapping("/level/{level}")
    @Operation(summary = "Lấy ngữ pháp theo cấp độ", description = "Lọc danh sách ngữ pháp theo N1, N2, N3, N4, N5")
    public List<Grammar> getByLevel(@PathVariable String level) {
        return grammarService.getByLevel(level);
    }
}
