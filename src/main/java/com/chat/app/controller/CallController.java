package com.chat.app.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.chat.app.dto.CallSignal;

@Controller
public class CallController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    /* =====================================================
       CALL SIGNAL

       Handles:

       - CALL_REQUEST
       - CALL_ACCEPT
       - CALL_REJECT
       - CALL_END

       - WEBRTC_OFFER
       - WEBRTC_ANSWER
       - ICE_CANDIDATE
    ===================================================== */

    @MessageMapping("/call/signal")
    public void handleCallSignal(
            CallSignal callSignal,
            Principal principal
    ) {

        /* ================================================
           CHECK AUTHENTICATED USER
        ================================================ */

        if (principal == null) {

            System.out.println(
                    "Call signal rejected: User not authenticated"
            );

            return;
        }


        /* ================================================
           CHECK SIGNAL
        ================================================ */

        if (callSignal == null) {

            System.out.println(
                    "Call signal rejected: Signal is null"
            );

            return;
        }


        /* ================================================
           GET AUTHENTICATED SENDER

           IMPORTANT:

           Never trust sender coming
           from JavaScript.

           Backend always sets sender.
        ================================================ */

        String sender =
                principal.getName();

        callSignal.setSender(
                sender
        );


        /* ================================================
           VALIDATE RECEIVER
        ================================================ */

        String receiver =
                callSignal.getReceiver();


        if (
                receiver == null
                ||
                receiver.isBlank()
        ) {

            System.out.println(
                    "Call signal rejected: Receiver missing"
            );

            return;
        }


        /* ================================================
           PREVENT CALLING YOURSELF
        ================================================ */

        if (
                sender.equalsIgnoreCase(
                        receiver
                )
        ) {

            System.out.println(
                    "Call signal rejected: Cannot signal yourself"
            );

            return;
        }


        /* ================================================
           VALIDATE ACTION
        ================================================ */

        String action =
                callSignal.getAction();


        if (
                action == null
                ||
                action.isBlank()
        ) {

            System.out.println(
                    "Call signal rejected: Action missing"
            );

            return;
        }


        /* ================================================
           LOG SIGNAL
        ================================================ */

        System.out.println(
                "CALL SIGNAL"
        );

        System.out.println(
                "Sender   : " + sender
        );

        System.out.println(
                "Receiver : " + receiver
        );

        System.out.println(
                "Action   : " + action
        );

        System.out.println(
                "Call Type: " +
                callSignal.getCallType()
        );


        /* ================================================
           SEND SIGNAL ONLY TO RECEIVER

           IMPORTANT:

           DO NOT SEND THE SAME SIGNAL
           BACK TO THE SENDER.

           This is especially important for:

           WEBRTC_OFFER
           WEBRTC_ANSWER
           ICE_CANDIDATE

           The receiver will send its
           own response back separately.
        ================================================ */

        messagingTemplate.convertAndSendToUser(

                receiver,

                "/queue/call",

                callSignal

        );


        System.out.println(
                "Call signal delivered to: " +
                receiver
        );
    }
}