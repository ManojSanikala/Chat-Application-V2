package com.chat.app.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chat.app.dto.AdminDashboardResponse;
import com.chat.app.model.FriendRequest;
import com.chat.app.model.Message;
import com.chat.app.model.User;
import com.chat.app.model.UserBlock;
import com.chat.app.service.AdminService;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // =====================================================
    // DASHBOARD
    // =====================================================

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStatistics());
    }

    // =====================================================
    // USERS
    // =====================================================

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<User>> searchUsers(
            @RequestParam(value = "username", required = false) String username) {

        return ResponseEntity.ok(adminService.searchUsers(username));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserById(userId));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {

        return ResponseEntity.ok(adminService.updateUser(userId, request));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<User> changeUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            Principal principal) {

        return ResponseEntity.ok(
                adminService.changeUserRole(
                        userId,
                        request.get("role"),
                        principal.getName()
                )
        );
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<User> changeUserStatus(
            @PathVariable Long userId,
            @RequestParam boolean enabled,
            Principal principal) {

        return ResponseEntity.ok(
                adminService.changeUserStatus(
                        userId,
                        enabled,
                        principal.getName()
                )
        );
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long userId,
            Principal principal) {

        adminService.deleteUser(userId, principal.getName());
        return ResponseEntity.ok("User deleted successfully");
    }

    // =====================================================
    // MESSAGES
    // =====================================================

    @GetMapping("/messages")
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(adminService.getAllMessages());
    }

    @GetMapping("/messages/search")
    public ResponseEntity<List<Message>> searchMessages(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sender", required = false) String sender,
            @RequestParam(value = "receiver", required = false) String receiver,
            @RequestParam(value = "messageType", required = false) String messageType,
            @RequestParam(value = "status", required = false) String status) {

        return ResponseEntity.ok(
                adminService.searchMessages(
                        keyword,
                        sender,
                        receiver,
                        messageType,
                        status
                )
        );
    }

    @GetMapping("/messages/{messageId}")
    public ResponseEntity<Message> getMessageDetails(
            @PathVariable Long messageId) {

        return ResponseEntity.ok(adminService.getMessageDetails(messageId));
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<String> deleteMessage(
            @PathVariable Long messageId) {

        adminService.deleteMessage(messageId);
        return ResponseEntity.ok("Message deleted successfully");
    }

    // =====================================================
    // CALL HISTORY
    // =====================================================

    @GetMapping("/calls")
    public ResponseEntity<List<Message>> getAllCallHistory() {
        return ResponseEntity.ok(adminService.getAllCallHistory());
    }

    @GetMapping("/calls/search")
    public ResponseEntity<List<Message>> searchCallHistory(
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "callType", required = false) String callType,
            @RequestParam(value = "callDirection", required = false) String callDirection,
            @RequestParam(value = "callStatus", required = false) String callStatus) {

        return ResponseEntity.ok(
                adminService.searchCallHistory(
                        username,
                        callType,
                        callDirection,
                        callStatus
                )
        );
    }

    @GetMapping("/calls/{callId}")
    public ResponseEntity<Message> getCallDetails(
            @PathVariable Long callId) {

        return ResponseEntity.ok(adminService.getCallDetails(callId));
    }

    @DeleteMapping("/calls/{callId}")
    public ResponseEntity<String> deleteCallHistory(
            @PathVariable Long callId) {

        adminService.deleteCallHistory(callId);
        return ResponseEntity.ok("Call history deleted successfully");
    }

    // =====================================================
    // FRIEND REQUEST MANAGEMENT
    // =====================================================

    @GetMapping("/friend-requests")
    public ResponseEntity<List<FriendRequest>> getAllFriendRequests() {
        return ResponseEntity.ok(adminService.getAllFriendRequests());
    }

    @GetMapping("/friend-requests/search")
    public ResponseEntity<List<FriendRequest>> searchFriendRequests(
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "status", required = false) String status) {

        return ResponseEntity.ok(
                adminService.searchFriendRequests(username, status)
        );
    }

    @DeleteMapping("/friend-requests/{requestId}")
    public ResponseEntity<String> deleteFriendRequest(
            @PathVariable Long requestId) {

        adminService.deleteFriendRequest(requestId);
        return ResponseEntity.ok("Friend request deleted successfully");
    }

    // =====================================================
    // USER BLOCK MANAGEMENT
    // =====================================================

    @GetMapping("/blocks")
    public ResponseEntity<List<UserBlock>> getAllBlocks() {
        return ResponseEntity.ok(adminService.getAllBlocks());
    }

    @GetMapping("/blocks/search")
    public ResponseEntity<List<UserBlock>> searchBlocks(
            @RequestParam(value = "username", required = false) String username) {

        return ResponseEntity.ok(adminService.searchBlocks(username));
    }

    @DeleteMapping("/blocks/{blockId}")
    public ResponseEntity<String> deleteBlock(
            @PathVariable Long blockId) {

        adminService.deleteBlock(blockId);
        return ResponseEntity.ok("Block removed successfully");
    }
}
