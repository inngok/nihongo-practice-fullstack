package com.nihongo.practice_nihongo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import com.nihongo.practice_nihongo.model.ListeningLesson;
import com.nihongo.practice_nihongo.model.ListeningFile;
import com.nihongo.practice_nihongo.repository.ListeningLessonRepository;

@RestController
@RequestMapping("/api/crawler")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CrawlerController {

    @Autowired
    private ListeningLessonRepository listeningLessonRepository;

    public static class SaveLessonRequest {
        public String title;
        public String jlptLevel;
        public String originalUrl;
        public List<String> images;
        public List<SaveAudioRequest> audioFiles;
    }

    public static class SaveAudioRequest {
        public String fileName;
        public String audioUrl;
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveLesson(@RequestBody SaveLessonRequest request) {
        try {
            ListeningLesson lesson = new ListeningLesson();
            lesson.setTitle(request.title);
            lesson.setJlptLevel(request.jlptLevel);
            lesson.setOriginalUrl(request.originalUrl);
            
            if (request.images != null) {
                lesson.setImages(new ArrayList<>(request.images));
            }
            
            if (request.audioFiles != null) {
                List<ListeningFile> files = request.audioFiles.stream().map(a -> {
                    ListeningFile f = new ListeningFile();
                    f.setFileName(a.fileName);
                    f.setAudioUrl(a.audioUrl);
                    f.setLesson(lesson);
                    return f;
                }).collect(Collectors.toList());
                lesson.setAudioFiles(files);
            }
            
            ListeningLesson saved = listeningLessonRepository.save(lesson);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"Lỗi khi lưu vào DB: " + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/lessons")
    public ResponseEntity<?> getAllLessons() {
        try {
            List<ListeningLesson> lessons = listeningLessonRepository.findAll();
            return ResponseEntity.ok(lessons);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"Lỗi: " + e.getMessage() + "\"}");
        }
    }
    
    @DeleteMapping("/lessons/{id}")
    public ResponseEntity<?> deleteLesson(@PathVariable Long id) {
        try {
            listeningLessonRepository.deleteById(id);
            return ResponseEntity.ok("{\"message\": \"Đã xoá thành công\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"Lỗi: " + e.getMessage() + "\"}");
        }
    }

    // Crawler feature removed as requested
}
