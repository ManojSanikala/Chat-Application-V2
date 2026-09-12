package com.chat.app.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.chat.app.dto.CallHistoryRequest;
import com.chat.app.dto.MessageResponse;
import com.chat.app.model.Message;
import com.chat.app.service.MessageService;


@Controller

public class CallHistoryController {


    /*
     * =====================================================
     * MESSAGE SERVICE
     * =====================================================
     */

    @Autowired

    private MessageService messageService;


    /*
     * =====================================================
     * WEBSOCKET TEMPLATE
     * =====================================================
     */

    @Autowired

    private SimpMessagingTemplate messagingTemplate;


    /*
     * =====================================================
     * SAVE CALL HISTORY
     *
     * WebSocket:
     *
     * /app/call/history
     *
     * =====================================================
     */

    @MessageMapping(

            "/call/history"

    )

    public void saveCallHistory(

            CallHistoryRequest request,

            Principal principal

    ) {


        /*
         * =================================================
         * CHECK USER
         * =================================================
         */

        if (

                principal == null

        ) {

            System.out.println(

                    "Call history rejected: User not authenticated"

            );

            return;

        }


        /*
         * =================================================
         * CHECK REQUEST
         * =================================================
         */

        if (

                request == null

        ) {

            System.out.println(

                    "Call history rejected: Request is null"

            );

            return;

        }


        /*
         * =================================================
         * GET AUTHENTICATED USER
         *
         * Never trust sender from frontend.
         * =================================================
         */

        String sender =

                principal.getName();


        /*
         * =================================================
         * GET RECEIVER
         * =================================================
         */

        String receiver =

                request.getReceiver();


        if (

                receiver == null

                ||

                receiver.isBlank()

        ) {

            System.out.println(

                    "Call history rejected: Receiver missing"

            );

            return;

        }


        /*
         * =================================================
         * PREVENT SELF CALL HISTORY
         * =================================================
         */

        if (

                sender.equalsIgnoreCase(

                        receiver

                )

        ) {

            return;

        }


        /*
         * =================================================
         * VALIDATE CALL TYPE
         * =================================================
         */

        String callType =

                request.getCallType();


        if (

                callType == null

                ||

                callType.isBlank()

        ) {

            callType =

                    "VOICE";

        }


        /*
         * =================================================
         * VALIDATE CALL STATUS
         * =================================================
         */

        String callStatus =

                request.getCallStatus();


        if (

                callStatus == null

                ||

                callStatus.isBlank()

        ) {

            callStatus =

                    "COMPLETED";

        }


        /*
         * =================================================
         * CALL DURATION
         * =================================================
         */

        Long callDuration =

                request.getCallDuration();


        if (

                callDuration == null

                ||

                callDuration < 0

        ) {

            callDuration =

                    0L;

        }


        /*
         * =================================================
         * LOG
         * =================================================
         */

        System.out.println(

                "===================================="

        );

        System.out.println(

                "SAVING CALL HISTORY"

        );

        System.out.println(

                "Sender      : " + sender

        );

        System.out.println(

                "Receiver    : " + receiver

        );

        System.out.println(

                "Call Type   : " + callType

        );

        System.out.println(

                "Call Status : " + callStatus

        );

        System.out.println(

                "Duration    : " + callDuration

        );

        System.out.println(

                "===================================="

        );


        /*
         * =================================================
         * SAVE INTO DATABASE
         * =================================================
         */

        Message savedMessage =

                messageService.saveCallHistory(

                        sender,

                        receiver,

                        callType,

                        callStatus,

                        callDuration

                );


        /*
         * =================================================
         * CREATE RESPONSE
         *
         * Uses your existing MessageResponse.
         * =================================================
         */

        MessageResponse response =

                new MessageResponse(

                        savedMessage.getId(),

                        savedMessage

                                .getSender()

                                .getUsername(),

                        savedMessage

                                .getReceiver()

                                .getUsername(),

                        savedMessage.getContent(),

                        savedMessage.getTimestamp(),

                        savedMessage.getStatus(),

                        savedMessage.isEdited(),

                        savedMessage.getReplyToMessageId(),

                        savedMessage.getReplyToContent(),

                        savedMessage.getMessageType()

                );


        /*
         * =================================================
         * ADD CALL DATA
         *
         * These setters will be added next
         * to MessageResponse.
         * =================================================
         */

        response.setCallType(

                savedMessage.getCallType()

        );


        response.setCallDirection(

                savedMessage.getCallDirection()

        );


        response.setCallStatus(

                savedMessage.getCallStatus()

        );


        response.setCallDuration(

                savedMessage.getCallDuration()

        );


        /*
         * =================================================
         * SEND TO RECEIVER
         * =================================================
         */

        messagingTemplate.convertAndSendToUser(

                receiver,

                "/queue/messages",

                response

        );


        /*
         * =================================================
         * SEND TO SENDER
         * =================================================
         */

        messagingTemplate.convertAndSendToUser(

                sender,

                "/queue/messages",

                response

        );


        System.out.println(

                "Call history saved successfully"

        );

    }
    /*
     * =====================================================
     * GET CALL HISTORY
     *
     * REST API:
     *
     * GET /call/history
     *
     * Returns calls involving
     * the currently logged-in user.
     * =====================================================
     */
    @GetMapping("/call/history")
    @ResponseBody
    public List<MessageResponse> getCallHistory(
            Principal principal
    ) {

        if (principal == null) {

            throw new IllegalStateException(
                    "User not authenticated"
            );
        }

        return messageService
                .getCallHistory(
                        principal.getName()
                );
    }

}