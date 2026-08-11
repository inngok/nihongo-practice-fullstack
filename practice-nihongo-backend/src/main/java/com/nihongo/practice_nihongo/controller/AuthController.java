package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.dto.AuthRequest;
import com.nihongo.practice_nihongo.dto.AuthResponse;
import com.nihongo.practice_nihongo.dto.RegisterRequest;
import com.nihongo.practice_nihongo.dto.TokenRefreshRequest;
import com.nihongo.practice_nihongo.dto.TokenRefreshResponse;
import com.nihongo.practice_nihongo.dto.VerifyEmailRequest;
import com.nihongo.practice_nihongo.dto.ForgotPasswordRequest;
import com.nihongo.practice_nihongo.dto.ResetPasswordRequest;
import com.nihongo.practice_nihongo.model.RefreshToken;
import com.nihongo.practice_nihongo.model.User;
import com.nihongo.practice_nihongo.repository.UserRepository;
import com.nihongo.practice_nihongo.security.CustomUserDetailsService;
import com.nihongo.practice_nihongo.security.JwtUtil;
import com.nihongo.practice_nihongo.service.RefreshTokenService;
import com.nihongo.practice_nihongo.service.EmailService;
import com.nihongo.practice_nihongo.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;
import java.util.Map;
import com.nihongo.practice_nihongo.service.RateLimitService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private RateLimitService rateLimitService;

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip != null ? ip.split(",")[0].trim() : "unknown";
    }

    @Operation(summary = "Đăng nhập")
    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@jakarta.validation.Valid @RequestBody AuthRequest authRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Email hoặc mật khẩu không chính xác.");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);
        
        Optional<User> userOpt = userRepository.findByEmail(authRequest.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!user.isVerified()) {
                return ResponseEntity.badRequest().body("Tài khoản chưa được xác thực. Vui lòng xác thực email.");
            }
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
            return ResponseEntity.ok(new AuthResponse(jwt, refreshToken.getToken(), user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getJlptLevel()));
        }
        
        return ResponseEntity.badRequest().body("User not found");
    }

    @Operation(summary = "Đăng ký tài khoản mới")
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@jakarta.validation.Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        String ip = getClientIp(request);
        if (!rateLimitService.isAllowed(ip, "register")) {
            return ResponseEntity.status(429).body("Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 5 phút.");
        }
        Optional<User> existingUserOpt = userRepository.findByEmail(registerRequest.getEmail());
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.isVerified()) {
                return ResponseEntity.badRequest().body("Email đã được sử dụng!");
            }
            try {
                String otp = otpService.generateAndStoreOtp(registerRequest.getEmail());
                emailService.sendOtpEmail(registerRequest.getEmail(), otp);
                return ResponseEntity.ok(Map.of("message", "Vui lòng kiểm tra email để lấy mã xác thực.", "requiresVerification", true));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Lỗi khi gửi email xác thực.");
            }
        }

        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .jlptLevel(registerRequest.getJlptLevel() != null && !registerRequest.getJlptLevel().isEmpty() ? registerRequest.getJlptLevel() : "N3")
                .isVerified(false)
                .build();

        userRepository.save(user);

        try {
            String otp = otpService.generateAndStoreOtp(registerRequest.getEmail());
            emailService.sendOtpEmail(registerRequest.getEmail(), otp);
            return ResponseEntity.ok(Map.of("message", "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực.", "requiresVerification", true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Đăng ký thành công nhưng lỗi khi gửi email xác thực.");
        }
    }

    @Operation(summary = "Xác thực email")
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest body, HttpServletRequest request) {
        String ip = getClientIp(request);
        if (!rateLimitService.isAllowed(ip, "verify-email")) {
            return ResponseEntity.status(429).body("Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 5 phút.");
        }
        
        if (!otpService.validateOtp(body.getEmail(), body.getOtp())) {
            return ResponseEntity.badRequest().body("Mã xác thực không hợp lệ hoặc đã hết hạn.");
        }

        Optional<User> userOpt = userRepository.findByEmail(body.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Không tìm thấy tài khoản.");
        }

        User user = userOpt.get();
        user.setVerified(true);
        userRepository.save(user);

        // Auto login after verify
        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return ResponseEntity.ok(new AuthResponse(jwt, refreshToken.getToken(), user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getJlptLevel()));
    }

    @Operation(summary = "Làm mới token (Refresh Token)")
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshtoken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(oldToken -> {
                    User user = oldToken.getUser();
                    
                    // Xóa token cũ đã được sử dụng
                    refreshTokenService.deleteToken(oldToken);

                    // Tạo access token mới
                    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                    String token = jwtUtil.generateToken(userDetails);
                    // Tạo refresh token mới (rotation)
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
                    return ResponseEntity.ok(new TokenRefreshResponse(token, newRefreshToken.getToken()));
                })
                .orElse(ResponseEntity.status(401).body(null));
    }

    @Operation(summary = "Yêu cầu khôi phục mật khẩu (Gửi OTP)")
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@jakarta.validation.Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        if (!rateLimitService.isAllowed(ip, "forgot-password")) {
            return ResponseEntity.status(429).body("Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 5 phút.");
        }
        
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Email không tồn tại trong hệ thống.");
        }

        try {
            String otp = otpService.generateAndStoreOtp(request.getEmail());
            emailService.sendPasswordResetOtp(request.getEmail(), otp);
            return ResponseEntity.ok(Map.of("message", "Mã xác nhận khôi phục mật khẩu đã được gửi đến email của bạn."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi gửi email xác nhận.");
        }
    }

    @Operation(summary = "Đặt lại mật khẩu (Sử dụng OTP)")
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@jakarta.validation.Valid @RequestBody ResetPasswordRequest request, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        if (!rateLimitService.isAllowed(ip, "reset-password")) {
            return ResponseEntity.status(429).body("Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 5 phút.");
        }

        if (!otpService.validateOtp(request.getEmail(), request.getOtp())) {
            return ResponseEntity.badRequest().body("Mã xác thực không hợp lệ hoặc đã hết hạn.");
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Không tìm thấy tài khoản.");
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."));
    }
}
