package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.PersonalVocab;
import com.nihongo.practice_nihongo.model.User;
import com.nihongo.practice_nihongo.service.PersonalVocabService;
import com.nihongo.practice_nihongo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;

@RestController
@RequestMapping("/api/personal-vocabs")
@CrossOrigin(origins = "*")
public class PersonalVocabController {

    private final PersonalVocabService personalVocabService;
    private final UserRepository userRepository;

    public PersonalVocabController(PersonalVocabService personalVocabService, UserRepository userRepository) {
        this.personalVocabService = personalVocabService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return userRepository.findByEmail(authentication.getName()).orElse(null);
        }
        return null;
    }

    @Operation(summary = "Lấy danh sách từ vựng sổ tay cá nhân")
    @GetMapping
    public ResponseEntity<List<PersonalVocab>> getMyVocabs() {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(personalVocabService.getPersonalVocabs(currentUser.getId()));
    }

    @Operation(summary = "Lấy từ vựng theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<PersonalVocab> getById(@PathVariable Long id) {
        PersonalVocab vocab = personalVocabService.getById(id);
        if (vocab == null) return ResponseEntity.notFound().build();
        
        User currentUser = getCurrentUser();
        if (currentUser == null || !vocab.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(vocab);
    }

    @Operation(summary = "Thêm từ vựng mới vào sổ tay")
    @PostMapping
    public ResponseEntity<PersonalVocab> create(@RequestBody PersonalVocab vocab) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        vocab.setUser(currentUser);
        return ResponseEntity.ok(personalVocabService.create(vocab));
    }

    @Operation(summary = "Cập nhật từ vựng sổ tay")
    @PutMapping("/{id}")
    public ResponseEntity<PersonalVocab> update(@PathVariable Long id, @RequestBody PersonalVocab vocab) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        PersonalVocab existing = personalVocabService.getById(id);
        if (existing == null) return ResponseEntity.notFound().build();
        if (!existing.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(personalVocabService.update(id, vocab));
    }

    @Operation(summary = "Xóa từ vựng khỏi sổ tay")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        PersonalVocab existing = personalVocabService.getById(id);
        if (existing == null) return ResponseEntity.notFound().build();
        if (!existing.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        personalVocabService.delete(id);
        return ResponseEntity.ok().build();
    }
}
