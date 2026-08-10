package com.nihongo.practice_nihongo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Mã xác thực tài khoản Practice Nihongo");
        message.setText("Chào bạn,\n\n"
                + "Mã xác thực (OTP) của bạn là: " + otp + "\n"
                + "Mã này có hiệu lực trong vòng 3 phút.\n\n"
                + "Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\n"
                + "Trân trọng,\nPractice Nihongo");

        mailSender.send(message);
    }
}
