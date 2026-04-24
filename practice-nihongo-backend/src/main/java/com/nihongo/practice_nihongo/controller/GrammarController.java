package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.Grammar;
import com.nihongo.practice_nihongo.service.GrammarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grammars")
@CrossOrigin(origins = "*") // Để sau này Frontend có thể gọi vào mà không bị lỗi CORS
public class GrammarController {

    @Autowired
    private GrammarService grammarService;

    // Lấy danh sách tất cả ngữ pháp
    @GetMapping
    public List<Grammar> getAllGrammars() {
        return grammarService.getAllGrammars();
    }

    // Thêm một cấu trúc ngữ pháp mới
    @PostMapping
    public Grammar createGrammar(@RequestBody Grammar grammar) {
        return grammarService.createGrammar(grammar);
    }

    // Tìm kiếm theo Level (N1, N2...)
    @GetMapping("/level/{level}")
    public List<Grammar> getByLevel(@PathVariable String level) {
        return grammarService.getByLevel(level);
    }
}
