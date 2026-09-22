package com.chat.app.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.chat.app.model.Message;
import com.chat.app.model.User;
import com.chat.app.repository.MessageRepository;
import com.chat.app.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;

    private final MessageRepository messageRepository;


    public AdminService(

            UserRepository userRepository,

            MessageRepository messageRepository

    ) {

        this.userRepository =
                userRepository;

        this.messageRepository =
                messageRepository;

    }


    // =====================================================
    // ADMIN DASHBOARD STATISTICS
    // =====================================================

    public Map<String, Object>
    getDashboardStatistics() {

        Map<String, Object> statistics =
                new HashMap<>();


        long totalUsers =
                userRepository.count();


        long onlineUsers =
                userRepository.countByOnlineTrue();


        long offlineUsers =
                userRepository.countByOnlineFalse();


        long totalMessages =
                messageRepository.count();


        long totalCalls =
                messageRepository
                        .findAll()
                        .stream()
                        .filter(message ->

                                "CALL".equalsIgnoreCase(
                                        message.getMessageType()
                                )

                        )
                        .count();


        statistics.put(
                "totalUsers",
                totalUsers
        );

        statistics.put(
                "onlineUsers",
                onlineUsers
        );

        statistics.put(
                "offlineUsers",
                offlineUsers
        );

        statistics.put(
                "totalMessages",
                totalMessages
        );

        statistics.put(
                "totalCalls",
                totalCalls
        );


        return statistics;
    }


    // =====================================================
    // GET ALL USERS
    // =====================================================

    public List<User> getAllUsers() {

        return userRepository.findAll();

    }


    // =====================================================
    // SEARCH USERS
    // =====================================================

    public List<User> searchUsers(
            String username
    ) {

        if (

                username == null

                ||

                username.trim().isEmpty()

        ) {

            return userRepository.findAll();

        }


        return userRepository
                .findByUsernameContainingIgnoreCase(
                        username.trim()
                );

    }


    // =====================================================
    // DELETE USER
    // =====================================================

    public void deleteUser(
            Long userId
    ) {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->

                                new RuntimeException(
                                        "User not found"
                                )

                        );


        userRepository.delete(
                user
        );

    }
 // =====================================================
 // GET USER DETAILS
 // =====================================================

 public User getUserById(
         Long userId
 ) {

     return userRepository
             .findById(
                     userId
             )
             .orElseThrow(() ->

                     new RuntimeException(
                             "User not found"
                     )

             );

 }
//=====================================================
//GET ALL MESSAGES FOR ADMIN
//=====================================================

public List<Message> getAllMessages() {

  return messageRepository.findAll();

}


//=====================================================
//DELETE MESSAGE FOR ADMIN
//=====================================================

public void deleteMessage(
      Long messageId
) {

  Message message =
          messageRepository
                  .findById(
                          messageId
                  )
                  .orElseThrow(() ->

                          new RuntimeException(
                                  "Message not found"
                          )

                  );


  messageRepository.delete(
          message
  );

}

//=====================================================
//GET ALL CALL HISTORY FOR ADMIN
//=====================================================

public List<Message> getAllCallHistory() {

 return messageRepository
         .findAll()
         .stream()
         .filter(message ->

                 "CALL".equalsIgnoreCase(
                         message.getMessageType()
                 )

         )
         .collect(
                 Collectors.toList()
         );

}


//=====================================================
//DELETE CALL HISTORY
//=====================================================

public void deleteCallHistory(
     Long callId
) {

 Message call =
         messageRepository
                 .findById(
                         callId
                 )
                 .orElseThrow(() ->

                         new RuntimeException(
                                 "Call history not found"
                         )

                 );


 // =============================================
 // VERIFY THIS IS A CALL
 // =============================================

 if (

         !"CALL".equalsIgnoreCase(
                 call.getMessageType()
         )

 ) {

     throw new RuntimeException(
             "This is not a call history"
     );

 }


 messageRepository.delete(
         call
 );

}

}