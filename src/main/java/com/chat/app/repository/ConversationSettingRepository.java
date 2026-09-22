package com.chat.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chat.app.model.ConversationSetting;

public interface ConversationSettingRepository
        extends JpaRepository<ConversationSetting, Long> {

    Optional<ConversationSetting>
    findByParticipantOneAndParticipantTwo(
            String participantOne,
            String participantTwo
    );

    // =====================================================
    // ADMIN USER DELETE
    // =====================================================

    void deleteByParticipantOneOrParticipantTwo(
            String participantOne,
            String participantTwo
    );
}