package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.Vocab;
import com.nihongo.practice_nihongo.service.VocabService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vocabs")
@CrossOrigin(origins = "*")
public class VocabController {

    private final VocabService vocabService;

    public VocabController(VocabService vocabService) {
        this.vocabService = vocabService;
    }

    @GetMapping
    public List<Vocab> getAllVocabs() {
        return vocabService.getAllVocabs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vocab> getVocabById(@PathVariable Long id) {
        Vocab vocab = vocabService.getVocabById(id);
        return vocab != null ? ResponseEntity.ok(vocab) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Vocab createVocab(@RequestBody Vocab vocab) {
        return vocabService.createVocab(vocab);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<Vocab>> createVocabsBulk(@RequestBody List<Vocab> vocabs) {
        return ResponseEntity.ok(vocabService.createVocabsBulk(vocabs));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vocab> updateVocab(@PathVariable Long id, @RequestBody Vocab vocab) {
        Vocab updated = vocabService.updateVocab(id, vocab);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVocab(@PathVariable Long id) {
        vocabService.deleteVocab(id);
        return ResponseEntity.ok().build();
    }
}
