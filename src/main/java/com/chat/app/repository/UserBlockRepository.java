package com.chat.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chat.app.model.UserBlock;

public interface UserBlockRepository
        extends JpaRepository<UserBlock, Long> {

    boolean existsByBlockerUsernameAndBlockedUsername(
            String blockerUsername,
            String blockedUsername
    );

    Optional<UserBlock>
    findByBlockerUsernameAndBlockedUsername(
            String blockerUsername,
            String blockedUsername
    );

    void deleteByBlockerUsernameAndBlockedUsername(
            String blockerUsername,
            String blockedUsername
    );

    // =====================================================
    // ADMIN USER DELETE
    // =====================================================

    void deleteByBlockerUsernameOrBlockedUsername(
            String blockerUsername,
            String blockedUsername
    );
}