package com.chat.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chat.app.dto.CallLogResponse;
import com.chat.app.model.Message;
import com.chat.app.repository.CallLogRepository;

@Service
public class CallLogService {

    @Autowired
    private CallLogRepository callLogRepository;


    /*
     * =====================================================
     * GET CALL LOGS
     *
     * Gets all CALL messages where the logged-in user is:
     *
     * 1. Sender
     * 2. Receiver
     *
     * Direction is calculated separately for the user
     * viewing the call log.
     * =====================================================
     */

    public List<CallLogResponse> getCallLogs(
            String username
    ) {

        List<Message> callMessages =
                callLogRepository
                        .findByMessageTypeAndSenderUsernameOrMessageTypeAndReceiverUsernameOrderByIdDesc(

                                "CALL",

                                username,

                                "CALL",

                                username

                        );


        return callMessages

                .stream()

                .map(message -> {

                    String otherUser;

                    String direction;


                    /*
                     * =========================================
                     * OUTGOING
                     *
                     * Logged-in user is sender.
                     * =========================================
                     */

                    if (

                            message.getSender()
                                    .getUsername()
                                    .equalsIgnoreCase(
                                            username
                                    )

                    ) {

                        otherUser =

                                message.getReceiver()
                                        .getUsername();


                        direction =

                                "OUTGOING";

                    }


                    /*
                     * =========================================
                     * INCOMING
                     *
                     * Logged-in user is receiver.
                     * =========================================
                     */

                    else {

                        otherUser =

                                message.getSender()
                                        .getUsername();


                        direction =

                                "INCOMING";

                    }


                    /*
                     * =========================================
                     * CREATE RESPONSE
                     * =========================================
                     */

                    return new CallLogResponse(

                            message.getId(),

                            otherUser,

                            message.getCallType(),

                            direction,

                            message.getCallStatus(),

                            message.getCallDuration(),

                            message.getTimestamp()

                    );

                })

                .toList();

    }

}