package com.chat.app.dto;

public class CallLogResponse {

    private Long id;

    private String username;

    private String callType;

    private String callDirection;

    private String callStatus;

    private Long callDuration;

    private String timestamp;


    public CallLogResponse() {

    }


    public CallLogResponse(

            Long id,

            String username,

            String callType,

            String callDirection,

            String callStatus,

            Long callDuration,

            String timestamp

    ) {

        this.id = id;

        this.username = username;

        this.callType = callType;

        this.callDirection = callDirection;

        this.callStatus = callStatus;

        this.callDuration = callDuration;

        this.timestamp = timestamp;

    }


    public Long getId() {

        return id;

    }


    public void setId(

            Long id

    ) {

        this.id = id;

    }


    public String getUsername() {

        return username;

    }


    public void setUsername(

            String username

    ) {

        this.username = username;

    }


    public String getCallType() {

        return callType;

    }


    public void setCallType(

            String callType

    ) {

        this.callType = callType;

    }


    public String getCallDirection() {

        return callDirection;

    }


    public void setCallDirection(

            String callDirection

    ) {

        this.callDirection = callDirection;

    }


    public String getCallStatus() {

        return callStatus;

    }


    public void setCallStatus(

            String callStatus

    ) {

        this.callStatus = callStatus;

    }


    public Long getCallDuration() {

        return callDuration;

    }


    public void setCallDuration(

            Long callDuration

    ) {

        this.callDuration = callDuration;

    }


    public String getTimestamp() {

        return timestamp;

    }


    public void setTimestamp(

            String timestamp

    ) {

        this.timestamp = timestamp;

    }

}