package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.Vocab;
import com.nihongo.practice_nihongo.service.VocabService;
import com.nihongo.practice_nihongo.repository.UserRepository;
import com.nihongo.practice_nihongo.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import java.util.Map;

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

    @Operation(summary = "Lấy danh sách tất cả từ vựng hệ thống")
    @GetMapping
    public List<Vocab> getAllVocabs(
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) Integer week,
            @RequestParam(required = false) Integer day) {
        
        if (bookId != null && week != null && day != null) {
            return vocabService.getVocabsByBookWeekDay(bookId, week, day);
        } else if (bookId != null) {
            return vocabService.getVocabsByBook(bookId);
        }
        
        return vocabService.getSystemVocabs();
    }

    @Operation(summary = "Lấy thông tin từ vựng theo ID")
    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<Vocab> getVocabById(@PathVariable Long id) {
        Vocab vocab = vocabService.getVocabById(id);
        return vocab != null ? ResponseEntity.ok(vocab) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Thêm từ vựng mới (Chỉ Admin)")
    @PostMapping
    public ResponseEntity<Vocab> createVocab(@RequestBody Vocab vocab) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        
        return ResponseEntity.ok(vocabService.createVocab(vocab));
    }

    @Operation(summary = "Thêm nhiều từ vựng cùng lúc (Bulk Insert - Chỉ Admin)")
    @PostMapping("/bulk")
    public ResponseEntity<List<Vocab>> createVocabsBulk(@RequestBody List<Vocab> vocabs) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        
        return ResponseEntity.ok(vocabService.createVocabsBulk(vocabs));
    }

    @Operation(summary = "Cập nhật từ vựng (Chỉ Admin)")
    @PutMapping("/{id:[0-9]+}")
    public ResponseEntity<Vocab> updateVocab(@PathVariable Long id, @RequestBody Vocab vocab) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Vocab existing = vocabService.getVocabById(id);
        if (existing == null) return ResponseEntity.notFound().build();

        Vocab updated = vocabService.updateVocab(id, vocab);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Cập nhật hàng loạt (Chỉ Admin)")
    @PutMapping("/bulk-update")
    public ResponseEntity<Void> bulkUpdateVocabs(@RequestBody Map<String, Object> request) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        List<Integer> idInts = (List<Integer>) request.get("ids");
        List<Long> ids = idInts.stream().map(Integer::longValue).toList();
        Integer week = request.get("week") != null ? (Integer) request.get("week") : null;
        Integer day = request.get("day") != null ? (Integer) request.get("day") : null;

        vocabService.bulkUpdateVocabs(ids, week, day);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Xóa từ vựng (Chỉ Admin)")
    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<Void> deleteVocab(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Vocab existing = vocabService.getVocabById(id);
        if (existing == null) return ResponseEntity.notFound().build();

        vocabService.deleteVocab(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Xóa tất cả từ vựng hoặc theo sách")
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllVocabs(@RequestParam(required = false) Long bookId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (bookId != null) {
            vocabService.deleteVocabsByBook(bookId);
        } else {
            vocabService.deleteAllVocabs();
        }
        return ResponseEntity.ok().build();
    }
}
