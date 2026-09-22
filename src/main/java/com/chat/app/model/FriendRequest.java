package com.chat.app.model;

import java.time.LocalDateTime;

import com.chat.app.enums.FriendRequestStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "friend_requests",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {
                "sender_id",
                "receiver_id"
            }
        )
    }
)
public class FriendRequest {

    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Long id;


    /*
     * =============================================
     * USER WHO SENT FRIEND REQUEST
     * =============================================
     */

    @ManyToOne(
        fetch = FetchType.LAZY
    )
    @JoinColumn(
        name = "sender_id",
        nullable = false
    )
    private User sender;


    /*
     * =============================================
     * USER WHO RECEIVED FRIEND REQUEST
     * =============================================
     */

    @ManyToOne(
        fetch = FetchType.LAZY
    )
    @JoinColumn(
        name = "receiver_id",
        nullable = false
    )
    private User receiver;


    /*
     * =============================================
     * REQUEST STATUS
     * =============================================
     */

    @Enumerated(
        EnumType.STRING
    )
    private FriendRequestStatus status;


    /*
     * =============================================
     * CREATED TIME
     * =============================================
     */

    private LocalDateTime createdAt;


    /*
     * =============================================
     * UPDATED TIME
     * =============================================
     */

    private LocalDateTime updatedAt;


    /*
     * =============================================
     * CONSTRUCTOR
     * =============================================
     */

    public FriendRequest() {
    }


    /*
     * =============================================
     * GETTERS AND SETTERS
     * =============================================
     */

    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public User getSender() {
        return sender;
    }


    public void setSender(
            User sender
    ) {
        this.sender = sender;
    }


    public User getReceiver() {
        return receiver;
    }


    public void setReceiver(
            User receiver
    ) {
        this.receiver = receiver;
    }


    public FriendRequestStatus getStatus() {
        return status;
    }


    public void setStatus(
            FriendRequestStatus status
    ) {
        this.status = status;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt = updatedAt;
    }

}