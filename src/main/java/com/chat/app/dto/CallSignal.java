package com.chat.app.dto;

public class CallSignal {


    /* =========================================
       CALL INFORMATION
    ========================================= */

    private String sender;

    private String receiver;

    private String callType;

    private String action;


    /* =========================================
       WEBRTC SDP
    ========================================= */

    private String sdp;


    /* =========================================
       ICE CANDIDATE
    ========================================= */

    private String candidate;

    private String sdpMid;

    private Integer sdpMLineIndex;


    /* =========================================
       GET SENDER
    ========================================= */

    public String getSender() {

        return sender;
    }


    /* =========================================
       SET SENDER
    ========================================= */

    public void setSender(
            String sender
    ) {

        this.sender =
                sender;
    }


    /* =========================================
       GET RECEIVER
    ========================================= */

    public String getReceiver() {

        return receiver;
    }


    /* =========================================
       SET RECEIVER
    ========================================= */

    public void setReceiver(
            String receiver
    ) {

        this.receiver =
                receiver;
    }


    /* =========================================
       GET CALL TYPE
    ========================================= */

    public String getCallType() {

        return callType;
    }


    /* =========================================
       SET CALL TYPE
    ========================================= */

    public void setCallType(
            String callType
    ) {

        this.callType =
                callType;
    }


    /* =========================================
       GET ACTION
    ========================================= */

    public String getAction() {

        return action;
    }


    /* =========================================
       SET ACTION
    ========================================= */

    public void setAction(
            String action
    ) {

        this.action =
                action;
    }


    /* =========================================
       GET SDP
    ========================================= */

    public String getSdp() {

        return sdp;
    }


    /* =========================================
       SET SDP
    ========================================= */

    public void setSdp(
            String sdp
    ) {

        this.sdp =
                sdp;
    }


    /* =========================================
       GET ICE CANDIDATE
    ========================================= */

    public String getCandidate() {

        return candidate;
    }


    /* =========================================
       SET ICE CANDIDATE
    ========================================= */

    public void setCandidate(
            String candidate
    ) {

        this.candidate =
                candidate;
    }


    /* =========================================
       GET SDP MID
    ========================================= */

    public String getSdpMid() {

        return sdpMid;
    }


    /* =========================================
       SET SDP MID
    ========================================= */

    public void setSdpMid(
            String sdpMid
    ) {

        this.sdpMid =
                sdpMid;
    }


    /* =========================================
       GET SDP MLINE INDEX
    ========================================= */

    public Integer getSdpMLineIndex() {

        return sdpMLineIndex;
    }


    /* =========================================
       SET SDP MLINE INDEX
    ========================================= */

    public void setSdpMLineIndex(
            Integer sdpMLineIndex
    ) {

        this.sdpMLineIndex =
                sdpMLineIndex;
    }
}