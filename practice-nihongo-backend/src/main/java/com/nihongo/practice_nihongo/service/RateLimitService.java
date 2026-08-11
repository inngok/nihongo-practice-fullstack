package com.nihongo.practice_nihongo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RateLimitService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final int MAX_REQUESTS = 5;
    private static final long TIME_WINDOW_MINUTES = 5;

    public boolean isAllowed(String ipAddress, String action) {
        String key = "rate_limit:" + action + ":" + ipAddress;
        
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            // First time setting the key, set expiration
            redisTemplate.expire(key, TIME_WINDOW_MINUTES, TimeUnit.MINUTES);
        }

        return count != null && count <= MAX_REQUESTS;
    }
}
