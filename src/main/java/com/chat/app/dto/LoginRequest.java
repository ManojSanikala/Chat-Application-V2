package com.chat.app.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

	@NotBlank(message = "username is required")
	private String username;
	
	@NotBlank(message = "Password is required")
	private String password;

	public LoginRequest() {
		super();
	}

	public LoginRequest(@NotBlank(message = "username is required") String username,
			@NotBlank(message = "Password is required") String password) {
		super();
		this.username = username;
		this.password = password;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
	
	
}
