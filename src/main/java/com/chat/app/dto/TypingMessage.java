package com.chat.app.dto;

public class TypingMessage {

    private String sender;

    private String receiver;

    private boolean typing;

    public TypingMessage() {
    }

    public TypingMessage(String sender, String receiver, boolean typing) {
        this.sender = sender;
        this.receiver = receiver;
        this.typing = typing;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getReceiver() {
        return receiver;
    }

    public void setReceiver(String receiver) {
        this.receiver = receiver;
    }

    public boolean isTyping() {
        return typing;
    }

    public void setTyping(boolean typing) {
        this.typing = typing;
    }
}