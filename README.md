\# Connect



<p align="center">

&#x20; <strong>Connect — Real-Time Communication Platform</strong>

</p>



<p align="center">

&#x20; A full-stack real-time communication application built with Java, Spring Boot,

&#x20; WebSocket/STOMP, WebRTC, JWT authentication and MySQL.

</p>



\---



\## 📌 Overview



Connect is a real-time communication platform designed for private one-to-one conversations and real-time user interaction.



The application provides messaging, file sharing, voice messages, voice/video calling, friend management, disappearing messages, profile management and call history.



A separate administrator dashboard is provided for application-level monitoring and management.



The application uses:



\- REST APIs for standard application operations

\- WebSocket/STOMP for real-time events and messaging

\- WebRTC for voice and video communication

\- JWT for authentication

\- MySQL for persistent data storage



\---



\# 🚀 Features



\## 🔐 Authentication



\- User registration

\- User login

\- JWT-based authentication

\- Password encryption

\- Authentication validation

\- Current user information

\- Session handling

\- Logout support



\---



\## 👤 User Management



Users can:



\- View available users

\- Search users by username

\- Manage their profile

\- Change display name

\- Update email

\- Update bio

\- Upload profile picture

\- View profile information

\- Delete their account



\---



\## 💬 Real-Time Messaging



Connect supports private one-to-one communication.



Features include:



\- Real-time private messaging

\- WebSocket communication

\- STOMP messaging

\- Message history

\- Online/offline status

\- Last seen

\- Typing indicator

\- Unread message count

\- Message delivery status

\- Read receipts



\---



\## 📝 Message Operations



Users can:



\- Send text messages

\- Edit messages

\- Delete messages

\- Reply to messages

\- React to messages

\- View message timestamps

\- Manage message options



\---



\## 📎 File and Media Sharing



Connect supports:



\- Image uploads

\- File uploads

\- Attachment sharing

\- Media display

\- Shared links

\- Shared documents



Uploaded files are stored outside the source code and served through the application.



\---



\## 🎤 Voice Messages



Users can:



\- Record voice messages

\- Send voice messages

\- Play received voice messages

\- View voice message duration



\---



\# 📞 Voice Calling



Connect provides real-time voice communication using WebRTC.



Supported features:



\- Outgoing calls

\- Incoming calls

\- Accept call

\- Reject call

\- Cancel call before answer

\- End call

\- Mute microphone

\- Call timer

\- Real-time call signaling



\---



\# 🎥 Video Calling



The application also supports WebRTC video communication.



Features include:



\- Voice + video calling

\- Incoming video calls

\- Accept/reject

\- Camera enable/disable

\- Microphone mute/unmute

\- End call

\- Real-time call signaling



\---



\# 📋 Call History



Call information is maintained for communication participants.



Call history can include:



\- Caller

\- Receiver

\- Call type

\- Incoming/outgoing direction

\- Call status

\- Call duration

\- Call timestamp



\---



\# ⏳ Disappearing Messages



Users can configure disappearing-message settings for individual conversations.



Supported durations include predefined and custom time values.



Messages configured for expiration can automatically disappear after the selected duration.



\---



\# 🚫 User Blocking



Users can:



\- Block another user

\- Unblock another user

\- Check block status

\- Prevent unwanted communication



\---



\# 👥 Friend Management



Connect supports friend/request management.



Users can:



\- Search for users

\- Send friend requests

\- Receive friend requests

\- Accept friend requests

\- Reject friend requests

\- Remove friends



\---



\# 👤 Profile Management



The profile management interface allows users to update:



\- Display name

\- Email

\- Bio

\- Profile picture



\---



\# 🛠️ Admin Dashboard



The administrator is treated as an administration-only account and does not participate as a normal chat user.



The admin dashboard provides application-level analysis and management.



Admin functionality includes:



\- Dashboard statistics

\- User management

\- User search

\- User details

\- User status management

\- User role management

\- Message analysis

\- Message search

\- Message deletion

\- Call history analysis

\- Call search

\- Friend request analysis

\- User block analysis

\- Administrative deletion operations



The administrator cannot use normal user functionality such as:



\- Sending friend requests

\- Starting chats as a normal user

\- Making voice calls

\- Making video calls



\---



\# 🏗️ Architecture



```text

&#x20;                       ┌──────────────────────┐

&#x20;                       │      Connect UI      │

&#x20;                       │ HTML / CSS / JS      │

&#x20;                       └──────────┬───────────┘

&#x20;                                  │

&#x20;                   ┌──────────────┴──────────────┐

&#x20;                   │                             │

&#x20;                REST API                    WebSocket

&#x20;                   │                          / STOMP

&#x20;                   │                             │

&#x20;                   └──────────────┬──────────────┘

&#x20;                                  │

&#x20;                       ┌──────────▼───────────┐

&#x20;                       │    Spring Boot       │

&#x20;                       │   Backend Application │

&#x20;                       └──────────┬───────────┘

&#x20;                                  │

&#x20;              ┌───────────────────┼───────────────────┐

&#x20;              │                   │                   │

&#x20;       ┌──────▼──────┐    ┌──────▼──────┐     ┌──────▼──────┐

&#x20;       │ Spring      │    │ Spring      │     │ WebRTC      │

&#x20;       │ Security    │    │ Data JPA    │     │ Signaling   │

&#x20;       │ + JWT       │    │ + Hibernate │     │             │

&#x20;       └─────────────┘    └──────┬──────┘     └─────────────┘

&#x20;                                 │

&#x20;                          ┌──────▼──────┐

&#x20;                          │    MySQL    │

&#x20;                          └─────────────┘



📂 Project Structure



chat-app/

│

├── src/

│   ├── main/

│   │   ├── java/

│   │   │   └── com/

│   │   │       └── chat/

│   │   │           └── app/

│   │   │               ├── config/

│   │   │               ├── controller/

│   │   │               ├── dto/

│   │   │               ├── enums/

│   │   │               ├── exception/

│   │   │               ├── listener/

│   │   │               ├── model/

│   │   │               ├── repository/

│   │   │               ├── security/

│   │   │               └── service/

│   │   │

│   │   └── resources/

│   │       ├── static/

│   │       │   ├── css/

│   │       │   ├── js/

│   │       │   ├── index.html

│   │       │   ├── login.html

│   │       │   ├── admin.html

│   │       │   └── call-logs.html

│   │       │

│   │       └── application.properties

│   │

│   └── test/

│

├── .env.example

├── .gitignore

├── pom.xml

├── mvnw

├── mvnw.cmd

├── README.md

├── Dockerfile

├── docker-compose.yml

└── .dockerignore





💻 Technology Stack



**Backend**

Java 17

Spring Boot

Spring Security

Spring Data JPA

Hibernate

WebSocket

STOMP

JWT

Maven



**Database**

MySQL



**Frontend**

HTML5

CSS3

JavaScript

Font Awesome

SockJS

STOMP.js

WebRTC



**DevOps**

Docker

Docker Compose

Git

GitHub

GitHub Actions

