package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.User;
import com.nihongo.practice_nihongo.model.UserProgress;
import com.nihongo.practice_nihongo.repository.UserProgressRepository;
import com.nihongo.practice_nihongo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin
public class UserProgressController {

    private final UserProgressRepository progressRepository;
    private final UserRepository userRepository;

    public UserProgressController(UserProgressRepository progressRepository, UserRepository userRepository) {
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{key}")
    public ResponseEntity<?> getProgress(@PathVariable String key, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "User not found"));

        return progressRepository.findByUserIdAndProgressKey(user.getId(), key)
                .map(p -> ResponseEntity.ok(Map.of("data", p.getProgressData())))
                .orElse(ResponseEntity.ok(Map.of("data", "")));
    }

    @PostMapping("/{key}")
    public ResponseEntity<?> saveProgress(@PathVariable String key, @RequestBody Map<String, String> body, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "User not found"));

        String data = body.getOrDefault("data", "");
        
        UserProgress progress = progressRepository.findByUserIdAndProgressKey(user.getId(), key)
                .orElse(new UserProgress(user, key, ""));
        progress.setProgressData(data);
        progressRepository.save(progress);

        return ResponseEntity.ok(Map.of("message", "Progress saved"));
    }
}
