package com.chat.app.dto;

import java.time.LocalDateTime;

import com.chat.app.enums.FriendRequestStatus;

public class FriendRequestResponse {

    private Long id;

    private String sender;

    private String receiver;

    private FriendRequestStatus status;

    private LocalDateTime createdAt;


    public FriendRequestResponse() {
    }


    public FriendRequestResponse(
            Long id,
            String sender,
            String receiver,
            FriendRequestStatus status,
            LocalDateTime createdAt
    ) {

        this.id = id;

        this.sender = sender;

        this.receiver = receiver;

        this.status = status;

        this.createdAt = createdAt;
    }


    public Long getId() {
        return id;
    }


    public void setId(
            Long id
    ) {
        this.id = id;
    }


    public String getSender() {
        return sender;
    }


    public void setSender(
            String sender
    ) {
        this.sender = sender;
    }


    public String getReceiver() {
        return receiver;
    }


    public void setReceiver(
            String receiver
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

}