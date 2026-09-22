package com.chat.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.chat.app.enums.FriendRequestStatus;
import com.chat.app.model.FriendRequest;

@Repository
public interface FriendRequestRepository
        extends JpaRepository<FriendRequest, Long> {

    Optional<FriendRequest>
    findBySenderUsernameAndReceiverUsername(
            String sender,
            String receiver
    );

    List<FriendRequest>
    findByReceiverUsernameAndStatus(
            String receiver,
            FriendRequestStatus status
    );

    List<FriendRequest>
    findBySenderUsernameAndStatus(
            String sender,
            FriendRequestStatus status
    );

    Optional<FriendRequest>
    findBySenderUsernameAndReceiverUsernameAndStatus(
            String sender,
            String receiver,
            FriendRequestStatus status
    );

    List<FriendRequest>
    findByStatusAndSenderUsernameOrStatusAndReceiverUsername(
            FriendRequestStatus status1,
            String senderUsername,
            FriendRequestStatus status2,
            String receiverUsername
    );

    // =====================================================
    // ADMIN USER DELETE
    // =====================================================

    void deleteBySenderUsernameOrReceiverUsername(
            String senderUsername,
            String receiverUsername
    );

    // =====================================================
    // GET FRIENDS
    // =====================================================

    @Query("""
        SELECT f
        FROM FriendRequest f
        WHERE
            f.status =
                com.chat.app.enums.FriendRequestStatus.ACCEPTED
            AND
            (
                f.sender.username = :username
                OR
                f.receiver.username = :username
            )
    """)
    List<FriendRequest> findAcceptedFriendsByUsername(
            @Param("username") String username
    );
    @Query("""
            SELECT f
            FROM FriendRequest f
            JOIN FETCH f.sender
            JOIN FETCH f.receiver
            ORDER BY f.createdAt DESC
        """)
        List<FriendRequest> findAllWithUsers();
}