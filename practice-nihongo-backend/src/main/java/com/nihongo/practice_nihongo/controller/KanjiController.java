package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.Kanji;
import com.nihongo.practice_nihongo.service.KanjiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kanjis")
@CrossOrigin(origins = "*")
public class KanjiController {

    private final KanjiService kanjiService;

    public KanjiController(KanjiService kanjiService) {
        this.kanjiService = kanjiService;
    }

    @GetMapping
    public List<Kanji> getAllKanjis() {
        return kanjiService.getAllKanjis();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Kanji> getKanjiById(@PathVariable Long id) {
        Kanji kanji = kanjiService.getKanjiById(id);
        return kanji != null ? ResponseEntity.ok(kanji) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Kanji createKanji(@RequestBody Kanji kanji) {
        return kanjiService.createKanji(kanji);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<Kanji>> createKanjisBulk(@RequestBody List<Kanji> kanjis) {
        return ResponseEntity.ok(kanjiService.createKanjisBulk(kanjis));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Kanji> updateKanji(@PathVariable Long id, @RequestBody Kanji kanji) {
        Kanji updated = kanjiService.updateKanji(id, kanji);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKanji(@PathVariable Long id) {
        kanjiService.deleteKanji(id);
        return ResponseEntity.ok().build();
    }
}
