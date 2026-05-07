package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.Vocab;
import com.nihongo.practice_nihongo.service.VocabService;
import com.nihongo.practice_nihongo.repository.UserRepository;
import com.nihongo.practice_nihongo.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import java.util.List;

@RestController
@RequestMapping("/api/vocabs")
@CrossOrigin(origins = "*")
public class VocabController {

    private final VocabService vocabService;
    private final UserRepository userRepository;

    public VocabController(VocabService vocabService, UserRepository userRepository) {
        this.vocabService = vocabService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return userRepository.findByEmail(authentication.getName()).orElse(null);
        }
        return null;
    }

    @Operation(summary = "Lấy danh sách từ vựng cá nhân (Từ tự thêm)")
    @GetMapping("/my")
    public ResponseEntity<List<Vocab>> getMyVocabs() {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(vocabService.getPersonalVocabs(currentUser.getId()));
    }

    @Operation(summary = "Lấy danh sách tất cả từ vựng")
    @GetMapping
    public List<Vocab> getAllVocabs(
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) Integer week,
            @RequestParam(required = false) Integer day,
            @RequestParam(required = false, defaultValue = "false") boolean includePersonal) {
        
        User currentUser = getCurrentUser();
        
        if (bookId != null && week != null && day != null) {
            return vocabService.getVocabsByBookWeekDay(bookId, week, day);
        } else if (bookId != null) {
            return vocabService.getVocabsByBook(bookId);
        }

        if (includePersonal && currentUser != null) {
            return vocabService.getSystemAndPersonalVocabs(currentUser.getId());
        }
        
        return vocabService.getAllVocabs();
    }

    @Operation(summary = "Lấy thông tin từ vựng theo ID")
    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<Vocab> getVocabById(@PathVariable Long id) {
        Vocab vocab = vocabService.getVocabById(id);
        return vocab != null ? ResponseEntity.ok(vocab) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Thêm từ vựng mới")
    @PostMapping
    public Vocab createVocab(@RequestBody Vocab vocab) {
        User currentUser = getCurrentUser();
        if (currentUser != null && !"ADMIN".equals(currentUser.getRole())) {
            vocab.setUser(currentUser);
        }
        return vocabService.createVocab(vocab);
    }

    @Operation(summary = "Thêm nhiều từ vựng cùng lúc (Bulk Insert)")
    @PostMapping("/bulk")
    public ResponseEntity<List<Vocab>> createVocabsBulk(@RequestBody List<Vocab> vocabs) {
        return ResponseEntity.ok(vocabService.createVocabsBulk(vocabs));
    }

    @Operation(summary = "Cập nhật từ vựng")
    @PutMapping("/{id:[0-9]+}")
    public ResponseEntity<Vocab> updateVocab(@PathVariable Long id, @RequestBody Vocab vocab) {
        Vocab updated = vocabService.updateVocab(id, vocab);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Xóa từ vựng")
    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<Void> deleteVocab(@PathVariable Long id) {
        vocabService.deleteVocab(id);
        return ResponseEntity.ok().build();
    }
}
