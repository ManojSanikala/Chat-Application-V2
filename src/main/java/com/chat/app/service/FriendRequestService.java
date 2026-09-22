package com.chat.app.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;

import com.chat.app.dto.FriendRequestResponse;
import com.chat.app.dto.UserResponse;
import com.chat.app.enums.FriendRequestStatus;
import com.chat.app.model.FriendRequest;
import com.chat.app.model.User;
import com.chat.app.repository.FriendRequestRepository;
import com.chat.app.repository.UserRepository;

@Service
@Transactional
public class FriendRequestService {


    private final FriendRequestRepository
            friendRequestRepository;


    private final UserRepository
            userRepository;

    private final SimpMessagingTemplate
            messagingTemplate;


    public FriendRequestService(

            FriendRequestRepository
                    friendRequestRepository,

            UserRepository
                    userRepository,

            SimpMessagingTemplate
                    messagingTemplate

    ) {

        this.friendRequestRepository =
                friendRequestRepository;

        this.userRepository =
                userRepository;

        this.messagingTemplate =
                messagingTemplate;
    }


    /*
     * =====================================================
     * SEND FRIEND REQUEST
     * =====================================================
     */

    public FriendRequestResponse
    sendFriendRequest(

            String senderUsername,

            String receiverUsername

    ) {


        /*
         * =============================================
         * PREVENT SELF REQUEST
         * =============================================
         */

        if (
            senderUsername.equalsIgnoreCase(
                    receiverUsername
            )
        ) {

            throw new IllegalArgumentException(
                    "You cannot send a friend request to yourself"
            );
        }


        /*
         * =============================================
         * GET SENDER
         * =============================================
         */

        User sender =

                userRepository

                        .findByUsername(
                                senderUsername
                        )

                        .orElseThrow(
                                () ->

                                        new IllegalArgumentException(
                                                "Sender not found"
                                        )
                        );


        /*
         * =============================================
         * GET RECEIVER
         * =============================================
         */

        User receiver =

                userRepository

                        .findByUsername(
                                receiverUsername
                        )

                        .orElseThrow(
                                () ->

                                        new IllegalArgumentException(
                                                "User not found"
                                        )
                        );


        /*
         * =============================================
         * CHECK SAME DIRECTION
         *
         * Example:
         *
         * Manoj -> Deepak
         * =============================================
         */

        Optional<FriendRequest> sameDirectionRequest =

                friendRequestRepository

                        .findBySenderUsernameAndReceiverUsername(
                                senderUsername,
                                receiverUsername
                        );


        if (
            sameDirectionRequest.isPresent()
        ) {

            FriendRequest existingRequest =

                    sameDirectionRequest.get();


            /*
             * REQUEST ALREADY PENDING
             */

            if (
                existingRequest.getStatus()
                        == FriendRequestStatus.PENDING
            ) {

                throw new IllegalArgumentException(
                        "Friend request already pending"
                );
            }


            /*
             * ALREADY FRIENDS
             */

            if (
                existingRequest.getStatus()
                        == FriendRequestStatus.ACCEPTED
            ) {

                throw new IllegalArgumentException(
                        "You are already friends"
                );
            }


            /*
             * =========================================
             * REJECTED REQUEST
             *
             * IMPORTANT FIX
             *
             * Allow user to send request again.
             *
             * We reuse the existing request.
             * =========================================
             */

            if (
                existingRequest.getStatus()
                        == FriendRequestStatus.REJECTED
            ) {

                existingRequest.setStatus(
                        FriendRequestStatus.PENDING
                );


                existingRequest.setUpdatedAt(
                        LocalDateTime.now()
                );


                FriendRequest savedRequest =

                        friendRequestRepository.save(
                                existingRequest
                        );


                FriendRequestResponse response = toResponse(savedRequest);
                notifyFriendRequest(receiverUsername, response);
                return response;
            }
        }


        /*
         * =============================================
         * CHECK REVERSE DIRECTION
         *
         * Example:
         *
         * Deepak -> Manoj
         *
         * Manoj tries to send -> Deepak
         * =============================================
         */

        Optional<FriendRequest> reverseDirectionRequest =

                friendRequestRepository

                        .findBySenderUsernameAndReceiverUsername(
                                receiverUsername,
                                senderUsername
                        );


        if (
            reverseDirectionRequest.isPresent()
        ) {

            FriendRequest existingRequest =

                    reverseDirectionRequest.get();


            /*
             * OTHER USER ALREADY SENT PENDING REQUEST
             */

            if (
                existingRequest.getStatus()
                        == FriendRequestStatus.PENDING
            ) {

                throw new IllegalArgumentException(
                        "Friend request already pending between these users"
                );
            }


            /*
             * ALREADY FRIENDS
             */

            if (
                existingRequest.getStatus()
                        == FriendRequestStatus.ACCEPTED
            ) {

                throw new IllegalArgumentException(
                        "You are already friends"
                );
            }


            /*
             * =========================================
             * REVERSE REQUEST WAS REJECTED
             *
             * Example:
             *
             * Deepak -> Manoj = REJECTED
             *
             * Now Manoj wants to send request to Deepak
             *
             * Create a NEW request in opposite direction.
             *
             * =========================================
             */

            if (
                existingRequest.getStatus()
                        == FriendRequestStatus.REJECTED
            ) {

                /*
                 * We allow new request.
                 *
                 * Continue below and create
                 * new FriendRequest.
                 */

            }
        }


        /*
         * =============================================
         * CREATE NEW FRIEND REQUEST
         * =============================================
         */

        FriendRequest request =

                new FriendRequest();


        request.setSender(
                sender
        );


        request.setReceiver(
                receiver
        );


        request.setStatus(
                FriendRequestStatus.PENDING
        );


        request.setCreatedAt(
                LocalDateTime.now()
        );


        request.setUpdatedAt(
                LocalDateTime.now()
        );


        FriendRequest savedRequest =

                friendRequestRepository.save(
                        request
                );


        FriendRequestResponse response = toResponse(savedRequest);
        notifyFriendRequest(receiverUsername, response);
        return response;
    }

    private void notifyFriendRequest(String receiverUsername, FriendRequestResponse response) {
        messagingTemplate.convertAndSendToUser(
                receiverUsername,
                "/queue/friend-requests",
                response
        );
    }


    /*
     * =====================================================
     * GET PENDING REQUESTS RECEIVED BY USER
     * =====================================================
     */

    @Transactional(
            readOnly = true
    )

    public List<FriendRequestResponse>
    getPendingRequests(

            String username

    ) {

        return

                friendRequestRepository

                        .findByReceiverUsernameAndStatus(
                                username,
                                FriendRequestStatus.PENDING
                        )

                        .stream()

                        .map(
                                this::toResponse
                        )

                        .toList();
    }


    /*
     * =====================================================
     * ACCEPT FRIEND REQUEST
     * =====================================================
     */

    public FriendRequestResponse
    acceptFriendRequest(

            Long requestId,

            String loggedInUsername

    ) {


        FriendRequest request =

                friendRequestRepository

                        .findById(
                                requestId
                        )

                        .orElseThrow(
                                () ->

                                        new IllegalArgumentException(
                                                "Friend request not found"
                                        )
                        );


        /*
         * =============================================
         * ONLY RECEIVER CAN ACCEPT
         * =============================================
         */

        if (
            !request

                    .getReceiver()

                    .getUsername()

                    .equals(
                            loggedInUsername
                    )
        ) {

            throw new IllegalArgumentException(
                    "You cannot accept this friend request"
            );
        }


        /*
         * =============================================
         * ONLY PENDING REQUEST
         * =============================================
         */

        if (
            request.getStatus()
                    != FriendRequestStatus.PENDING
        ) {

            throw new IllegalArgumentException(
                    "Friend request already processed"
            );
        }


        /*
         * =============================================
         * ACCEPT
         * =============================================
         */

        request.setStatus(
                FriendRequestStatus.ACCEPTED
        );


        request.setUpdatedAt(
                LocalDateTime.now()
        );


        FriendRequest savedRequest =

                friendRequestRepository.save(
                        request
                );


        FriendRequestResponse response =
                toResponse(
                        savedRequest
                );


        /*
         * Notify the original sender immediately
         * that the friend request was accepted.
         */

        messagingTemplate.convertAndSendToUser(

                savedRequest
                        .getSender()
                        .getUsername(),

                "/queue/friend-request-response",

                response
        );


        return response;
    }


    /*
     * =====================================================
     * REJECT FRIEND REQUEST
     * =====================================================
     */

    public FriendRequestResponse
    rejectFriendRequest(

            Long requestId,

            String loggedInUsername

    ) {


        FriendRequest request =

                friendRequestRepository

                        .findById(
                                requestId
                        )

                        .orElseThrow(
                                () ->

                                        new IllegalArgumentException(
                                                "Friend request not found"
                                        )
                        );


        /*
         * =============================================
         * ONLY RECEIVER CAN REJECT
         * =============================================
         */

        if (
            !request

                    .getReceiver()

                    .getUsername()

                    .equals(
                            loggedInUsername
                    )
        ) {

            throw new IllegalArgumentException(
                    "You cannot reject this friend request"
            );
        }


        /*
         * =============================================
         * ONLY PENDING REQUEST
         * =============================================
         */

        if (
            request.getStatus()
                    != FriendRequestStatus.PENDING
        ) {

            throw new IllegalArgumentException(
                    "Friend request already processed"
            );
        }


        /*
         * =============================================
         * REJECT
         * =============================================
         */

        request.setStatus(
                FriendRequestStatus.REJECTED
        );


        request.setUpdatedAt(
                LocalDateTime.now()
        );


        FriendRequest savedRequest =

                friendRequestRepository.save(
                        request
                );


        FriendRequestResponse response =
                toResponse(
                        savedRequest
                );


        /*
         * Notify the original sender immediately
         * that the friend request was rejected.
         */

        messagingTemplate.convertAndSendToUser(

                savedRequest
                        .getSender()
                        .getUsername(),

                "/queue/friend-request-response",

                response
        );


        return response;
    }


    /*
     * =====================================================
     * GET FRIENDS
     * =====================================================
     */

    @Transactional(
            readOnly = true
    )

    public List<UserResponse>
    getFriends(

            String username

    ) {


        List<String> friendUsernames =

                friendRequestRepository

                        .findAcceptedFriendsByUsername(
                                username
                        )

                        .stream()

                        .map(request -> {


                            if (

                                request.getSender()

                                        .getUsername()

                                        .equals(
                                                username
                                        )

                            ) {

                                return request

                                        .getReceiver()

                                        .getUsername();
                            }


                            return request

                                    .getSender()

                                    .getUsername();

                        })

                        .distinct()

                        .toList();


        return

                friendUsernames

                        .stream()

                        .map(friendUsername ->

                                userRepository

                                        .findByUsername(
                                                friendUsername
                                        )

                                        .map(user -> {


                                            UserResponse response =

                                                    new UserResponse();


                                            response.setId(
                                                    user.getId()
                                            );


                                            response.setUsername(
                                                    user.getUsername()
                                            );


                                            response.setRole(
                                                    user.getRole()
                                            );


                                            response.setOnline(
                                                    user.isOnline()
                                            );


                                            response.setLastSeen(
                                                    user.getLastSeen()
                                            );


                                            response.setDisplayName(
                                                    user.getDisplayName()
                                            );


                                            response.setEmail(
                                                    user.getEmail()
                                            );


                                            response.setBio(
                                                    user.getBio()
                                            );


                                            response.setProfilePicture(
                                                    user.getProfilePicture()
                                            );


                                            return response;

                                        })

                                        .orElse(
                                                null
                                        )
                        )

                        .filter(
                                user -> user != null
                        )

                        .toList();
    }


    /*
     * =====================================================
     * CHECK IF TWO USERS ARE FRIENDS
     * =====================================================
     */

    @Transactional(
            readOnly = true
    )

    public boolean
    areFriends(

            String user1,

            String user2

    ) {

        return

                friendRequestRepository

                        .findBySenderUsernameAndReceiverUsernameAndStatus(

                                user1,

                                user2,

                                FriendRequestStatus.ACCEPTED

                        )

                        .isPresent()

                ||

                friendRequestRepository

                        .findBySenderUsernameAndReceiverUsernameAndStatus(

                                user2,

                                user1,

                                FriendRequestStatus.ACCEPTED

                        )

                        .isPresent();
    }


    /*
     * =====================================================
     * CONVERT ENTITY TO RESPONSE
     * =====================================================
     */

    private FriendRequestResponse
    toResponse(

            FriendRequest request

    ) {

        return

                new FriendRequestResponse(

                        request.getId(),

                        request

                                .getSender()

                                .getUsername(),

                        request

                                .getReceiver()

                                .getUsername(),

                        request.getStatus(),

                        request.getCreatedAt()

                );
    }
    /*
     * =====================================================
     * REMOVE FRIEND
     *
     * Removes the ACCEPTED friendship between two users.
     * =====================================================
     */
    public void removeFriend(
            String loggedInUsername,
            String friendUsername
    ) {

        FriendRequest request =
                friendRequestRepository
                        .findBySenderUsernameAndReceiverUsername(
                                loggedInUsername,
                                friendUsername
                        )
                        .or(() ->
                                friendRequestRepository
                                        .findBySenderUsernameAndReceiverUsername(
                                                friendUsername,
                                                loggedInUsername
                                        )
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Friendship not found"
                                )
                        );

        if (
                request.getStatus()
                        != FriendRequestStatus.ACCEPTED
        ) {

            throw new IllegalArgumentException(
                    "Users are not friends"
            );
        }

        friendRequestRepository.delete(
                request
        );
    }

}