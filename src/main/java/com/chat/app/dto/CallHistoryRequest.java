package com.chat.app.dto;

public class CallHistoryRequest {

    /*
     * =====================================================
     * RECEIVER
     * =====================================================
     */

    private String receiver;


    /*
     * =====================================================
     * CALL TYPE
     *
     * VOICE
     * VIDEO
     * =====================================================
     */

    private String callType;


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

    private String callStatus;


    /*
     * =====================================================
     * CALL DURATION
     *
     * Stored in seconds
     * =====================================================
     */

    private Long callDuration;


    /*
     * =====================================================
     * GET RECEIVER
     * =====================================================
     */

    public String getReceiver() {

        return receiver;

    }


    /*
     * =====================================================
     * SET RECEIVER
     * =====================================================
     */

    public void setReceiver(
            String receiver
    ) {

        this.receiver = receiver;

    }


    /*
     * =====================================================
     * GET CALL TYPE
     * =====================================================
     */

    public String getCallType() {

        return callType;

    }


    /*
     * =====================================================
     * SET CALL TYPE
     * =====================================================
     */

    public void setCallType(
            String callType
    ) {

        this.callType = callType;

    }


    /*
     * =====================================================
     * GET CALL STATUS
     * =====================================================
     */

    public String getCallStatus() {

        return callStatus;

    }


    /*
     * =====================================================
     * SET CALL STATUS
     * =====================================================
     */

    public void setCallStatus(
            String callStatus
    ) {

        this.callStatus = callStatus;

    }


    /*
     * =====================================================
     * GET CALL DURATION
     * =====================================================
     */

    public Long getCallDuration() {

        return callDuration;

    }


    /*
     * =====================================================
     * SET CALL DURATION
     * =====================================================
     */

    public void setCallDuration(
            Long callDuration
    ) {

        this.callDuration = callDuration;

    }

}