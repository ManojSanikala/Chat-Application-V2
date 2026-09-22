package com.chat.app.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chat.app.model.Message;
import com.chat.app.model.User;
import com.chat.app.service.AdminService;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;


    public AdminController(
            AdminService adminService
    ) {

        this.adminService =
                adminService;

    }


    // =====================================================
    // ADMIN DASHBOARD STATISTICS
    // =====================================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>>
    getAdminDashboard() {

        return ResponseEntity.ok(
                adminService
                        .getDashboardStatistics()
        );

    }


    // =====================================================
    // GET ALL USERS
    // =====================================================

    @GetMapping("/users")
    public ResponseEntity<List<User>>
    getAllUsers() {

        return ResponseEntity.ok(
                adminService.getAllUsers()
        );

    }


    // =====================================================
    // SEARCH USERS
    // =====================================================

    @GetMapping("/users/search")
    public ResponseEntity<List<User>>
    searchUsers(

            @RequestParam(
                    value = "username",
                    required = false
            )
            String username

    ) {

        return ResponseEntity.ok(

                adminService.searchUsers(
                        username
                )

        );

    }


    // =====================================================
    // DELETE USER
    // =====================================================

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String>
    deleteUser(

            @PathVariable
            Long userId

    ) {

        adminService.deleteUser(
                userId
        );

        return ResponseEntity.ok(
                "User deleted successfully"
        );

    }
 // =====================================================
 // GET USER DETAILS
 // =====================================================

 @GetMapping("/users/{userId}")
 public ResponseEntity<User>
 getUserById(
         @PathVariable
         Long userId

 ) {

     return ResponseEntity.ok(

             adminService.getUserById(
                     userId
             )

     );

 }
//=====================================================
//GET ALL MESSAGES
//=====================================================

@GetMapping("/messages")
public ResponseEntity<List<Message>>
getAllMessages() {

  return ResponseEntity.ok(

          adminService.getAllMessages()

  );

}


//=====================================================
//DELETE MESSAGE
//=====================================================

@DeleteMapping("/messages/{messageId}")
public ResponseEntity<String>
deleteMessage(

      @PathVariable
      Long messageId

) {

  adminService.deleteMessage(
          messageId
  );

  return ResponseEntity.ok(
          "Message deleted successfully"
  );

}
//=====================================================
//GET ALL CALL HISTORY
//=====================================================

@GetMapping("/calls")
public ResponseEntity<List<Message>>
getAllCallHistory() {

 return ResponseEntity.ok(

         adminService.getAllCallHistory()

 );

}


//=====================================================
//DELETE CALL HISTORY
//=====================================================

@DeleteMapping("/calls/{callId}")
public ResponseEntity<String>
deleteCallHistory(

     @PathVariable
     Long callId

) {

 adminService.deleteCallHistory(
         callId
 );

 return ResponseEntity.ok(
         "Call history deleted successfully"
 );

}

}