package com.chat.app.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chat.app.dto.FriendRequestResponse;
import com.chat.app.dto.UserResponse;
import com.chat.app.service.FriendRequestService;

@RestController
@RequestMapping(
    "/friends"
)
public class FriendRequestController {


    private final FriendRequestService
            friendRequestService;


    public FriendRequestController(

            FriendRequestService
                    friendRequestService

    ) {

        this.friendRequestService =
                friendRequestService;

    }


    /*
     * =====================================================
     * SEND FRIEND REQUEST
     *
     * POST
     *
     * /friends/request/deepak
     * =====================================================
     */

    @PostMapping(
        "/request/{username}"
    )
    public ResponseEntity<FriendRequestResponse>
    sendFriendRequest(

            @PathVariable
            String username,

            Principal principal

    ) {

        return
                ResponseEntity.ok(

                    friendRequestService
                            .sendFriendRequest(

                                principal.getName(),

                                username

                            )

                );

    }


    /*
     * =====================================================
     * GET PENDING FRIEND REQUESTS
     *
     * GET
     *
     * /friends/requests
     * =====================================================
     */

    @GetMapping(
        "/requests"
    )
    public ResponseEntity<
            List<FriendRequestResponse>
    >
    getPendingRequests(

            Principal principal

    ) {

        return
                ResponseEntity.ok(

                    friendRequestService
                            .getPendingRequests(

                                principal.getName()

                            )

                );

    }


    /*
     * =====================================================
     * ACCEPT FRIEND REQUEST
     *
     * POST
     *
     * /friends/accept/1
     * =====================================================
     */

    @PostMapping(
        "/accept/{requestId}"
    )
    public ResponseEntity<
            FriendRequestResponse
    >
    acceptFriendRequest(

            @PathVariable
            Long requestId,

            Principal principal

    ) {

        return
                ResponseEntity.ok(

                    friendRequestService
                            .acceptFriendRequest(

                                requestId,

                                principal.getName()

                            )

                );

    }


    /*
     * =====================================================
     * REJECT FRIEND REQUEST
     *
     * POST
     *
     * /friends/reject/1
     * =====================================================
     */

    @PostMapping(
        "/reject/{requestId}"
    )
    public ResponseEntity<
            FriendRequestResponse
    >
    rejectFriendRequest(

            @PathVariable
            Long requestId,

            Principal principal

    ) {

        return
                ResponseEntity.ok(

                    friendRequestService
                            .rejectFriendRequest(

                                requestId,

                                principal.getName()

                            )

                );

    }


    /*
     * =====================================================
     * GET MY FRIENDS
     *
     * GET
     *
     * /friends
     * =====================================================
     */

    @GetMapping
    public ResponseEntity<
            List<UserResponse>
    >
    getFriends(
            Principal principal
    ) {

        return ResponseEntity.ok(
                friendRequestService.getFriends(
                        principal.getName()
                )
        );
    }
    /*
     * =====================================================
     * REMOVE FRIEND
     *
     * DELETE
     *
     * /friends/remove/deepak
     * =====================================================
     */
    @DeleteMapping("/remove/{username}")
    public ResponseEntity<String> removeFriend(
            @PathVariable String username,
            Principal principal
    ) {

        friendRequestService.removeFriend(
                principal.getName(),
                username
        );

        return ResponseEntity.ok(
                "Friend removed successfully"
        );
    }
}