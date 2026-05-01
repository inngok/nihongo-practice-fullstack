package com.nihongo.practice_nihongo.controller;

import com.nihongo.practice_nihongo.dto.AuthRequest;
import com.nihongo.practice_nihongo.dto.AuthResponse;
import com.nihongo.practice_nihongo.dto.RegisterRequest;
import com.nihongo.practice_nihongo.dto.TokenRefreshRequest;
import com.nihongo.practice_nihongo.dto.TokenRefreshResponse;
import com.nihongo.practice_nihongo.model.RefreshToken;
import com.nihongo.practice_nihongo.model.User;
import com.nihongo.practice_nihongo.repository.UserRepository;
import com.nihongo.practice_nihongo.security.CustomUserDetailsService;
import com.nihongo.practice_nihongo.security.JwtUtil;
import com.nihongo.practice_nihongo.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

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

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) throws Exception {
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
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
            return ResponseEntity.ok(new AuthResponse(jwt, refreshToken.getToken(), user.getId(), user.getName(), user.getEmail(), user.getRole()));
        }
        
        return ResponseEntity.badRequest().body("User not found");
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email đã được sử dụng!");
        }

        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .build();

        userRepository.save(user);

        // Auto login after register
        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return ResponseEntity.ok(new AuthResponse(jwt, refreshToken.getToken(), user.getId(), user.getName(), user.getEmail(), user.getRole()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshtoken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                    String token = jwtUtil.generateToken(userDetails);
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }
}
