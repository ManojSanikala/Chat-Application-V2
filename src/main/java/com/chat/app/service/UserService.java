package com.chat.app.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chat.app.dto.UserRequest;
import com.chat.app.dto.UserResponse;
import com.chat.app.enums.MessageStatus;
import com.chat.app.exception.UserNotFoundException;
import com.chat.app.model.User;
import com.chat.app.repository.MessageRepository;
import com.chat.app.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /*
     * =====================================================
     * Register New User
     * Encrypts password and saves user into database.
     * =====================================================
     */
    public UserResponse addUser(UserRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already in use");
        }

        User user = new User();

        user.setUsername(request.getUsername());

        // Encrypt password before storing
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.isOnline(),
                user.getLastSeen()
        );
    }

    /*
     * =====================================================
     * Get Currently Logged-in User
     * Used after JWT authentication.
     * =====================================================
     */
    public UserResponse getCurrentUser(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String username, com.chat.app.dto.UserProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setDisplayName(clean(request.getDisplayName(), 100));
        user.setEmail(clean(request.getEmail(), 120));
        user.setBio(clean(request.getBio(), 500));
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(clean(request.getProfilePicture(), 500));
        }
        return toUserResponse(userRepository.save(user));
    }

    private String clean(String value, int max) {
        if (value == null) return null;
        String v = value.trim();
        return v.length() > max ? v.substring(0, max) : v;
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse(user.getId(), user.getUsername(), user.getRole(), user.isOnline(), user.getLastSeen());
        response.setDisplayName(user.getDisplayName());
        response.setEmail(user.getEmail());
        response.setBio(user.getBio());
        response.setProfilePicture(user.getProfilePicture());
        return response;
    }

    /*
     * =====================================================
     * Get All Registered Users
     * Also returns unread message count for each user.
     * =====================================================
     */
    public List<UserResponse> getAllUsers(
            String loggedInUsername
    ) {

        List<User> users =
                userRepository.findAll();

        return users.stream()

                .filter(user ->
                        !user.getUsername()
                                .equals(loggedInUsername)
                )

                .filter(user ->
                        !"ADMIN".equalsIgnoreCase(
                                user.getRole()
                        )
                )

                .map(user -> {

                    long unreadCount =
                            messageRepository
                                    .countBySenderUsernameAndReceiverUsernameAndStatus(
                                            user.getUsername(),
                                            loggedInUsername,
                                            MessageStatus.DELIVERED
                                    );

                    /*
                     * IMPORTANT
                     *
                     * Use the same profile response method.
                     *
                     * This includes:
                     *
                     * displayName
                     * email
                     * bio
                     * profilePicture
                     */
                    UserResponse response =
                            toUserResponse(user);

                    response.setUnreadCount(
                            unreadCount
                    );

                    return response;

                })

                .toList();
    }
    /*
     * =====================================================
     * Update User Online Status
     * Called when WebSocket CONNECT event occurs.
     * =====================================================
     */
    @Transactional
    public void updateOnlineStatus(String username, boolean online) {

        User user = userRepository.findByUsername(username)

                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        user.setOnline(online);

        userRepository.save(user);

        System.out.println(username + " is ONLINE");
    }

    /*
     * =====================================================
     * Update User Offline Status
     * Called when WebSocket DISCONNECT event occurs.
     * Also stores Last Seen time.
     * =====================================================
     */
    @Transactional
    public void updateOfflineStatus(String username) {

        User user = userRepository.findByUsername(username)

                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        user.setOnline(false);

        user.setLastSeen(LocalDateTime.now().toString());

        userRepository.save(user);

        System.out.println(username + " is OFFLINE");
    }

    /*
     * =====================================================
     * Check Whether Username Already Exists
     * Used during registration.
     * =====================================================
     */
    public boolean userExists(String username) {

        return userRepository.existsByUsername(username);
    }

    /*
     * =====================================================
     * Delete User By Username
     * Throws exception if user does not exist.
     * =====================================================
     */
    public boolean removeUser(String username) {

        if (!userRepository.existsByUsername(username)) {

            throw new UserNotFoundException(
                    "User '" + username + "' not found."
            );
        }

        userRepository.deleteByUsername(username);

        return true;
    }

}
