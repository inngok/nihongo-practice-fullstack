package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.RefreshToken;
import com.nihongo.practice_nihongo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    int deleteByUser(User user);
}
