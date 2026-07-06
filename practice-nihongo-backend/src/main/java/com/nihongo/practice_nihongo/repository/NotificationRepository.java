package com.nihongo.practice_nihongo.repository;

import com.nihongo.practice_nihongo.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop20ByOrderByCreatedAtDesc();
}
