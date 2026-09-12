package com.chat.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_blocks")
public class UserBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String blockerUsername;

    @Column(nullable = false, length = 50)
    private String blockedUsername;

    public UserBlock() {
    }

    public UserBlock(String blockerUsername, String blockedUsername) {
        this.blockerUsername = blockerUsername;
        this.blockedUsername = blockedUsername;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBlockerUsername() { return blockerUsername; }
    public void setBlockerUsername(String blockerUsername) { this.blockerUsername = blockerUsername; }
    public String getBlockedUsername() { return blockedUsername; }
    public void setBlockedUsername(String blockedUsername) { this.blockedUsername = blockedUsername; }
}
