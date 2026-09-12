package com.chat.app.dto;

public class BlockStatusResponse {
    private boolean blocked;

    public BlockStatusResponse() {
    }

    public BlockStatusResponse(boolean blocked) {
        this.blocked = blocked;
    }

    public boolean isBlocked() { return blocked; }
    public void setBlocked(boolean blocked) { this.blocked = blocked; }
}
