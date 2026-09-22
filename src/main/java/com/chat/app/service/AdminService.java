package com.chat.app.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chat.app.dto.AdminDashboardResponse;
import com.chat.app.enums.FriendRequestStatus;
import com.chat.app.enums.MessageStatus;
import com.chat.app.exception.UserNotFoundException;
import com.chat.app.model.FriendRequest;
import com.chat.app.model.Message;
import com.chat.app.model.User;
import com.chat.app.model.UserBlock;
import com.chat.app.repository.ConversationSettingRepository;
import com.chat.app.repository.FriendRequestRepository;
import com.chat.app.repository.MessageReactionRepository;
import com.chat.app.repository.MessageRepository;
import com.chat.app.repository.UserBlockRepository;
import com.chat.app.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final MessageReactionRepository messageReactionRepository;
    private final UserBlockRepository userBlockRepository;
    private final ConversationSettingRepository conversationSettingRepository;

    public AdminService(
            UserRepository userRepository,
            MessageRepository messageRepository,
            FriendRequestRepository friendRequestRepository,
            MessageReactionRepository messageReactionRepository,
            UserBlockRepository userBlockRepository,
            ConversationSettingRepository conversationSettingRepository) {

        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.messageReactionRepository = messageReactionRepository;
        this.userBlockRepository = userBlockRepository;
        this.conversationSettingRepository = conversationSettingRepository;
    }

    // =====================================================
    // DASHBOARD
    // =====================================================

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStatistics() {

        AdminDashboardResponse response = new AdminDashboardResponse();

        response.setTotalUsers(userRepository.count());
        response.setOnlineUsers(userRepository.countByOnlineTrue());
        response.setOfflineUsers(userRepository.countByOnlineFalse());
        response.setTotalMessages(messageRepository.count());
        response.setTotalFriendRequests(friendRequestRepository.count());
        response.setTotalCalls(
                messageRepository.countByMessageTypeIgnoreCase("CALL")
        );

        return response;
    }

    // =====================================================
    // USERS
    // =====================================================

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<User> searchUsers(String username) {

        if (isBlank(username)) {
            return userRepository.findAll();
        }

        return userRepository.findByUsernameContainingIgnoreCase(
                username.trim()
        );
    }

    @Transactional(readOnly = true)
    public User getUserById(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(
                        () -> new UserNotFoundException("User not found")
                );
    }

    @Transactional
    public User updateUser(
            Long userId,
            Map<String, String> request) {

        User user = getUserById(userId);

        if (request.containsKey("displayName")) {
            String displayName = clean(request.get("displayName"));

            if (displayName != null && displayName.length() > 100) {
                throw new IllegalArgumentException(
                        "Display name must be 100 characters or fewer"
                );
            }

            user.setDisplayName(displayName);
        }

        if (request.containsKey("email")) {
            String email = clean(request.get("email"));

            if (email != null && email.length() > 120) {
                throw new IllegalArgumentException(
                        "Email must be 120 characters or fewer"
                );
            }

            user.setEmail(email);
        }

        if (request.containsKey("bio")) {
            String bio = clean(request.get("bio"));

            if (bio != null && bio.length() > 500) {
                throw new IllegalArgumentException(
                        "Bio must be 500 characters or fewer"
                );
            }

            user.setBio(bio);
        }

        return userRepository.save(user);
    }

    @Transactional
    public User changeUserRole(
            Long userId,
            String role,
            String adminUsername) {

        User user = getUserById(userId);

        if (isBlank(role)) {
            throw new IllegalArgumentException(
                    "Role is required"
            );
        }

        String normalizedRole =
                role.trim().toUpperCase(Locale.ROOT);

        /*
         * Only USER role can be assigned through
         * the admin dashboard.
         *
         * The application has exactly one ADMIN account.
         * A second ADMIN cannot be created or promoted.
         */
        if (!"USER".equals(normalizedRole)) {

            throw new IllegalArgumentException(
                    "Only USER role can be assigned. "
                    + "The application has one ADMIN account."
            );
        }

        /*
         * The currently logged-in ADMIN cannot
         * change their own role.
         */
        if (user.getUsername()
                .equalsIgnoreCase(adminUsername)) {

            throw new IllegalArgumentException(
                    "The currently logged-in admin cannot "
                    + "change their own role."
            );
        }

        user.setRole("USER");

        return userRepository.save(user);
    }
    @Transactional
    public User changeUserStatus(
            Long userId,
            boolean enabled,
            String adminUsername) {

        User user = getUserById(userId);

        if (user.getUsername().equalsIgnoreCase(adminUsername)) {
            throw new IllegalArgumentException(
                    "The currently logged-in admin cannot change their own account status"
            );
        }

        user.setAccountEnabled(enabled);

        if (!enabled) {
            user.setOnline(false);
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(
            Long userId,
            String adminUsername) {

        User user = getUserById(userId);

        if (user.getUsername().equalsIgnoreCase(adminUsername)) {
            throw new IllegalArgumentException(
                    "Admin cannot delete the currently logged-in account"
            );
        }

        String username = user.getUsername();

        List<Message> userMessages =
                messageRepository.findBySenderUsernameOrReceiverUsername(
                        username,
                        username
                );

        if (!userMessages.isEmpty()) {
            List<Long> messageIds = userMessages.stream()
                    .map(Message::getId)
                    .filter(id -> id != null)
                    .toList();

            if (!messageIds.isEmpty()) {
                messageReactionRepository.deleteByMessageIdIn(messageIds);
            }

            messageRepository.deleteAll(userMessages);
        }

        friendRequestRepository
                .deleteBySenderUsernameOrReceiverUsername(
                        username,
                        username
                );

        userBlockRepository
                .deleteByBlockerUsernameOrBlockedUsername(
                        username,
                        username
                );

        conversationSettingRepository
                .deleteByParticipantOneOrParticipantTwo(
                        username,
                        username
                );

        userRepository.delete(user);
    }

    // =====================================================
    // MESSAGES
    // =====================================================

    @Transactional(readOnly = true)
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    @Transactional
    public void deleteMessage(Long messageId) {

        Message message = messageRepository.findById(messageId)
                .orElseThrow(
                        () -> new IllegalArgumentException("Message not found")
                );

        messageReactionRepository.deleteByMessageIdIn(
                List.of(messageId)
        );

        messageRepository.delete(message);
    }

    @Transactional(readOnly = true)
    public List<Message> searchMessages(
            String keyword,
            String sender,
            String receiver,
            String messageType,
            String status) {

        return messageRepository.findAll()
                .stream()
                .filter(message ->
                        matchesText(message.getContent(), keyword)
                )
                .filter(message ->
                        matchesMessageUser(message.getSender(), sender)
                )
                .filter(message ->
                        matchesMessageUser(message.getReceiver(), receiver)
                )
                .filter(message ->
                        isBlank(messageType)
                                || (
                                message.getMessageType() != null
                                && message.getMessageType()
                                        .equalsIgnoreCase(messageType.trim())
                        )
                )
                .filter(message ->
                        isBlank(status)
                                || (
                                message.getStatus() != null
                                && message.getStatus().name()
                                        .equalsIgnoreCase(status.trim())
                        )
                )
                .sorted(newestMessageComparator())
                .toList();
    }

    @Transactional(readOnly = true)
    public Message getMessageDetails(Long messageId) {

        return messageRepository.findById(messageId)
                .orElseThrow(
                        () -> new IllegalArgumentException("Message not found")
                );
    }

    // =====================================================
    // CALL HISTORY
    // =====================================================

    @Transactional(readOnly = true)
    public List<Message> getAllCallHistory() {
        return messageRepository
                .findByMessageTypeIgnoreCaseOrderByIdDesc("CALL");
    }

    @Transactional(readOnly = true)
    public List<Message> searchCallHistory(
            String username,
            String callType,
            String callDirection,
            String callStatus) {

        return messageRepository
                .findByMessageTypeIgnoreCaseOrderByIdDesc("CALL")
                .stream()
                .filter(call ->
                        matchesMessageUser(call.getSender(), username)
                                || matchesMessageUser(
                                call.getReceiver(),
                                username
                        )
                )
                .filter(call ->
                        isBlank(callType)
                                || (
                                call.getCallType() != null
                                && call.getCallType()
                                        .equalsIgnoreCase(callType.trim())
                        )
                )
                .filter(call ->
                        isBlank(callDirection)
                                || (
                                call.getCallDirection() != null
                                && call.getCallDirection()
                                        .equalsIgnoreCase(
                                                callDirection.trim()
                                        )
                        )
                )
                .filter(call ->
                        isBlank(callStatus)
                                || (
                                call.getCallStatus() != null
                                && call.getCallStatus()
                                        .equalsIgnoreCase(callStatus.trim())
                        )
                )
                .toList();
    }

    @Transactional(readOnly = true)
    public Message getCallDetails(Long callId) {

        Message call = messageRepository.findById(callId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Call history not found"
                        )
                );

        if (!"CALL".equalsIgnoreCase(call.getMessageType())) {
            throw new IllegalArgumentException(
                    "This record is not call history"
            );
        }

        return call;
    }

    @Transactional
    public void deleteCallHistory(Long callId) {

        Message call = messageRepository.findById(callId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Call history not found"
                        )
                );

        if (!"CALL".equalsIgnoreCase(call.getMessageType())) {
            throw new IllegalArgumentException(
                    "This is not a call history"
            );
        }

        messageReactionRepository.deleteByMessageIdIn(
                List.of(callId)
        );

        messageRepository.delete(call);
    }

    // =====================================================
    // FRIEND REQUEST MANAGEMENT
    // =====================================================

    @Transactional(readOnly = true)
    public List<FriendRequest> getAllFriendRequests() {

        List<FriendRequest> requests =
                friendRequestRepository.findAll();

        initializeFriendRequestUsers(requests);

        return requests.stream()
                .sorted(newestFriendRequestComparator())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FriendRequest> searchFriendRequests(
            String username,
            String status) {

        List<FriendRequest> requests =
                friendRequestRepository.findAll();

        initializeFriendRequestUsers(requests);

        return requests.stream()
                .filter(request ->
                        matchesFriendRequestUser(request, username)
                )
                .filter(request ->
                        isBlank(status)
                                || (
                                request.getStatus() != null
                                && request.getStatus().name()
                                        .equalsIgnoreCase(status.trim())
                        )
                )
                .sorted(newestFriendRequestComparator())
                .toList();
    }

    @Transactional
    public void deleteFriendRequest(Long requestId) {

        FriendRequest request =
                friendRequestRepository.findById(requestId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Friend request not found"
                                )
                        );

        friendRequestRepository.delete(request);
    }

    // =====================================================
    // USER BLOCK MANAGEMENT
    // =====================================================

    @Transactional(readOnly = true)
    public List<UserBlock> getAllBlocks() {

        return userBlockRepository.findAll()
                .stream()
                .sorted(newestBlockComparator())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserBlock> searchBlocks(String username) {

        if (isBlank(username)) {
            return getAllBlocks();
        }

        String search = username.trim().toLowerCase(Locale.ROOT);

        return userBlockRepository.findAll()
                .stream()
                .filter(block ->
                        containsIgnoreCase(
                                block.getBlockerUsername(),
                                search
                        )
                                || containsIgnoreCase(
                                block.getBlockedUsername(),
                                search
                        )
                )
                .sorted(newestBlockComparator())
                .toList();
    }

    @Transactional
    public void deleteBlock(Long blockId) {

        UserBlock block =
                userBlockRepository.findById(blockId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Block not found"
                                )
                        );

        userBlockRepository.delete(block);
    }

    // =====================================================
    // HELPERS
    // =====================================================

    private void initializeFriendRequestUsers(
            List<FriendRequest> requests) {

        requests.forEach(request -> {
            if (request.getSender() != null) {
                request.getSender().getUsername();
            }

            if (request.getReceiver() != null) {
                request.getReceiver().getUsername();
            }
        });
    }

    private boolean matchesFriendRequestUser(
            FriendRequest request,
            String username) {

        if (isBlank(username)) {
            return true;
        }

        String search = username.trim().toLowerCase(Locale.ROOT);

        return request.getSender() != null
                && containsIgnoreCase(
                request.getSender().getUsername(),
                search
        )
                || request.getReceiver() != null
                && containsIgnoreCase(
                request.getReceiver().getUsername(),
                search
        );
    }

    private boolean matchesMessageUser(
            User user,
            String username) {

        return isBlank(username)
                || (
                user != null
                && containsIgnoreCase(
                        user.getUsername(),
                        username.trim().toLowerCase(Locale.ROOT)
                )
        );
    }

    private boolean matchesText(
            String value,
            String searchText) {

        return isBlank(searchText)
                || containsIgnoreCase(
                value,
                searchText.trim().toLowerCase(Locale.ROOT)
        );
    }

    private boolean containsIgnoreCase(
            String value,
            String lowercaseSearch) {

        return value != null
                && lowercaseSearch != null
                && value.toLowerCase(Locale.ROOT)
                        .contains(lowercaseSearch);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }

        String cleaned = value.trim();
        return cleaned.isEmpty() ? null : cleaned;
    }

    private Comparator<Message> newestMessageComparator() {
        return Comparator.comparing(
                        Message::getId,
                        Comparator.nullsFirst(Long::compareTo)
                )
                .reversed();
    }

    private Comparator<FriendRequest> newestFriendRequestComparator() {
        return Comparator.comparing(
                        FriendRequest::getId,
                        Comparator.nullsFirst(Long::compareTo)
                )
                .reversed();
    }

    private Comparator<UserBlock> newestBlockComparator() {
        return Comparator.comparing(
                        UserBlock::getId,
                        Comparator.nullsFirst(Long::compareTo)
                )
                .reversed();
    }
}
