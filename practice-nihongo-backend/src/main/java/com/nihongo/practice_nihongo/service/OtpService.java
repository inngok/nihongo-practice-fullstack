package com.nihongo.practice_nihongo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String OTP_PREFIX = "OTP_VERIFY_";
    private static final long OTP_VALIDITY_MINUTES = 3;

    public String generateAndStoreOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        redisTemplate.opsForValue().set(OTP_PREFIX + email, otp, OTP_VALIDITY_MINUTES, TimeUnit.MINUTES);
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        String storedOtp = redisTemplate.opsForValue().get(OTP_PREFIX + email);
        if (storedOtp != null && storedOtp.equals(otp)) {
            redisTemplate.delete(OTP_PREFIX + email); // Clean up after successful validation
            return true;
        }
        return false;
    }
}
