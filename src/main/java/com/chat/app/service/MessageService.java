package com.chat.app.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chat.app.dto.ChatHistoryResponse;
import com.chat.app.dto.MessageRequest;
import com.chat.app.dto.MessageResponse;
import com.chat.app.enums.MessageStatus;
import com.chat.app.exception.UserNotFoundException;
import com.chat.app.model.Message;
import com.chat.app.model.User;
import com.chat.app.repository.MessageRepository;
import com.chat.app.repository.UserRepository;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationSettingService conversationSettingService;

    @Autowired
    private FriendRequestService friendRequestService;
    /*
     * =====================================================
     * SAVE MESSAGE
     *
     * USED BY REST API
     *
     * IMPORTANT:
     *
     * Sender comes from logged-in user.
     *
     * Sender is NOT taken from frontend userId.
     *
     * Only accepted friends can send messages.
     * =====================================================
     */

    public Message saveMessage(

            String senderUsername,

            MessageRequest request

    ) {


        /*
         * =================================================
         * GET SENDER
         *
         * Sender comes from Principal.
         * =================================================
         */

        User sender =
                userRepository
                        .findByUsername(
                                senderUsername
                        )
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "Sender not found"
                                )
                        );


        /*
         * =================================================
         * GET RECEIVER
         * =================================================
         */

        User receiver =
                userRepository
                        .findById(
                                request.getReceiverId()
                        )
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "Receiver not found"
                                )
                        );


        /*
         * =================================================
         * PREVENT SELF MESSAGE
         * =================================================
         */

        if (

                sender.getUsername()
                        .equalsIgnoreCase(

                                receiver.getUsername()

                        )

        ) {

            throw new RuntimeException(
                    "You cannot send a message to yourself"
            );
        }


        /*
         * =================================================
         * FRIEND VALIDATION
         *
         * Users can send messages only if
         * friend request is ACCEPTED.
         * =================================================
         */

        if (

                !friendRequestService.areFriends(

                        sender.getUsername(),

                        receiver.getUsername()

                )

        ) {

            throw new RuntimeException(

                    "You can send messages only to accepted friends"

            );
        }


        /*
         * =================================================
         * CREATE MESSAGE
         * =================================================
         */

        Message message =
                new Message();


        message.setSender(
                sender
        );


        message.setReceiver(
                receiver
        );


        message.setContent(
                request.getContent()
        );


        message.setTimestamp(

                java.time.LocalDateTime
                        .now()
                        .toString()

        );


        message.setStatus(
                MessageStatus.SENT
        );


        message.setMessageType(
                "TEXT"
        );


        /*
         * =================================================
         * SAVE MESSAGE
         * =================================================
         */

        return messageRepository.save(
                message
        );
    }
 // =====================================================
 // USED BY WEBSOCKET
 // =====================================================

 public Message saveMessage(

         User sender,

         User receiver,

         String content

 ) {

     /*
      * =================================================
      * VALIDATE USERS
      * =================================================
      */

     if (sender == null) {

         throw new RuntimeException(
                 "Sender not found"
         );
     }


     if (receiver == null) {

         throw new RuntimeException(
                 "Receiver not found"
         );
     }


     /*
      * =================================================
      * PREVENT SELF MESSAGE
      * =================================================
      */

     if (

             sender.getUsername()
                     .equalsIgnoreCase(
                             receiver.getUsername()
                     )

     ) {

         throw new RuntimeException(
                 "You cannot send a message to yourself"
         );
     }


     /*
      * =================================================
      * FRIEND VALIDATION
      *
      * WebSocket messages can only be sent
      * between accepted friends.
      * =================================================
      */

     if (

             !friendRequestService.areFriends(

                     sender.getUsername(),

                     receiver.getUsername()

             )

     ) {

         throw new RuntimeException(

                 "You can send messages only to accepted friends"

         );
     }


     /*
      * =================================================
      * CONTENT VALIDATION
      * =================================================
      */

     if (

             content == null

             ||

             content.trim().isEmpty()

     ) {

         throw new RuntimeException(
                 "Message content cannot be empty"
         );
     }


     /*
      * =================================================
      * CREATE MESSAGE
      * =================================================
      */

     Message message =
             new Message();


     message.setSender(
             sender
     );


     message.setReceiver(
             receiver
     );


     message.setContent(
             content.trim()
     );


     /*
      * =================================================
      * TIMESTAMP
      * =================================================
      */

     message.setTimestamp(

             java.time.LocalDateTime
                     .now()
                     .toString()

     );


     /*
      * =================================================
      * STATUS
      * =================================================
      */

     message.setStatus(
             MessageStatus.SENT
     );


     /*
      * =================================================
      * MESSAGE TYPE
      * =================================================
      */

     message.setMessageType(
             "TEXT"
     );


     /*
      * =================================================
      * SAVE MESSAGE
      * =================================================
      */

     return messageRepository.save(
             message
     );
 }

//=====================================================
//SAVE PRIVATE MESSAGE
//=====================================================

public Message savePrivateMessage(

      String senderUsername,

      String receiverUsername,

      String content,

      Long replyToMessageId,

      String replyToContent,

      String messageType,

      String fileName,

      boolean forwarded) {

  /*
   * =================================================
   * NEW: PREVENT SELF MESSAGE
   * =================================================
   */

  if (
          senderUsername == null
          ||
          receiverUsername == null
  ) {

      throw new RuntimeException(
              "Sender and receiver are required"
      );
  }


  if (
          senderUsername.equalsIgnoreCase(
                  receiverUsername
          )
  ) {

      throw new RuntimeException(
              "You cannot send a message to yourself"
      );
  }


  /*
   * =================================================
   * FRIEND VALIDATION
   * =================================================
   *
   * Users can send private messages only after
   * friend request is accepted.
   */

  if (!friendRequestService.areFriends(

          senderUsername,

          receiverUsername

  )) {

      throw new RuntimeException(

              "You can send messages only to accepted friends"

      );
  }


  /*
   * =================================================
   * EXISTING CODE - DO NOT CHANGE
   * =================================================
   */

  User sender =

          userRepository

              .findByUsername(

                  senderUsername

              )

              .orElseThrow(() ->

                  new UserNotFoundException(

                      "Sender not found"

                  )

              );


  User receiver =

          userRepository

              .findByUsername(

                  receiverUsername

              )

              .orElseThrow(() ->

                  new UserNotFoundException(

                      "Receiver not found"

                  )

              );


  Message message =

          new Message();


  message.setSender(

      sender

  );


  message.setReceiver(

      receiver

  );


  message.setContent(

      content

  );


  message.setTimestamp(

      java.time.LocalDateTime

          .now()

          .toString()

  );


  message.setStatus(

      MessageStatus.SENT

  );


  /*
   * =================================================
   * MESSAGE TYPE
   * =================================================
   *
   * If frontend does not send a type,
   * keep it as TEXT.
   */

  if (

      messageType == null ||

      messageType.trim().isEmpty()

  ) {

      message.setMessageType(

          "TEXT"

      );

  }

  else {

      message.setMessageType(

          messageType.toUpperCase()

      );

      message.setFileName(

          fileName

      );

  }


  /*
   * =================================================
   * REPLY INFORMATION
   * =================================================
   */

  message.setReplyToMessageId(

      replyToMessageId

  );

  message.setReplyToContent(

      replyToContent

  );


  /*
   * =================================================
   * FORWARDED MESSAGE
   * =================================================
   */

  message.setForwarded(

      forwarded

  );


  long disappearingSeconds =
          conversationSettingService
                  .getDurationSeconds(
                          senderUsername,
                          receiverUsername
                  );


  if (disappearingSeconds > 0) {

      message.setExpiresAt(

              System.currentTimeMillis()
                      +
              (disappearingSeconds * 1000L)

      );

  }


  return messageRepository.save(

      message

  );

}/*
     * =====================================================
     * SAVE CALL HISTORY
     * =====================================================
     */

    public Message saveCallHistory(

            String senderUsername,

            String receiverUsername,

            String callType,

            String callStatus,

            Long callDuration

    ) {

        /*
         * =================================================
         * GET USERS
         * =================================================
         */

        User sender =

                userRepository

                        .findByUsername(

                                senderUsername

                        )

                        .orElseThrow(

                                () ->

                                        new RuntimeException(

                                                "Sender not found"

                                        )

                        );


        User receiver =

                userRepository

                        .findByUsername(

                                receiverUsername

                        )

                        .orElseThrow(

                                () ->

                                        new RuntimeException(

                                                "Receiver not found"

                                        )

                        );


        /*
         * =================================================
         * CREATE CALL MESSAGE
         * =================================================
         */

        Message message =

                new Message();


        message.setSender(

                sender

        );


        message.setReceiver(

                receiver

        );


        /*
         * =================================================
         * MESSAGE TYPE
         * =================================================
         */

        message.setMessageType(

                "CALL"

        );


        /*
         * =================================================
         * CALL INFORMATION
         * =================================================
         */

        message.setCallType(

                callType

        );


        message.setCallStatus(

                callStatus

        );


        message.setCallDirection(

                "OUTGOING"

        );


        message.setCallDuration(

                callDuration != null

                        ? callDuration

                        : 0L

        );


        /*
         * =================================================
         * CONTENT
         *
         * Used as fallback for old UI.
         * =================================================
         */

        String content;


        if (

                "VIDEO".equalsIgnoreCase(

                        callType

                )

        ) {

            content =

                    "Video Call";

        }

        else {

            content =

                    "Voice Call";

        }


        message.setContent(

                content

        );


        /*
         * =================================================
         * TIMESTAMP
         * =================================================
         *
         * IMPORTANT:
         *
         * Use the SAME timestamp format
         * used in your existing savePrivateMessage().
         *
         * If your service already has a helper
         * for timestamp generation, use that.
         * =================================================
         */

        message.setTimestamp(

                java.time.LocalDateTime

                        .now()

                        .format(

                                java.time.format.DateTimeFormatter

                                        .ofPattern(

                                                "yyyy-MM-dd HH:mm:ss"

                                        )

                        )

        );


        /*
         * =================================================
         * STATUS
         * =================================================
         */

        message.setStatus(

                MessageStatus.SENT

        );


        /*
         * =================================================
         * SAVE
         * =================================================
         */

        return messageRepository.save(

                message

        );

    }
 // =====================================================
 // GET CONVERSATION HISTORY
 // =====================================================

 @Transactional(readOnly = true)
 public List<ChatHistoryResponse> getConversation(
         String user1,
         String user2
 ) {


     /*
      * =================================================
      * VALIDATE USERS
      * =================================================
      */

     if (
             user1 == null ||
             user1.trim().isEmpty()
     ) {

         throw new RuntimeException(
                 "Logged-in user not found"
         );
     }


     if (
             user2 == null ||
             user2.trim().isEmpty()
     ) {

         throw new RuntimeException(
                 "Receiver username is required"
         );
     }


     /*
      * =================================================
      * PREVENT SELF CONVERSATION
      * =================================================
      */

     if (
             user1.equalsIgnoreCase(
                     user2
             )
     ) {

         throw new RuntimeException(
                 "You cannot open a conversation with yourself"
         );
     }


     /*
      * =================================================
      * FRIEND VALIDATION
      *
      * Conversation can only be accessed
      * between accepted friends.
      * =================================================
      */

     if (
             !friendRequestService.areFriends(
                     user1,
                     user2
             )
     ) {

         throw new RuntimeException(
                 "You can view conversation only with accepted friends"
         );
     }


     /*
      * =================================================
      * GET CONVERSATION
      * =================================================
      */

     List<Message> messages =
             messageRepository.findConversation(
                     user1,
                     user2
             );


     /*
      * =================================================
      * FILTER MESSAGES
      * =================================================
      */

     return messages
             .stream()

             .filter(message -> {


                 /*
                  * =========================================
                  * SENDER DELETED MESSAGE FOR HIMSELF
                  * =========================================
                  */

                 if (

                         message.getSender() != null

                         &&

                         message.getSender()
                                 .getUsername()
                                 .equals(user1)

                         &&

                         message.isDeletedBySender()

                 ) {

                     return false;
                 }


                 /*
                  * =========================================
                  * RECEIVER DELETED MESSAGE FOR HIMSELF
                  * =========================================
                  */

                 if (

                         message.getReceiver() != null

                         &&

                         message.getReceiver()
                                 .getUsername()
                                 .equals(user1)

                         &&

                         message.isDeletedByReceiver()

                 ) {

                     return false;
                 }


                 /*
                  * =========================================
                  * DISAPPEARING MESSAGE EXPIRED
                  * =========================================
                  */

                 if (

                         message.getExpiresAt() != null

                         &&

                         message.getExpiresAt()
                                 <= System.currentTimeMillis()

                 ) {

                     return false;
                 }


                 return true;

             })


             /*
              * =============================================
              * CONVERT TO RESPONSE
              * =============================================
              */

             .map(message -> {


                 ChatHistoryResponse response =
                         new ChatHistoryResponse(

                                 message.getId(),

                                 message.getSender()
                                         .getUsername(),

                                 message.getContent(),

                                 message.getTimestamp(),

                                 message.getStatus(),

                                 message.isEdited(),

                                 message.getReplyToMessageId(),

                                 message.getReplyToContent(),

                                 message.getMessageType()
                         );


                 /*
                  * =========================================
                  * FILE INFORMATION
                  * =========================================
                  */

                 response.setFileName(
                         message.getFileName()
                 );


                 /*
                  * =========================================
                  * FORWARDED
                  * =========================================
                  */

                 response.setForwarded(
                         message.isForwarded()
                 );


                 /*
                  * =========================================
                  * DISAPPEARING MESSAGE
                  * =========================================
                  */

                 response.setExpiresAt(
                         message.getExpiresAt()
                 );


                 /*
                  * =========================================
                  * CALL HISTORY INFORMATION
                  * =========================================
                  */

                 if (

                         "CALL".equalsIgnoreCase(
                                 message.getMessageType()
                         )

                 ) {


                     response.setCallType(
                             message.getCallType()
                     );


                     /*
                      * =====================================
                      * CALL DIRECTION
                      * =====================================
                      */

                     if (

                             message.getSender()
                                     .getUsername()
                                     .equalsIgnoreCase(
                                             user1
                                     )

                     ) {

                         response.setCallDirection(
                                 "OUTGOING"
                         );

                     }

                     else {

                         response.setCallDirection(
                                 "INCOMING"
                         );

                     }


                     response.setCallStatus(
                             message.getCallStatus()
                     );


                     response.setCallDuration(
                             message.getCallDuration()
                     );

                 }


                 return response;

             })

             .toList();

 }

    // =====================================================
    // MARK AS DELIVERED
    // =====================================================

    public List<Message> markAsDelivered(
            String senderUsername,
            String receiverUsername) {


        List<Message> messages =
                messageRepository
                    .findBySenderUsernameAndReceiverUsernameAndStatus(
                        senderUsername,
                        receiverUsername,
                        MessageStatus.SENT
                    );


        for (
            Message message :
            messages
        ) {

            message.setStatus(
                MessageStatus.DELIVERED
            );

        }


        return messageRepository.saveAll(
            messages
        );
    }


    // =====================================================
    // MARK AS READ
    // =====================================================

    public List<Message> markAsRead(
            String senderUsername,
            String receiverUsername) {


        List<Message> messages =
                messageRepository
                    .findBySenderUsernameAndReceiverUsernameAndStatusIn(
                        senderUsername,
                        receiverUsername,
                        List.of(
                            MessageStatus.SENT,
                            MessageStatus.DELIVERED
                        )
                    );


        for (
            Message message :
            messages
        ) {

            message.setStatus(
                MessageStatus.READ
            );

        }


        return messageRepository.saveAll(
            messages
        );
    }


    // =====================================================
    // GET ALL MESSAGES
    // =====================================================

    public List<Message> getAllMessages() {

        return messageRepository.findAll();

    }


    // =====================================================
    // GET CHAT HISTORY
    // =====================================================

    public List<ChatHistoryResponse> getChatHistory() {

        return messageRepository
            .findAll()
            .stream()

            .map(message -> {

                ChatHistoryResponse response =
                        new ChatHistoryResponse(

                            message.getId(),

                            message.getSender()
                                   .getUsername(),

                            message.getContent(),

                            message.getTimestamp(),

                            message.getStatus(),

                            message.isEdited(),

                            message.getReplyToMessageId(),

                            message.getReplyToContent(),

                            message.getMessageType()
                        );

                response.setFileName(
                	    message.getFileName()
                	);

                	response.setForwarded(
                	    message.isForwarded()
                	);
                	response.setExpiresAt(
                	        message.getExpiresAt()
                	);

                	/*
                	 * =====================================================
                	 * CALL HISTORY INFORMATION
                	 * =====================================================
                	 */

                	if (
                	        "CALL".equalsIgnoreCase(
                	                message.getMessageType()
                	        )
                	) {

                	    response.setCallType(
                	            message.getCallType()
                	    );

                	    response.setCallDirection(
                	            message.getCallDirection()
                	    );

                	    response.setCallStatus(
                	            message.getCallStatus()
                	    );

                	    response.setCallDuration(
                	            message.getCallDuration()
                	    );

                	}
                	
                	return response;

            })

            .collect(
                Collectors.toList()
            );
    }


    // =====================================================
    // GET MESSAGE BY ID
    // =====================================================

    public Message getMessageById(
            Long messageId) {

        return messageRepository
            .findById(messageId)
            .orElseThrow(() ->
                new RuntimeException(
                    "Message not found"
                )
            );
    }


    // =====================================================
    // DELETE FOR ME
    // =====================================================

    public void deleteForMe(
            Long messageId,
            String username) {


        Message message =
                messageRepository
                    .findById(messageId)
                    .orElseThrow(() ->
                        new RuntimeException(
                            "Message not found"
                        )
                    );


        if (
            message.getSender()
                   .getUsername()
                   .equals(username)
        ) {

            message.setDeletedBySender(
                true
            );

        }
        else if (
            message.getReceiver()
                   .getUsername()
                   .equals(username)
        ) {

            message.setDeletedByReceiver(
                true
            );

        }
        else {

            throw new RuntimeException(
                "You are not allowed to delete this message"
            );
        }


        messageRepository.save(
            message
        );
    }


    // =====================================================
    // DELETE FOR EVERYONE
    // =====================================================

    public void deleteForEveryone(
            Long messageId,
            String username) {


        Message message =
                messageRepository
                    .findById(messageId)
                    .orElseThrow(() ->
                        new RuntimeException(
                            "Message not found"
                        )
                    );


        /*
         * Only sender can delete
         * for everyone.
         */

        if (
            !message.getSender()
                   .getUsername()
                   .equals(username)
        ) {

            throw new RuntimeException(
                "Only sender can delete this message for everyone"
            );
        }


        message.setContent(
            "This message was deleted"
        );


        message.setStatus(
            MessageStatus.DELETED
        );


        messageRepository.save(
            message
        );
    }


    // =====================================================
    // GET UNREAD COUNT
    // =====================================================

    public long getUnreadCount(
            String sender,
            String receiver) {

        return messageRepository
            .countBySenderUsernameAndReceiverUsernameAndStatus(
                sender,
                receiver,
                MessageStatus.DELIVERED
            );
    }


    // =====================================================
    // EDIT MESSAGE
    // Only sender can edit.
    // =====================================================

    public Message editMessage(
            Long messageId,
            String username,
            String newContent) {


        Message message =
                messageRepository
                    .findById(messageId)
                    .orElseThrow(() ->
                        new RuntimeException(
                            "Message not found"
                        )
                    );


        /*
         * Only sender can edit.
         */

        if (
            !message.getSender()
                   .getUsername()
                   .equals(username)
        ) {

            throw new RuntimeException(
                "Only sender can edit this message"
            );
        }


        /*
         * Deleted message cannot be edited.
         */

        if (
            message.getStatus()
                   == MessageStatus.DELETED
        ) {

            throw new RuntimeException(
                "Deleted message cannot be edited"
            );
        }


        /*
         * Content validation.
         */

        if (
            newContent == null ||
            newContent.trim().isEmpty()
        ) {

            throw new RuntimeException(
                "Message content cannot be empty"
            );
        }


        /*
         * Update content.
         */

        message.setContent(
            newContent.trim()
        );


        message.setEdited(
            true
        );


        return messageRepository.save(
            message
        );
    }
    /*
     * =====================================================
     * GET CALL HISTORY
     *
     * Returns all CALL messages where
     * the logged-in user is either:
     *
     * Sender
     * OR
     * Receiver
     * =====================================================
     */
    @Transactional(readOnly = true)
    public List<MessageResponse> getCallHistory(
            String username
    ) {

        return messageRepository
                .findCallHistoryByUsername(
                        username
                )
                .stream()
                .map(message -> {

                    MessageResponse response =
                            new MessageResponse(
                                    message.getId(),
                                    message.getSender().getUsername(),
                                    message.getReceiver().getUsername(),
                                    message.getContent(),
                                    message.getTimestamp(),
                                    message.getStatus(),
                                    message.isEdited(),
                                    message.getReplyToMessageId(),
                                    message.getReplyToContent(),
                                    message.getMessageType()
                            );

                    // CHANGE THIS PART

                    response.setCallType(
                            message.getCallType()
                    );

                    if (message.getSender().getUsername().equals(username)) {

                        response.setCallDirection("OUTGOING");

                    } else {

                        response.setCallDirection("INCOMING");

                    }

                    response.setCallStatus(
                            message.getCallStatus()
                    );

                    response.setCallDuration(
                            message.getCallDuration()
                    );

                    return response;

                })
                .toList();
    }
    /*
     * =====================================================
     * DELETE EXPIRED DISAPPEARING MESSAGES
     *
     * Permanently removes messages whose
     * expiration time has already passed.
     * =====================================================
     */

    @Transactional
    public void deleteExpiredMessages() {

        List<Message> expiredMessages =
                messageRepository
                        .findByExpiresAtLessThanEqual(
                                System.currentTimeMillis()
                        );

        if (
                !expiredMessages.isEmpty()
        ) {

            messageRepository.deleteAll(
                    expiredMessages
            );
        }
    }

}