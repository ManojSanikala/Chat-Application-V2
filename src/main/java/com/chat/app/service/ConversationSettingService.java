package com.chat.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chat.app.model.ConversationSetting;
import com.chat.app.repository.ConversationSettingRepository;

@Service
public class ConversationSettingService {

    @Autowired
    private ConversationSettingRepository repository;

    public long getDurationSeconds(String user1, String user2) {
        String[] pair = canonicalPair(user1, user2);
        return repository.findByParticipantOneAndParticipantTwo(pair[0], pair[1])
                .map(ConversationSetting::getDisappearingSeconds)
                .orElse(0L);
    }

    @Transactional
    public long setDurationSeconds(String user1, String user2, long seconds) {
        if (seconds < 0 || seconds > 365L * 24 * 60 * 60) {
            throw new IllegalArgumentException("Disappearing message time must be between 0 and 365 days");
        }
        String[] pair = canonicalPair(user1, user2);
        ConversationSetting setting = repository.findByParticipantOneAndParticipantTwo(pair[0], pair[1])
                .orElseGet(ConversationSetting::new);
        setting.setParticipantOne(pair[0]);
        setting.setParticipantTwo(pair[1]);
        setting.setDisappearingSeconds(seconds);
        repository.save(setting);
        return seconds;
    }

    private String[] canonicalPair(String user1, String user2) {
        return user1.compareToIgnoreCase(user2) <= 0
                ? new String[] { user1, user2 }
                : new String[] { user2, user1 };
    }
}
