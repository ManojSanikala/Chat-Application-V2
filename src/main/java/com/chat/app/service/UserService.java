package com.chat.app.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chat.app.dto.UserProfileRequest;
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
     * REGISTER NEW USER
     * =====================================================
     */
    @Transactional
    public UserResponse addUser(UserRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {

            throw new IllegalArgumentException(
                    "Username is already in use"
            );
        }

        User user = new User();

        user.setUsername(
                request.getUsername().trim()
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(
                request.getRole()
        );

        /*
         * New user starts offline.
         */
        user.setOnline(false);

        user.setLastSeen(null);

        User savedUser =
                userRepository.save(user);

        return toUserResponse(savedUser);
    }


    /*
     * =====================================================
     * GET CURRENT USER / USER PROFILE
     *
     * Used by:
     * GET /user/me
     * GET /user/profile/{username}
     *
     * Includes:
     * - Username
     * - Role
     * - Online Status
     * - Last Seen
     * - Display Name
     * - Email
     * - Bio
     * - Profile Picture
     * =====================================================
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(
            String username
    ) {

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "User not found"
                                )
                        );

        return toUserResponse(user);
    }


    /*
     * =====================================================
     * UPDATE MY PROFILE
     *
     * Used by:
     * PUT /user/profile
     *
     * Profile picture is expected to already contain
     * the uploaded image URL/path.
     * =====================================================
     */
    @Transactional
    public UserResponse updateProfile(
            String username,
            UserProfileRequest request
    ) {

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "User not found"
                                )
                        );

        user.setDisplayName(
                clean(
                        request.getDisplayName(),
                        100
                )
        );

        user.setEmail(
                clean(
                        request.getEmail(),
                        120
                )
        );

        user.setBio(
                clean(
                        request.getBio(),
                        500
                )
        );

        /*
         * Only update profile picture when value is sent.
         */
        if (request.getProfilePicture() != null) {

            user.setProfilePicture(
                    clean(
                            request.getProfilePicture(),
                            500
                    )
            );
        }

        User savedUser =
                userRepository.save(user);

        return toUserResponse(savedUser);
    }


    /*
     * =====================================================
     * CLEAN PROFILE INPUT
     * =====================================================
     */
    private String clean(
            String value,
            int maxLength
    ) {

        if (value == null) {
            return null;
        }

        String cleaned =
                value.trim();

        if (cleaned.isEmpty()) {
            return null;
        }

        if (cleaned.length() > maxLength) {

            return cleaned.substring(
                    0,
                    maxLength
            );
        }

        return cleaned;
    }


    /*
     * =====================================================
     * GET ALL USERS
     *
     * Excludes:
     * - Logged-in user
     * - ADMIN users
     *
     * Includes:
     * - Online status
     * - Last seen
     * - Profile details
     * - Unread message count
     *
     * NOTE:
     * If your frontend now uses /friends,
     * this method can still remain for existing functionality.
     * =====================================================
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(
            String loggedInUsername
    ) {

        List<User> users =
                userRepository.findAll();

        return users
                .stream()

                /*
                 * Do not show logged-in user.
                 */
                .filter(user ->
                        !user.getUsername()
                                .equalsIgnoreCase(
                                        loggedInUsername
                                )
                )

                /*
                 * Do not show ADMIN users.
                 */
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
     * UPDATE USER ONLINE STATUS
     *
     * Called when user connects.
     *
     * IMPORTANT:
     * When user becomes online,
     * we keep the existing lastSeen value.
     * Frontend should display ONLINE when online=true.
     * =====================================================
     */
    @Transactional
    public void updateOnlineStatus(
            String username,
            boolean online
    ) {

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "User not found"
                                )
                        );

        user.setOnline(online);

        userRepository.save(user);

        System.out.println(
                username +
                " is " +
                (online ? "ONLINE" : "OFFLINE")
        );
    }


    /*
     * =====================================================
     * UPDATE USER OFFLINE STATUS
     *
     * Called when user disconnects.
     *
     * Saves:
     * - online = false
     * - lastSeen = current time
     * =====================================================
     */
    @Transactional
    public void updateOfflineStatus(
            String username
    ) {

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "User not found"
                                )
                        );

        user.setOnline(false);

        user.setLastSeen(
                LocalDateTime.now().toString()
        );

        userRepository.save(user);

        System.out.println(
                username +
                " is OFFLINE"
        );
    }


    /*
     * =====================================================
     * CHECK USER EXISTS
     * =====================================================
     */
    @Transactional(readOnly = true)
    public boolean userExists(
            String username
    ) {

        return userRepository
                .existsByUsername(username);
    }


    /*
     * =====================================================
     * DELETE USER ACCOUNT
     * =====================================================
     */
    @Transactional
    public boolean removeUser(
            String username
    ) {

        if (!userRepository.existsByUsername(username)) {

            throw new UserNotFoundException(
                    "User '" +
                    username +
                    "' not found."
            );
        }

        userRepository.deleteByUsername(username);

        return true;
    }


    /*
     * =====================================================
     * SEARCH USERS
     *
     * Used by:
     * GET /user/search/{username}
     *
     * Features:
     *
     * - Search by username
     * - Case insensitive
     * - Excludes logged-in user
     * - Excludes ADMIN
     * - Returns profile details
     * - Returns online status
     * - Returns last seen
     *
     * Used before sending friend request.
     * =====================================================
     */
    @Transactional(readOnly = true)
    public List<UserResponse> searchUsers(
            String searchText,
            String loggedInUsername
    ) {

        if (searchText == null ||
                searchText.trim().isEmpty()) {

            return List.of();
        }

        return userRepository
                .findByUsernameContainingIgnoreCase(
                        searchText.trim()
                )
                .stream()

                /*
                 * Do not show current logged-in user.
                 */
                .filter(user ->
                        !user.getUsername()
                                .equalsIgnoreCase(
                                        loggedInUsername
                                )
                )

                /*
                 * Do not show admin accounts.
                 */
                .filter(user ->
                        !"ADMIN".equalsIgnoreCase(
                                user.getRole()
                        )
                )

                .map(this::toUserResponse)

                .toList();
    }


    /*
     * =====================================================
     * COMMON USER RESPONSE MAPPER
     *
     * IMPORTANT:
     *
     * Every API response now consistently contains:
     *
     * id
     * username
     * role
     * online
     * lastSeen
     * unreadCount
     * displayName
     * email
     * bio
     * profilePicture
     *
     * =====================================================
     */
    private UserResponse toUserResponse(
            User user
    ) {

        UserResponse response =
                new UserResponse();

        response.setId(
                user.getId()
        );

        response.setUsername(
                user.getUsername()
        );

        response.setRole(
                user.getRole()
        );

        response.setOnline(
                user.isOnline()
        );

        response.setLastSeen(
                user.getLastSeen()
        );

        response.setDisplayName(
                user.getDisplayName()
        );

        response.setEmail(
                user.getEmail()
        );

        response.setBio(
                user.getBio()
        );

        response.setProfilePicture(
                user.getProfilePicture()
        );

        /*
         * Default unread count.
         *
         * getAllUsers() calculates the actual
         * unread count separately.
         */
        response.setUnreadCount(0);

        return response;
    }
}