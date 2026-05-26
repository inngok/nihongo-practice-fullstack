package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.model.ConfusingGrammarGroup;
import com.nihongo.practice_nihongo.service.ConfusingGrammarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/confusing-grammars")
@CrossOrigin(origins = "*")
public class ConfusingGrammarController {

    @Autowired
    private ConfusingGrammarService service;

    @GetMapping
    public List<ConfusingGrammarGroup> getAllGroups() {
        return service.getAllGroups();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConfusingGrammarGroup> getGroupById(@PathVariable Long id) {
        return service.getGroupById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ConfusingGrammarGroup createGroup(@RequestBody ConfusingGrammarGroup group) {
        return service.saveGroup(group);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        service.deleteGroup(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/explain")
    public ResponseEntity<Map<String, String>> explainGroup(@PathVariable Long id) {
        try {
            String explanationJson = service.explainGroupWithAi(id);
            return ResponseEntity.ok(Map.of("data", explanationJson));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/generate-ai")
    public ResponseEntity<Map<String, String>> generateAi(@RequestBody Map<String, Object> payload) {
        try {
            String title = (String) payload.get("title");
            String description = (String) payload.get("description");
            List<String> patterns = (List<String>) payload.get("patterns");
            
            String generatedJson = service.generateConfusingGrammarGroupWithAi(title, description, patterns);
            return ResponseEntity.ok(Map.of("data", generatedJson));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/generate-ai-prompt")
    public ResponseEntity<Map<String, String>> generateAiPrompt(@RequestBody Map<String, String> payload) {
        try {
            String prompt = payload.get("prompt");
            String generatedJson = service.generateConfusingGrammarGroupWithAiPrompt(prompt);
            return ResponseEntity.ok(Map.of("data", generatedJson));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
