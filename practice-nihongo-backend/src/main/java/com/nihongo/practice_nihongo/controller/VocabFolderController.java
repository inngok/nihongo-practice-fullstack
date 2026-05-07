package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.User;
import com.nihongo.practice_nihongo.model.VocabFolder;
import com.nihongo.practice_nihongo.repository.UserRepository;
import com.nihongo.practice_nihongo.service.VocabFolderService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vocab-folders")
@CrossOrigin(origins = "*")
public class VocabFolderController {

    private final VocabFolderService vocabFolderService;
    private final UserRepository userRepository;

    public VocabFolderController(VocabFolderService vocabFolderService, UserRepository userRepository) {
        this.vocabFolderService = vocabFolderService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return userRepository.findByEmail(authentication.getName()).orElse(null);
        }
        return null;
    }

    @Operation(summary = "Lấy danh sách tất cả thư mục cá nhân")
    @GetMapping
    public ResponseEntity<List<VocabFolder>> getMyFolders() {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(vocabFolderService.getFoldersByUser(currentUser.getId()));
    }

    @Operation(summary = "Thêm thư mục mới")
    @PostMapping
    public ResponseEntity<VocabFolder> createFolder(@RequestBody VocabFolder folder) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();
        folder.setUser(currentUser);
        return ResponseEntity.ok(vocabFolderService.createFolder(folder));
    }

    @Operation(summary = "Cập nhật thông tin thư mục")
    @PutMapping("/{id:[0-9]+}")
    public ResponseEntity<VocabFolder> updateFolder(@PathVariable Long id, @RequestBody VocabFolder folder) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();
        VocabFolder updated = vocabFolderService.updateFolder(id, folder);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Xóa thư mục")
    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();
        vocabFolderService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }
}
