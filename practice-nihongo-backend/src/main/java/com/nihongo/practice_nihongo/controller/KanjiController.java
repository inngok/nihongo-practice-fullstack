package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.Kanji;
import com.nihongo.practice_nihongo.service.KanjiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import java.util.List;

@RestController
@RequestMapping("/api/kanjis")
@CrossOrigin(origins = "*")
public class KanjiController {

    private final KanjiService kanjiService;

    public KanjiController(KanjiService kanjiService) {
        this.kanjiService = kanjiService;
    }

    @Operation(summary = "Lấy danh sách tất cả Kanji")
    @GetMapping
    public List<Kanji> getAllKanjis(
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) Integer week,
            @RequestParam(required = false) Integer day) {
        if (bookId != null && week != null && day != null) {
            return kanjiService.getKanjisByBookWeekDay(bookId, week, day);
        } else if (bookId != null) {
            return kanjiService.getKanjisByBook(bookId);
        }
        return kanjiService.getAllKanjis();
    }

    @Operation(summary = "Lấy thông tin Kanji theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<Kanji> getKanjiById(@PathVariable Long id) {
        Kanji kanji = kanjiService.getKanjiById(id);
        return kanji != null ? ResponseEntity.ok(kanji) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Thêm Kanji mới")
    @PostMapping
    public Kanji createKanji(@RequestBody Kanji kanji) {
        return kanjiService.createKanji(kanji);
    }

    @Operation(summary = "Thêm nhiều Kanji cùng lúc (Bulk Insert)")
    @PostMapping("/bulk")
    public ResponseEntity<List<Kanji>> createKanjisBulk(@RequestBody List<Kanji> kanjis) {
        return ResponseEntity.ok(kanjiService.createKanjisBulk(kanjis));
    }

    @Operation(summary = "Cập nhật thông tin Kanji")
    @PutMapping("/{id}")
    public ResponseEntity<Kanji> updateKanji(@PathVariable Long id, @RequestBody Kanji kanji) {
        Kanji updated = kanjiService.updateKanji(id, kanji);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Xóa Kanji")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKanji(@PathVariable Long id) {
        kanjiService.deleteKanji(id);
        return ResponseEntity.ok().build();
    }
}
