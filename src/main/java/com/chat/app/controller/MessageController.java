package com.chat.app.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chat.app.dto.ChatHistoryResponse;
import com.chat.app.dto.DeleteResponse;
import com.chat.app.dto.MessageRequest;
import com.chat.app.model.Message;
import com.chat.app.service.MessageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;


    /*
     * =====================================================
     * SEND MESSAGE
     *
     * Logged-in user is always used as sender.
     * Frontend cannot decide who the sender is.
     * =====================================================
     */

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(

            @Valid @RequestBody MessageRequest request,

            Principal principal

    ) {

        if (principal == null) {

            return ResponseEntity
                    .status(401)
                    .body("User is not authenticated");
        }


        Message saved =
                messageService.saveMessage(

                        principal.getName(),

                        request
                );


        return ResponseEntity.ok(
                saved
        );
    }


    /*
     * =====================================================
     * GET CONVERSATION
     * =====================================================
     */

    @GetMapping("/conversation")
    public ResponseEntity<List<ChatHistoryResponse>>
    getConversation(

            @RequestParam("receiver")
            String receiver,

            Principal principal

    ) {

        if (principal == null) {

            return ResponseEntity
                    .status(401)
                    .build();
        }


        List<ChatHistoryResponse> conversation =
                messageService.getConversation(

                        principal.getName(),

                        receiver
                );


        return ResponseEntity.ok(
                conversation
        );
    }


    /*
     * =====================================================
     * GET ALL MESSAGES
     *
     * ADMIN ONLY
     * =====================================================
     */

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Message>>
    getMessages() {

        return ResponseEntity.ok(

                messageService.getAllMessages()

        );
    }


    /*
     * =====================================================
     * GET CHAT HISTORY
     *
     * ADMIN ONLY
     * =====================================================
     */

    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ChatHistoryResponse>
    getChatHistory() {

        return messageService.getChatHistory();
    }


    /*
     * =====================================================
     * DELETE MESSAGE FOR ME
     * =====================================================
     */

    @DeleteMapping("/delete/{messageId}")
    public ResponseEntity<DeleteResponse>
    deleteForMe(

            @PathVariable
            Long messageId,

            Principal principal

    ) {

        if (principal == null) {

            return ResponseEntity
                    .status(401)
                    .build();
        }


        messageService.deleteForMe(

                messageId,

                principal.getName()
        );


        return ResponseEntity.ok(

                new DeleteResponse(
                        "Message deleted successfully"
                )
        );
    }

}