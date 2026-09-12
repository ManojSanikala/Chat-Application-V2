package com.chat.app.dto;

import com.chat.app.enums.MessageStatus;

public class MessageResponse {

    /*
     * =====================================================
     * BASIC MESSAGE INFORMATION
     * =====================================================
     */

    private Long id;

    private String sender;

    private String receiver;

    private String content;

    private String timestamp;

    private MessageStatus status;


    /*
     * =====================================================
     * EDITED
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
     * MESSAGE TYPE
     *
     * TEXT
     * IMAGE
     * DOCUMENT
     * FILE
     * CALL
     * =====================================================
     */

    private String messageType = "TEXT";


    /*
     * =====================================================
     * FILE INFORMATION
     * =====================================================
     */

    private String fileName;


    /*
     * =====================================================
     * FORWARDED
     * =====================================================
     */

    private boolean forwarded;


    /*
     * =====================================================
     * DISAPPEARING MESSAGE
     *
     * Epoch milliseconds.
     * Null means permanent.
     * =====================================================
     */

    private Long expiresAt;


    /*
     * =====================================================
     * CALL INFORMATION
     *
     * Used when:
     *
     * messageType = CALL
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
     */

    private Long callDuration;


    /*
     * =====================================================
     * DEFAULT CONSTRUCTOR
     * =====================================================
     */

    public MessageResponse() {

    }


    /*
     * =====================================================
     * EXISTING MESSAGE CONSTRUCTOR
     *
     * PRESERVED
     *
     * Existing ChatController and MessageService
     * functionality will continue using this constructor.
     * =====================================================
     */

    public MessageResponse(

            Long id,

            String sender,

            String receiver,

            String content,

            String timestamp,

            MessageStatus status,

            boolean edited,

            Long replyToMessageId,

            String replyToContent,

            String messageType

    ) {

        this.id = id;

        this.sender = sender;

        this.receiver = receiver;

        this.content = content;

        this.timestamp = timestamp;

        this.status = status;

        this.edited = edited;

        this.replyToMessageId = replyToMessageId;

        this.replyToContent = replyToContent;

        this.messageType =

                messageType != null

                        ? messageType

                        : "TEXT";

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

    public String getSender() {

        return sender;

    }


    public void setSender(

            String sender

    ) {

        this.sender = sender;

    }


    /*
     * =====================================================
     * RECEIVER
     * =====================================================
     */

    public String getReceiver() {

        return receiver;

    }


    public void setReceiver(

            String receiver

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
     * MESSAGE TYPE
     * =====================================================
     */

    public String getMessageType() {

        return messageType;

    }


    public void setMessageType(

            String messageType

    ) {

        this.messageType =

                messageType != null

                        ? messageType

                        : "TEXT";

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