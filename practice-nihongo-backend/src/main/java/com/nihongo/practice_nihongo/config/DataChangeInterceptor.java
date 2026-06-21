package com.nihongo.practice_nihongo.config;

import com.nihongo.practice_nihongo.service.NotificationService;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class DataChangeInterceptor implements HandlerInterceptor {

    private final NotificationService notificationService;

    public DataChangeInterceptor(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String method = request.getMethod();
        if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method)) {
            if (response.getStatus() >= 200 && response.getStatus() < 300) {
                String path = request.getRequestURI();
                if (path.contains("/api/vocabs") || path.contains("/api/kanjis") || path.contains("/api/grammars") || path.contains("/api/books") || path.contains("/api/jlpt-past-vocabs")) {
                    notificationService.broadcastDataChanged("DATA_UPDATED");
                }
            }
        }
    }
}
