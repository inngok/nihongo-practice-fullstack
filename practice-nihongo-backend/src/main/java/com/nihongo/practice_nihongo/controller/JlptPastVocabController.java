package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.dto.JlptPastVocabImportRequest;
import com.nihongo.practice_nihongo.model.JlptPastVocab;
import com.nihongo.practice_nihongo.model.User;
import com.nihongo.practice_nihongo.repository.UserRepository;
import com.nihongo.practice_nihongo.service.JlptPastVocabService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jlpt-vocabs")
@CrossOrigin(origins = "*")
public class JlptPastVocabController {

    private final JlptPastVocabService service;
    private final UserRepository userRepository;

    public JlptPastVocabController(JlptPastVocabService service, UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return userRepository.findByEmail(authentication.getName()).orElse(null);
        }
        return null;
    }

    @Operation(summary = "Lấy danh sách từ vựng JLPT đã ra đề")
    @GetMapping
    public ResponseEntity<List<JlptPastVocab>> getAll() {
        return ResponseEntity.ok(service.getAllVocabs());
    }

    @Operation(summary = "Import dữ liệu từ vựng JLPT (Chỉ Admin)")
    @PostMapping("/import")
    public ResponseEntity<Void> importData(@RequestBody JlptPastVocabImportRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        if (request.getExamPeriod() == null || request.getExamPeriod().trim().isEmpty() || request.getVocabs() == null) {
            return ResponseEntity.badRequest().build();
        }

        service.importVocabs(request.getVocabs(), request.getExamPeriod());
        return ResponseEntity.ok().build();
    }
}
