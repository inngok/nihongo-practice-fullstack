package com.nihongo.practice_nihongo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nihongo.practice_nihongo.model.ConfusingGrammarGroup;
import com.nihongo.practice_nihongo.model.ConfusingGrammarPoint;
import com.nihongo.practice_nihongo.repository.ConfusingGrammarGroupRepository;
import com.nihongo.practice_nihongo.repository.ConfusingGrammarPointRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class ConfusingGrammarService {

    private final ConfusingGrammarGroupRepository groupRepository;
    private final ConfusingGrammarPointRepository pointRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ConfusingGrammarService(ConfusingGrammarGroupRepository groupRepository,
                                   ConfusingGrammarPointRepository pointRepository,
                                   AiService aiService) {
        this.groupRepository = groupRepository;
        this.pointRepository = pointRepository;
        this.aiService = aiService;
    }

    public List<ConfusingGrammarGroup> getAllGroups() {
        return groupRepository.findAll();
    }

    public Optional<ConfusingGrammarGroup> getGroupById(Long id) {
        return groupRepository.findById(id);
    }

    public ConfusingGrammarGroup saveGroup(ConfusingGrammarGroup group) {
        // Ensure reverse relationship is set correctly
        if (group.getItems() != null) {
            for (ConfusingGrammarPoint point : group.getItems()) {
                point.setGroup(group);
            }
        }
        return groupRepository.save(group);
    }

    public void deleteGroup(Long id) {
        groupRepository.deleteById(id);
    }

    public String explainGroupWithAi(Long id) throws Exception {
        ConfusingGrammarGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm ngữ pháp phân biệt có ID: " + id));

        // Create a simplified list of items to feed to the AI prompt
        List<Map<String, Object>> itemsList = group.getItems().stream().map(item -> {
            Map<String, Object> map = new HashMap<>();
            map.put("pattern", item.getPattern());
            map.put("baseMeaning", item.getBaseMeaning());
            map.put("nuance", item.getNuance());
            return map;
        }).toList();

        String itemsJson = objectMapper.writeValueAsString(itemsList);
        return aiService.explainConfusingGrammar(group.getTitle(), itemsJson);
    }

    public String generateConfusingGrammarGroupWithAi(String title, String description, List<String> patterns) throws Exception {
        return aiService.generateConfusingGrammarFromPatterns(title, description, patterns);
    }

    public String generateConfusingGrammarGroupWithAiPrompt(String prompt) throws Exception {
        return aiService.generateConfusingGrammarFromPrompt(prompt);
    }
}
