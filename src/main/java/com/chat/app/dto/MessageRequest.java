//What is DTO
// Data Transfer Object is a java object used for transferring data from client to server
package com.chat.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MessageRequest {
	@NotNull(message = "User Id is required")
	private Long userId;
	private Long receiverId;
	@NotBlank(message = "Content cannot be empty")
	private String content;
	@NotBlank(message = "Timestamp is required")
	private String timestamp;
	public MessageRequest() {
		super();
	}
	public MessageRequest(Long userId, Long receiverId, String content, String timestamp) {
		super();
		this.userId = userId;
		this.receiverId = receiverId;
		this.content = content;
		this.timestamp = timestamp;
	}
	public long getUserId() {
		return userId;
	}
	public void setUserId(long userId) {
		this.userId = userId;
	}
	
	public Long getReceiverId() {
		return receiverId;
	}
	public void setReceiverId(Long receiverId) {
		this.receiverId = receiverId;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public String getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}
	
}
