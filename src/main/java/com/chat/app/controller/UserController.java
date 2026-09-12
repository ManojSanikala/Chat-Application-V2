package com.chat.app.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chat.app.dto.UserRequest;
import com.chat.app.dto.UserResponse;
import com.chat.app.dto.UserProfileRequest;
import com.chat.app.service.UserService;
import com.chat.app.service.UserBlockService;
import com.chat.app.dto.BlockStatusResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/user")
public class UserController {
	@Autowired
	private UserService userService;

	@Autowired
	private UserBlockService userBlockService;
	
	@PostMapping("/join")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<UserResponse> joinUser(@Valid @RequestBody UserRequest request) {
		UserResponse response = userService.addUser(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	@GetMapping("/me")
	public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {

	    UserResponse user = userService.getCurrentUser(authentication.getName());

	    return ResponseEntity.ok(user);
	}
	
	/*
	 * =====================================================
	 * Get All Users
	 * Returns all users except the logged-in user along with
	 * unread message count.
	 * =====================================================
	 */
	@GetMapping("/all")
	public List<UserResponse> getAllUsers(Principal principal) {

	    return userService.getAllUsers(principal.getName());

	}

	@GetMapping("/profile/{username}")
	public ResponseEntity<UserResponse> getUserProfile(@PathVariable String username) {
	    return ResponseEntity.ok(userService.getCurrentUser(username));
	}

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateMyProfile(@RequestBody UserProfileRequest request, Principal principal) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }

	@GetMapping("/block/status/{username}")
	public ResponseEntity<BlockStatusResponse> getBlockStatus(
	        @PathVariable String username, Principal principal) {
	    return ResponseEntity.ok(new BlockStatusResponse(
	            userBlockService.isBlockedBy(principal.getName(), username)));
	}

	@PostMapping("/block/{username}")
	public ResponseEntity<BlockStatusResponse> blockUser(
	        @PathVariable String username, Principal principal) {
	    userBlockService.block(principal.getName(), username);
	    return ResponseEntity.ok(new BlockStatusResponse(true));
	}

	@DeleteMapping("/block/{username}")
	public ResponseEntity<BlockStatusResponse> unblockUser(
	        @PathVariable String username, Principal principal) {
	    userBlockService.unblock(principal.getName(), username);
	    return ResponseEntity.ok(new BlockStatusResponse(false));
	}
	
	@DeleteMapping("/leave/{name}")
	public ResponseEntity<String> leaveUser(@PathVariable String name, Principal principal){
		if (!name.equals(principal.getName())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own account");
		}
		 userService.removeUser(name);
		
		return ResponseEntity.ok("User removed successfully");
	}
}
