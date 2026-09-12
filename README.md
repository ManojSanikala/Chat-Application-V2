# Real-Time Chat Application

A full-stack real-time private chat application built using Spring Boot, WebSocket, STOMP, JWT authentication, MySQL, HTML, CSS, and JavaScript.

The application supports real-time messaging, voice messages, file sharing, audio/video calling, call history, user blocking, disappearing messages, profile management, and more.

---

# Features

## Authentication and User Management

- User registration
- Secure password encryption
- JWT authentication
- Current logged-in user
- User profile management
- Display name
- Email
- Bio
- Profile picture
- Update profile information
- Delete own account

---

# Real-Time Chat

- Private one-to-one messaging
- Real-time message delivery
- WebSocket communication
- STOMP messaging
- Chat history
- Online status
- Offline status
- Last seen
- Unread message count
- Message delivery status
- Read receipts

---

# Message Features

- Send text messages
- Edit messages
- Reply to messages
- Forward messages
- Message options menu
- Message timestamps
- Sent and received message alignment
- Voice messages
- Audio playback
- File sharing
- Attachment support

---

# Disappearing Messages

Users can configure disappearing messages for individual chats.

Supported options include:

- Off
- 30 minutes
- 1 hour
- 2 hours
- 1 day
- 7 days
- 30 days
- Custom duration

Expired messages are automatically removed.

---

# User Blocking

Users can:

- Block another user
- Unblock another user
- Check block status
- Prevent unwanted interaction

Users cannot block themselves.

---

# Voice and Video Calling

The application supports real-time calling using WebRTC.

Features include:

- Voice calls
- Video calls
- Incoming call notification
- Accept call
- Reject call
- Cancel call before answer
- End call
- Mute microphone
- Enable/disable video
- WebRTC peer connection
- Real-time signaling

---

# Call History

Call information is stored for both users.

Call history includes:

- Caller
- Receiver
- Call type
- Voice call
- Video call
- Call status
- Completed calls
- Cancelled calls
- Rejected calls
- Call duration

Call history is delivered in real time to both participants.

---

# Profile Management

Users can update their personal profile.

Supported profile fields:

- Username
- Display name
- Email
- Bio
- Profile picture

Profile information is stored in the database and returned through the API.

---

# Backend Technology

- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- WebSocket
- STOMP
- MySQL
- Maven

---

# Frontend Technology

- HTML
- CSS
- JavaScript
- WebSocket Client
- STOMP Client
- WebRTC

---

# Project Structure

```text
chat-application
│
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── chat
│   │   │           └── app
│   │   │               ├── controller
│   │   │               ├── service
│   │   │               ├── repository
│   │   │               ├── model
│   │   │               ├── dto
│   │   │               ├── config
│   │   │               └── security
│   │   │
│   │   └── resources
│   │       ├── static
│   │       └── application.properties
│
├── pom.xml
│
└── README.md