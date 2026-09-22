package com.chat.app.dto;

public class AdminDashboardResponse {

    private long totalUsers;

    private long onlineUsers;

    private long offlineUsers;

    private long totalMessages;

    private long totalFriendRequests;

    private long totalCalls;


    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }


    public long getOnlineUsers() {
        return onlineUsers;
    }

    public void setOnlineUsers(long onlineUsers) {
        this.onlineUsers = onlineUsers;
    }


    public long getOfflineUsers() {
        return offlineUsers;
    }

    public void setOfflineUsers(long offlineUsers) {
        this.offlineUsers = offlineUsers;
    }


    public long getTotalMessages() {
        return totalMessages;
    }

    public void setTotalMessages(long totalMessages) {
        this.totalMessages = totalMessages;
    }


    public long getTotalFriendRequests() {
        return totalFriendRequests;
    }

    public void setTotalFriendRequests(long totalFriendRequests) {
        this.totalFriendRequests = totalFriendRequests;
    }


    public long getTotalCalls() {
        return totalCalls;
    }

    public void setTotalCalls(long totalCalls) {
        this.totalCalls = totalCalls;
    }

}