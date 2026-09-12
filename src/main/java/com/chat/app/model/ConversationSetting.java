package com.chat.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "conversation_settings")
public class ConversationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String participantOne;

    @Column(nullable = false, length = 50)
    private String participantTwo;

    @Column(nullable = false)
    private long disappearingSeconds = 0L;

    public ConversationSetting() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getParticipantOne() { return participantOne; }
    public void setParticipantOne(String participantOne) { this.participantOne = participantOne; }
    public String getParticipantTwo() { return participantTwo; }
    public void setParticipantTwo(String participantTwo) { this.participantTwo = participantTwo; }
    public long getDisappearingSeconds() { return disappearingSeconds; }
    public void setDisappearingSeconds(long disappearingSeconds) { this.disappearingSeconds = disappearingSeconds; }
}
