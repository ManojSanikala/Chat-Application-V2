//package com.chat.app.model;
//
//import jakarta.persistence.Entity;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.GenerationType;
//import jakarta.persistence.Id;
//import jakarta.persistence.JoinColumn;
//import jakarta.persistence.ManyToOne;
//import jakarta.persistence.Table;
//
//@Entity
//@Table(name = "call_logs")
//public class CallLog {
//
//    /*
//     * =====================================================
//     * ID
//     * =====================================================
//     */
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//
//    /*
//     * =====================================================
//     * CALLER
//     *
//     * User who started the call.
//     * =====================================================
//     */
//
//    @ManyToOne
//    @JoinColumn(name = "caller_id", nullable = false)
//    private User caller;
//
//
//    /*
//     * =====================================================
//     * RECEIVER
//     *
//     * User who received the call.
//     * =====================================================
//     */
//
//    @ManyToOne
//    @JoinColumn(name = "receiver_id", nullable = false)
//    private User receiver;
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
//     * CALL START TIME
//     *
//     * Stored as epoch milliseconds.
//     * =====================================================
//     */
//
//    private Long startedAt;
//
//
//    /*
//     * =====================================================
//     * CALL END TIME
//     *
//     * Stored as epoch milliseconds.
//     * =====================================================
//     */
//
//    private Long endedAt;
//
//
//    /*
//     * =====================================================
//     * CALL DURATION
//     *
//     * Stored in seconds.
//     * =====================================================
//     */
//
//    private Long duration;
//
//
//    /*
//     * =====================================================
//     * DEFAULT CONSTRUCTOR
//     * =====================================================
//     */
//
//    public CallLog() {
//
//    }
//
//
//    /*
//     * =====================================================
//     * ID
//     * =====================================================
//     */
//
//    public Long getId() {
//
//        return id;
//
//    }
//
//    public void setId(Long id) {
//
//        this.id = id;
//
//    }
//
//
//    /*
//     * =====================================================
//     * CALLER
//     * =====================================================
//     */
//
//    public User getCaller() {
//
//        return caller;
//
//    }
//
//    public void setCaller(User caller) {
//
//        this.caller = caller;
//
//    }
//
//
//    /*
//     * =====================================================
//     * RECEIVER
//     * =====================================================
//     */
//
//    public User getReceiver() {
//
//        return receiver;
//
//    }
//
//    public void setReceiver(User receiver) {
//
//        this.receiver = receiver;
//
//    }
//
//
//    /*
//     * =====================================================
//     * CALL TYPE
//     * =====================================================
//     */
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
//    /*
//     * =====================================================
//     * CALL STATUS
//     * =====================================================
//     */
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
//    /*
//     * =====================================================
//     * STARTED AT
//     * =====================================================
//     */
//
//    public Long getStartedAt() {
//
//        return startedAt;
//
//    }
//
//    public void setStartedAt(Long startedAt) {
//
//        this.startedAt = startedAt;
//
//    }
//
//
//    /*
//     * =====================================================
//     * ENDED AT
//     * =====================================================
//     */
//
//    public Long getEndedAt() {
//
//        return endedAt;
//
//    }
//
//    public void setEndedAt(Long endedAt) {
//
//        this.endedAt = endedAt;
//
//    }
//
//
//    /*
//     * =====================================================
//     * DURATION
//     * =====================================================
//     */
//
//    public Long getDuration() {
//
//        return duration;
//
//    }
//
//    public void setDuration(Long duration) {
//
//        this.duration = duration;
//
//    }
//
//}