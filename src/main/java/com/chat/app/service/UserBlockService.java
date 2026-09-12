package com.chat.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chat.app.exception.UserNotFoundException;
import com.chat.app.model.UserBlock;
import com.chat.app.repository.UserBlockRepository;
import com.chat.app.repository.UserRepository;

@Service
public class UserBlockService {

    @Autowired
    private UserBlockRepository blockRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void block(String blocker, String blocked) {
        validateDifferentUsers(blocker, blocked);
        if (!userRepository.existsByUsername(blocked)) {
            throw new UserNotFoundException("User '" + blocked + "' not found");
        }
        if (!blockRepository.existsByBlockerUsernameAndBlockedUsername(blocker, blocked)) {
            blockRepository.save(new UserBlock(blocker, blocked));
        }
    }

    @Transactional
    public void unblock(String blocker, String blocked) {
        blockRepository.deleteByBlockerUsernameAndBlockedUsername(blocker, blocked);
    }

    public boolean isBlockedBy(String blocker, String blocked) {
        return blockRepository.existsByBlockerUsernameAndBlockedUsername(blocker, blocked);
    }

    public boolean isBlockedEither(String user1, String user2) {
        return isBlockedBy(user1, user2) || isBlockedBy(user2, user1);
    }

    private void validateDifferentUsers(String user1, String user2) {
        if (user1.equalsIgnoreCase(user2)) {
            throw new IllegalArgumentException("You cannot block yourself");
        }
    }
}
