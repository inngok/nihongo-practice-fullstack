package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.NewsArticle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    
    // Thread-safe list of active SSE connections
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        // Create an emitter with a 10-minute timeout (600,000 ms)
        SseEmitter emitter = new SseEmitter(600000L);
        
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((ex) -> emitters.remove(emitter));

        // Send an initial handshake event to prevent client-side connection timeout
        try {
            emitter.send(SseEmitter.event()
                    .name("INIT")
                    .data("Connected successfully to notifications stream!"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public void broadcastNewArticle(NewsArticle article) {
        log.info("Broadcasting new article notification to {} active clients: {}", emitters.size(), article.getTitle());
        
        List<SseEmitter> deadEmitters = new ArrayList<>();
        
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("NEW_ARTICLE")
                        .id(String.valueOf(article.getId()))
                        .data(article));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }
        
        emitters.removeAll(deadEmitters);
    }
    
    public void broadcastSystemMessage(String message) {
        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("SYSTEM")
                        .data(message));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }
        emitters.removeAll(deadEmitters);
    }

    public void broadcastDataChanged(String entityType) {
        log.info("Broadcasting DATA_CHANGED for {}", entityType);
        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("DATA_CHANGED")
                        .data(entityType));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }
        emitters.removeAll(deadEmitters);
    }
}
