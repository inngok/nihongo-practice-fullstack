package com.nihongo.practice_nihongo.service;

import com.nihongo.practice_nihongo.model.NewsArticle;
import com.nihongo.practice_nihongo.model.Notification;
import com.nihongo.practice_nihongo.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {
    
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    
    // Thread-safe list of active SSE connections
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        // Create an emitter with no timeout (-1L)
        SseEmitter emitter = new SseEmitter(-1L);
        
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
        // Save to DB first
        Notification notification = new Notification(
                "Bài báo mới: " + article.getTitle(),
                "Có một bài báo mới vừa được đăng.",
                "NEW_ARTICLE",
                String.valueOf(article.getId())
        );
        notificationRepository.save(notification);

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
        // Save to DB first
        Notification notification = new Notification(
                "Thông báo hệ thống",
                message,
                "SYSTEM",
                null
        );
        notificationRepository.save(notification);

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

    @Scheduled(fixedRate = 45000) // Send heartbeat every 45 seconds
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;
        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("ping").data("keep-alive"));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        emitters.removeAll(deadEmitters);
    }
}
