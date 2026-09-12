package com.chat.app.model;

import com.chat.app.enums.MessageStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "messages")
public class Message {

    /*
     * =====================================================
     * ID
     * =====================================================
     */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /*
     * =====================================================
     * SENDER
     * =====================================================
     */

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;


    /*
     * =====================================================
     * RECEIVER
     * =====================================================
     */

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;


    /*
     * =====================================================
     * MESSAGE CONTENT
     * =====================================================
     */

    private String content;


    /*
     * =====================================================
     * TIMESTAMP
     * =====================================================
     */

    private String timestamp;


    /*
     * =====================================================
     * MESSAGE STATUS
     * =====================================================
     */

    @Enumerated(EnumType.STRING)
    private MessageStatus status;


    /*
     * =====================================================
     * DELETE STATUS
     * =====================================================
     */

    private boolean deletedBySender = false;

    private boolean deletedByReceiver = false;


    /*
     * =====================================================
     * EDIT STATUS
     * =====================================================
     */

    private boolean edited;


    /*
     * =====================================================
     * REPLY INFORMATION
     * =====================================================
     */

    private Long replyToMessageId;

    private String replyToContent;


    /*
     * =====================================================
     * FILE INFORMATION
     * =====================================================
     */

    private String fileName;


    /*
     * =====================================================
     * FORWARDED MESSAGE
     * =====================================================
     */

    @Column(nullable = false)
    private boolean forwarded = false;


    /*
     * =====================================================
     * DISAPPEARING MESSAGE
     *
     * Epoch milliseconds.
     *
     * Null means permanent.
     * =====================================================
     */

    private Long expiresAt;


    /*
     * =====================================================
     * MESSAGE TYPE
     * =====================================================
     *
     * TEXT      -> Normal text message
     * IMAGE     -> Image message
     * DOCUMENT  -> Document message
     * FILE      -> Other file message
     * CALL      -> Voice or Video call history
     *
     * Existing messages remain TEXT.
     *
     * =====================================================
     */

    private String messageType = "TEXT";


    /*
     * =====================================================
     * CALL INFORMATION
     *
     * Used only when:
     *
     * messageType = CALL
     *
     * =====================================================
     */


    /*
     * CALL TYPE
     *
     * VOICE
     * VIDEO
     */

    private String callType;


    /*
     * CALL DIRECTION
     *
     * INCOMING
     * OUTGOING
     */

    private String callDirection;


    /*
     * CALL STATUS
     *
     * COMPLETED
     * MISSED
     * REJECTED
     * CANCELLED
     */

    private String callStatus;


    /*
     * CALL DURATION
     *
     * Stored in seconds.
     *
     * Example:
     *
     * 65 = 01:05
     */

    private Long callDuration;


    /*
     * =====================================================
     * CONSTRUCTORS
     * =====================================================
     */

    public Message() {

        super();

    }


    public Message(

            Long id,

            User sender,

            User receiver,

            String content,

            String timestamp,

            MessageStatus status,

            boolean deletedBySender,

            boolean deletedByReceiver

    ) {

        this.id = id;

        this.sender = sender;

        this.receiver = receiver;

        this.content = content;

        this.timestamp = timestamp;

        this.status = status;

        this.deletedBySender = deletedBySender;

        this.deletedByReceiver = deletedByReceiver;

    }


    /*
     * =====================================================
     * ID
     * =====================================================
     */

    public Long getId() {

        return id;

    }


    public void setId(

            Long id

    ) {

        this.id = id;

    }


    /*
     * =====================================================
     * SENDER
     * =====================================================
     */

    public User getSender() {

        return sender;

    }


    public void setSender(

            User sender

    ) {

        this.sender = sender;

    }


    /*
     * =====================================================
     * RECEIVER
     * =====================================================
     */

    public User getReceiver() {

        return receiver;

    }


    public void setReceiver(

            User receiver

    ) {

        this.receiver = receiver;

    }


    /*
     * =====================================================
     * CONTENT
     * =====================================================
     */

    public String getContent() {

        return content;

    }


    public void setContent(

            String content

    ) {

        this.content = content;

    }


    /*
     * =====================================================
     * TIMESTAMP
     * =====================================================
     */

    public String getTimestamp() {

        return timestamp;

    }


    public void setTimestamp(

            String timestamp

    ) {

        this.timestamp = timestamp;

    }


    /*
     * =====================================================
     * MESSAGE STATUS
     * =====================================================
     */

    public MessageStatus getStatus() {

        return status;

    }


    public void setStatus(

            MessageStatus status

    ) {

        this.status = status;

    }


    /*
     * =====================================================
     * DELETE BY SENDER
     * =====================================================
     */

    public boolean isDeletedBySender() {

        return deletedBySender;

    }


    public void setDeletedBySender(

            boolean deletedBySender

    ) {

        this.deletedBySender = deletedBySender;

    }


    /*
     * =====================================================
     * DELETE BY RECEIVER
     * =====================================================
     */

    public boolean isDeletedByReceiver() {

        return deletedByReceiver;

    }


    public void setDeletedByReceiver(

            boolean deletedByReceiver

    ) {

        this.deletedByReceiver = deletedByReceiver;

    }


    /*
     * =====================================================
     * EDITED
     * =====================================================
     */

    public boolean isEdited() {

        return edited;

    }


    public void setEdited(

            boolean edited

    ) {

        this.edited = edited;

    }


    /*
     * =====================================================
     * REPLY MESSAGE ID
     * =====================================================
     */

    public Long getReplyToMessageId() {

        return replyToMessageId;

    }


    public void setReplyToMessageId(

            Long replyToMessageId

    ) {

        this.replyToMessageId =

                replyToMessageId;

    }


    /*
     * =====================================================
     * REPLY CONTENT
     * =====================================================
     */

    public String getReplyToContent() {

        return replyToContent;

    }


    public void setReplyToContent(

            String replyToContent

    ) {

        this.replyToContent =

                replyToContent;

    }


    /*
     * =====================================================
     * FILE NAME
     * =====================================================
     */

    public String getFileName() {

        return fileName;

    }


    public void setFileName(

            String fileName

    ) {

        this.fileName = fileName;

    }


    /*
     * =====================================================
     * FORWARDED
     * =====================================================
     */

    public boolean isForwarded() {

        return forwarded;

    }


    public void setForwarded(

            boolean forwarded

    ) {

        this.forwarded = forwarded;

    }


    /*
     * =====================================================
     * EXPIRES AT
     * =====================================================
     */

    public Long getExpiresAt() {

        return expiresAt;

    }


    public void setExpiresAt(

            Long expiresAt

    ) {

        this.expiresAt = expiresAt;

    }


    /*
     * =====================================================
     * MESSAGE TYPE
     * =====================================================
     */

    public String getMessageType() {

        return messageType;

    }


    public void setMessageType(

            String messageType

    ) {

        this.messageType = messageType;

    }


    /*
     * =====================================================
     * CALL TYPE
     *
     * VOICE
     * VIDEO
     * =====================================================
     */

    public String getCallType() {

        return callType;

    }


    public void setCallType(

            String callType

    ) {

        this.callType = callType;

    }


    /*
     * =====================================================
     * CALL DIRECTION
     *
     * INCOMING
     * OUTGOING
     * =====================================================
     */

    public String getCallDirection() {

        return callDirection;

    }


    public void setCallDirection(

            String callDirection

    ) {

        this.callDirection = callDirection;

    }


    /*
     * =====================================================
     * CALL STATUS
     *
     * COMPLETED
     * MISSED
     * REJECTED
     * CANCELLED
     * =====================================================
     */

    public String getCallStatus() {

        return callStatus;

    }


    public void setCallStatus(

            String callStatus

    ) {

        this.callStatus = callStatus;

    }


    /*
     * =====================================================
     * CALL DURATION
     *
     * Stored in seconds.
     * =====================================================
     */

    public Long getCallDuration() {

        return callDuration;

    }


    public void setCallDuration(

            Long callDuration

    ) {

        this.callDuration = callDuration;

    }

}