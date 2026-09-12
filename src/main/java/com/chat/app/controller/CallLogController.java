package com.chat.app.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chat.app.dto.CallLogResponse;
import com.chat.app.service.CallLogService;

@RestController
@RequestMapping("/api/call-logs")
public class CallLogController {

    @Autowired
    private CallLogService callLogService;


    /*
     * =====================================================
     * GET CALL LOGS
     *
     * API:
     *
     * GET /api/call-logs
     *
     * Returns call logs for the currently
     * authenticated user.
     *
     * =====================================================
     */

    @GetMapping
    public ResponseEntity<List<CallLogResponse>> getCallLogs(

            Principal principal

    ) {

        /*
         * ================================================
         * CHECK AUTHENTICATED USER
         * ================================================
         */

        if (

                principal == null

        ) {

            return ResponseEntity

                    .status(401)

                    .build();

        }


        /*
         * ================================================
         * GET USERNAME
         * ================================================
         */

        String username =

                principal.getName();


        /*
         * ================================================
         * GET CALL LOGS
         * ================================================
         */

        List<CallLogResponse> callLogs =

                callLogService

                        .getCallLogs(

                                username

                        );


        /*
         * ================================================
         * RETURN RESPONSE
         * ================================================
         */

        return ResponseEntity

                .ok(

                        callLogs

                );

    }

}