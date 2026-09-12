//package com.chat.app.dto;
//
//public class CallLogRequest {
//
//    /*
//     * =====================================================
//     * RECEIVER
//     *
//     * Caller is taken from authenticated user.
//     * Never trust caller from frontend.
//     * =====================================================
//     */
//
//    private String receiver;
//
//
//    /*
//     * =====================================================
//     * CALL TYPE
//     *
//     * VOICE
//     * VIDEO
//     * =====================================================
//     */
//
//    private String callType;
//
//
//    /*
//     * =====================================================
//     * CALL STATUS
//     *
//     * COMPLETED
//     * MISSED
//     * REJECTED
//     * CANCELLED
//     * =====================================================
//     */
//
//    private String callStatus;
//
//
//    /*
//     * =====================================================
//     * CALL DURATION
//     *
//     * Seconds
//     * =====================================================
//     */
//
//    private Long callDuration;
//
//
//    /*
//     * =====================================================
//     * DEFAULT CONSTRUCTOR
//     * =====================================================
//     */
//
//    public CallLogRequest() {
//
//    }
//
//
//    public String getReceiver() {
//
//        return receiver;
//
//    }
//
//    public void setReceiver(String receiver) {
//
//        this.receiver = receiver;
//
//    }
//
//
//    public String getCallType() {
//
//        return callType;
//
//    }
//
//    public void setCallType(String callType) {
//
//        this.callType = callType;
//
//    }
//
//
//    public String getCallStatus() {
//
//        return callStatus;
//
//    }
//
//    public void setCallStatus(String callStatus) {
//
//        this.callStatus = callStatus;
//
//    }
//
//
//    public Long getCallDuration() {
//
//        return callDuration;
//
//    }
//
//    public void setCallDuration(Long callDuration) {
//
//        this.callDuration = callDuration;
//
//    }
//
//}