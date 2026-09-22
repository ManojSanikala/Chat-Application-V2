# 🚀 Connect

## Real-Time Communication Platform

**Connect** is a full-stack real-time communication application built with **Java 17, Spring Boot, Spring Security, JWT, Spring Data JPA, Hibernate, WebSocket/STOMP, WebRTC, MySQL, Docker, Docker Compose, Maven, Git, GitHub, and GitHub Actions**.

Connect provides **real-time private messaging, voice messages, voice calling, video calling, friend management, file sharing, disappearing messages, profile management, user blocking, call history, notifications, and a dedicated admin dashboard**.

---

# 📌 About Connect

Connect is designed as a modern **real-time communication platform** for private one-to-one conversations.

The application combines traditional REST APIs with real-time communication technologies.

### Core communication technologies

- **REST API** for standard application operations
- **WebSocket / STOMP** for real-time communication
- **WebRTC** for real-time voice and video calling
- **JWT** for authentication
- **Spring Security** for authentication and authorization
- **Spring Data JPA / Hibernate** for database operations
- **MySQL** for persistent data
- **Docker / Docker Compose** for containerized execution
- **GitHub Actions** for continuous integration

The application provides two separate experiences:

### USER APPLICATION

Users can:

- Send and receive messages
- Search users
- Send friend requests
- Accept and reject friend requests
- Manage friends
- Send files and images
- Send voice messages
- Make voice calls
- Make video calls
- View call history
- Use disappearing messages
- Block and unblock users
- Manage their profile
- View online/offline status
- Use typing indicators
- Edit and delete messages
- React to messages
- Reply to messages

### ADMIN APPLICATION

The administrator has a dedicated dashboard for **application-level analysis and management**.

The admin can analyze:

- Application statistics
- Users
- Messages
- Call history
- Friend requests
- User blocks

The administrator is an **administration-only account** and does not participate in normal user communication.

---

# ✨ Main Features

# 🔐 Authentication & Security

Connect provides secure authentication and authorization.

### Features

- User registration
- User login
- JWT authentication
- Password encryption
- Authentication validation
- Logout
- Session handling
- Role-based authorization
- USER role
- ADMIN role
- Protected APIs
- Secure WebSocket authentication

---

# 👤 User Management

Users can manage their own account and interact with other registered users.

### Features

- View available users
- Search users
- View user profiles
- Update display name
- Update email
- Update bio
- Upload profile picture
- Update profile picture
- View online/offline status
- View last seen information
- Manage account information
- Delete account

---

# 💬 Real-Time Messaging

Connect provides private one-to-one real-time messaging.

### Features

- Private messaging
- Real-time message delivery
- WebSocket communication
- STOMP messaging
- Message history
- Typing indicators
- Online status
- Offline status
- Last seen
- Unread message count
- Read receipts
- Message status
- Real-time notifications

---

# 📝 Message Management

Users can manage their messages directly from the conversation.

### Supported Operations

- Send messages
- Edit messages
- Delete messages
- Reply to messages
- React to messages
- View timestamps
- Message options
- Message status updates

---

# 👍 Message Reactions

Users can react to messages in real time.

### Features

- Add reactions
- Remove reactions
- Real-time reaction updates
- Persistent reactions

---

# ↩️ Message Replies

Users can reply to individual messages.

### Features

- Reply to a specific message
- Show original message context
- Real-time reply handling
- Store reply information

---

# 📎 File & Media Sharing

Connect supports sharing files and media inside conversations.

### Supported Content

- Images
- Files
- Documents
- Media
- Shared links
- Attachments

The application also supports configurable file-upload limits.

Current configuration:

- Maximum file size: **12 MB**
- Maximum request size: **12 MB**

---

# 🎤 Voice Messages

Users can communicate through recorded voice messages.

### Features

- Record voice messages
- Send voice messages
- Receive voice messages
- Play voice messages
- Display voice-message duration
- Real-time delivery

---

# 📞 Voice Calling

Connect supports real-time voice calls using **WebRTC**.

### Voice Call Features

- Outgoing voice calls
- Incoming voice calls
- Accept call
- Reject call
- Cancel call before answer
- End call
- Mute microphone
- Unmute microphone
- Call timer
- Real-time call signaling

---

# 🎥 Video Calling

Connect supports real-time video communication using **WebRTC**.

### Video Call Features

- Outgoing video calls
- Incoming video calls
- Accept video call
- Reject video call
- Cancel call
- End call
- Camera control
- Microphone control
- Mute / Unmute
- WebRTC peer connection
- Real-time call signaling

---

# 🌐 WebRTC Communication

WebRTC is used for real-time audio and video communication between users.

### Call Flow


User A
   |
   | Call Request
   v
Spring Boot + WebSocket
   |
   | Signaling
   v
User B
   |
   v
WebRTC Peer Connection
   |
   +----------------------+
   |                      |
   v                      v
 Audio                 Video

WebSocket/STOMP is used for call signaling while WebRTC handles the real-time audio and video connection.

📋 Call History

Connect maintains call-related information.

Call Information
Caller
Receiver
Call type
Voice call
Video call
Call status
Completed calls
Cancelled calls
Rejected calls
Call duration
Call timestamp
Incoming call information
Outgoing call information
⏳ Disappearing Messages

Connect supports disappearing messages for conversations.

Available Options
Off
30 Minutes
1 Hour
2 Hours
1 Day
7 Days
30 Days
Custom duration

Users can configure disappearing-message settings for individual conversations.

Messages can automatically expire according to the selected duration.

👥 Friend Management

Connect provides friend-request functionality.

Features
Search users
Send friend requests
Receive friend requests
Accept friend requests
Reject friend requests
Manage friendships
Real-time friend-request notifications


🚫 User Blocking

Users can control unwanted communication.

Features
Block another user
Unblock another user
Check block status
Restrict unwanted communication


👤 Profile Management

Users can manage their profile information.

Profile Information
Username
Display name
Email
Bio
Profile picture


🔔 Real-Time Notifications

Connect uses WebSocket/STOMP for real-time application events.

Supported Events
New messages
Typing status
Online status
Offline status
Unread count updates
Message status updates
Message editing
Message deletion
Message reactions
Friend requests
Call events
Presence updates
🛠️ Admin Dashboard

Connect provides a separate administrative dashboard.

The administrator is an administration-only account and does not act as a normal chat user.

Admin Capabilities
Dashboard statistics
User analysis
User search
User details
User status management
Message analysis
Message search
Message management
Call history analysis
Call search
Call detail analysis
Friend request analysis
User block analysis
Administrative operations
Admin Restrictions

The administrator does not use normal user communication features such as:

Sending friend requests
Starting normal chats
Making voice calls
Making video calls

The application is designed around one administration account.

👑 User and Admin Model
                        CONNECT
                           |
              +------------+------------+
              |                         |
              v                         v
            USER                      ADMIN
              |                         |
              |                         |
      Communication               Application
       & Social Features           Analysis
              |                         |
     +--------+--------+        +-------+-------+
     |        |        |        |       |       |
    Chat    Calls    Friends   Users  Messages Calls
     |
     +-- Files
     |
     +-- Voice Messages
     |
     +-- Profile
     |
     +-- Blocking

     
🏗️ Application Architecture
                         CONNECT
                            |
             +--------------+--------------+
             |                             |
             v                             v
      User Application              Admin Dashboard
             |                             |
             +--------------+--------------+
                            |
                            v
                 +----------------------+
                 |     Spring Boot      |
                 |       Backend        |
                 +----------+-----------+
                            |
          +-----------------+------------------+
          |                 |                  |
          v                 v                  v
     REST APIs        WebSocket / STOMP      WebRTC
          |                 |                  |
          |                 |                  |
          v                 v                  v
    Service Layer      Real-Time Events    Audio / Video
          |
          v
    Repository Layer
          |
          v
        MySQL

        
🔄 REST API Flow
Client
   |
   v
Controller
   |
   v
Service
   |
   v
Repository
   |
   v
MySQL


🔄 Real-Time Messaging Flow
User A
   |
   v
WebSocket / STOMP
   |
   v
Spring Boot
   |
   v
WebSocket / STOMP
   |
   v
User B

🔐 Authentication Flow
User Login
    |
    v
Authentication Controller
    |
    v
Spring Security
    |
    v
Credential Validation
    |
    v
JWT Generation
    |
    v
Client
    |
    v
JWT Sent With Requests
    |
    v
JWT Authentication Filter
    |
    v
Protected Resource


📞 Calling Flow
User A
   |
   | Call Request
   v
Spring Boot
   |
   | WebSocket / STOMP Signaling
   v
User B
   |
   v
WebRTC Connection
   |
   +-------------------+
   |                   |
   v                   v
 Audio               Video

 
🧩 Backend Architecture

Connect follows a layered Spring Boot architecture.

Controller Layer
       |
       v
Service Layer
       |
       v
Repository Layer
       |
       v
Entity / Model Layer
       |
       v
MySQL Database

🎯 Controller Layer

The controller layer handles REST and application requests.

Main controllers include:

AdminController
AuthController
CallController
CallHistoryController
CallLogController
ChatController
ConversationSettingController
FileUploadController
FriendRequestController
HomeController
MessageController
UserController

⚙️ Service Layer

The service layer contains application business logic.

Major services include:

AdminService
UserService
MessageService
FriendRequestService
MessageReactionService
UserBlockService
ConversationSettingService
CallLogService

🗃️ Repository Layer

The repository layer handles database access using Spring Data JPA.

Repositories include:

UserRepository
MessageRepository
FriendRequestRepository
UserBlockRepository
MessageReactionRepository
ConversationSettingRepository
CallLogRepository


🧱 Domain Models

Connect contains domain models representing the application's main business data.

User

Stores user account, authentication, role, profile, and presence information.

Message

Stores communication and message-related information.

FriendRequest

Stores friendship requests and request status.

UserBlock

Stores user blocking relationships.

MessageReaction

Stores message reactions.

ConversationSetting

Stores conversation-level configuration such as disappearing messages.

CallLog

Stores call-related information.

🔐 Security Architecture

Connect uses Spring Security + JWT.

Security components include:

SecurityConfig
CustomUserDetails
CustomUserDetailsService
JwtAuthenticationFilter
JwtService
WebSocketAuthChannelInterceptor
WebSocketDisconnectListener

The security layer protects authenticated REST APIs and WebSocket communication.

📡 WebSocket Architecture

WebSocket functionality is implemented using:

WebSocketConfig
WebSocket authentication interceptor
WebSocket event handling
STOMP messaging

WebSocket/STOMP is responsible for real-time events such as:

Messages
Typing
Presence
Friend requests
Message status
Reactions
Calls
Unread counts

🧯 Exception Handling

Connect contains centralized exception handling.

Main components include:

GlobalExceptionHandler
ErrorResponse
UserNotFoundException

This provides consistent application-error responses.

💻 Technology Stack
Backend
Java 17
Spring Boot
Spring Security
Spring Data JPA
Hibernate
Spring Web
Spring WebSocket
Spring Validation
JWT
Maven
Authentication
JWT
Spring Security
Password encryption
Database
MySQL 8.x
MySQL Connector/J
JPA
Hibernate
Frontend
HTML5
CSS3
JavaScript
Font Awesome
SockJS
STOMP.js
WebRTC
Testing
JUnit
Spring Boot Test
Maven Surefire
DevOps
Docker
Docker Compose
Git
GitHub
GitHub Actions
Maven Wrapper
Development Tools
Spring Tool Suite
Postman
GitHub
Docker Desktop

📂 Folder Structure
chat-app/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .mvn/
│   └── wrapper/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── chat/
│   │   │           └── app/
│   │   │
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
│   │   │               └── ChatAplicationBackendApplication.java
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
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── mvnw
├── mvnw.cmd
├── pom.xml
└── README.md

🌐 Frontend Structure
static/
│
├── index.html
├── login.html
├── admin.html
└── call-logs.html
CSS
css/
├── admin.css
├── call-logs.css
├── index.css
├── login.css
├── style.css
└── theme.css
JavaScript
js/
├── admin.js
├── app.js
├── call-logs.js
├── call.js
├── home-ui.js
├── index.js
├── messages.js
├── users.js
└── websocket.js


⚙️ Configuration

Connect supports environment-based configuration.

Important environment variables include:

DB_URL
DB_USERNAME
DB_PASSWORD
DDL_AUTO
SHOW_SQL
FORMAT_SQL
JWT_SECRET
JWT_EXPIRATION
PORT

Example configuration:

spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/CHAT_APP}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:root}

spring.jpa.hibernate.ddl-auto=${DDL_AUTO:update}

spring.jpa.show-sql=${SHOW_SQL:false}

spring.jpa.properties.hibernate.format_sql=${FORMAT_SQL:false}

jwt.secret=${JWT_SECRET:replace-with-a-secret}

jwt.expiration=${JWT_EXPIRATION:604800000}

server.port=${PORT:8080}

🔒 Environment & Secret Management

The project contains:

.env.example

A real .env file should remain local.

Never commit:

Database passwords
JWT secrets
API keys
Private certificates
Production credentials
Real .env files
🖥️ Running Connect with STS

Connect can be run directly from Spring Tool Suite for local development.

Requirements
Java 17
MySQL
Spring Tool Suite
Maven
Steps
Start MySQL.
Make sure the CHAT_APP database is available.
Configure the required database and JWT properties.
Run the Spring Boot application from STS.

Local application:

http://localhost:8080

🐳 Running Connect with Docker

Connect can run completely using Docker.

There is no need to run the Spring Boot application separately from STS when using Docker.

Docker Compose runs:

Connect Spring Boot application
MySQL database


🚀 Docker Requirements
Docker Desktop
Docker Compose

Check installation:

docker --version
docker compose version


▶️ Start Connect with Docker

Open PowerShell:

cd "E:\chat Zip\chat-app_git_Final\chat-app"

Start the containers:

docker compose up -d

Check status:

docker compose ps

Expected services:

connect-app
connect-mysql

The MySQL service should show:

healthy


🌐 Docker Application URLs

Current Docker configuration:

Windows Port: 8081
Container Port: 8080
Main Application
http://localhost:8081
Login
http://localhost:8081/login.html
Admin Dashboard
http://localhost:8081/admin.html
Call History
http://localhost:8081/call-logs.html
🔨 Docker Commands
Start existing containers
docker compose up -d
Rebuild after code changes
docker compose up --build -d
Check container status
docker compose ps
View application logs
docker compose logs -f app
View MySQL logs
docker compose logs -f mysql
Stop containers
docker compose down
Start again
docker compose up -d
Remove containers and database volume
docker compose down -v

Warning: docker compose down -v removes the Docker-managed database volume and deletes the database data stored in that volume.

🧱 Docker Architecture

Connect uses a multi-stage Docker build.

Build Stage
     |
     v
Maven + Java 17
     |
     v
Build Spring Boot JAR
     |
     v
Runtime Stage
     |
     v
Java 17 JRE
     |
     v
Connect Application

Docker Compose manages:

+----------------------+
|   Connect App        |
|   Spring Boot        |
+----------+-----------+
           |
           | Docker Network
           |
+----------v-----------+
|        MySQL         |
|       Database       |
+----------------------+

Persistent Docker volumes:

connect_mysql_data
connect_uploads

📦 Data Persistence

Docker volumes are used to persist application data.

MySQL data
connect_mysql_data
Uploaded files
connect_uploads

Persistent volumes ensure database data and uploaded files can remain available when containers are stopped and recreated.

🧪 Testing

Run the test suite using Maven Wrapper.

Windows PowerShell
.\mvnw.cmd clean test

Build the project:

.\mvnw.cmd clean package

Expected result:
BUILD SUCCESS

🔄 Continuous Integration

The project includes a GitHub Actions workflow:

.github/workflows/ci.yml

**CI Flow**
Git Push / Pull Request
          |
          v
   Checkout Source
          |
          v
       Java 17
          |
          v
        Maven
          |
          v
        Tests
          |
          v
     Build Result

The CI workflow automatically checks the project build and tests.

🔁 Development Workflow
Local STS Development
Spring Tool Suite
       |
       v
Spring Boot
       |
       v
MySQL
       |
       v
localhost:8080


Docker Development
Docker Desktop
       |
       v
Docker Compose
       |
       +-------------> MySQL
       |
       +-------------> Connect Spring Boot
                              |
                              v
                        localhost:8081

📊 Application Flow
User
 |
 v
Connect Login
 |
 v
JWT Authentication
 |
 +----------------------+
 |                      |
 v                      v
REST API             WebSocket
 |                      |
 v                      v
Business Logic      Real-Time Events
 |                      |
 +----------+-----------+
            |
            v
          MySQL
          
📈 Production-Oriented Practices
Connect includes several production-oriented concepts:

Layered Spring Boot architecture
REST API design
Spring Security
JWT authentication
Role-based authorization
Password encryption
WebSocket communication
STOMP messaging
WebRTC communication
Centralized exception handling
Environment-based configuration
Docker containerization
Docker Compose
Persistent database storage
Persistent upload storage
Non-root Docker runtime
Maven build automation
GitHub Actions CI
Git-based version control

🔐 Security Considerations
For production deployment:

Use strong database passwords
Use strong randomly generated JWT secrets
Keep secrets outside source control
Use HTTPS
Protect admin credentials
Restrict database access
Use environment variables
Use a secure secret-management solution
Avoid exposing MySQL publicly
Configure appropriate production logging

🚀 Future Enhancements
Possible future improvements include:

PostgreSQL
Redis caching
Spring Boot Actuator
Prometheus
Grafana
Centralized logging
HTTPS
Reverse proxy
Cloud deployment
Object storage for media
Flyway
Liquibase
Container orchestration
Automated deployment
Monitoring and alerting
Application performance monitoring

🎯 Portfolio Highlights
This project demonstrates practical implementation of:

Java 17
Spring Boot
Spring Security
JWT Authentication
REST APIs
Spring Data JPA
Hibernate
MySQL
WebSocket
STOMP
WebRTC
Real-Time Messaging
Voice Calling
Video Calling
Friend Management
File Uploads
Voice Messages
Message Reactions
Message Editing
Message Deletion
Message Replies
Disappearing Messages
User Blocking
Profile Management
Call History
Admin Dashboard
Docker
Docker Compose
GitHub
GitHub Actions

📚 Technical Concepts Demonstrated
Connect demonstrates practical knowledge of:

Object-Oriented Programming
Layered Architecture
Dependency Injection
REST API Development
Authentication
Authorization
JWT Token Processing
Password Encryption
Database Persistence
JPA Entity Mapping
Hibernate
WebSocket Communication
STOMP Messaging
Real-Time Event Handling
WebRTC Signaling
File Upload Handling
Exception Handling
Environment Configuration
Docker Containerization
Docker Compose
CI Automation
Git Version Control
GitHub Repository Management

🏆 Project Highlights

Connect brings together multiple backend and real-time technologies into one application.

Backend

Java 17 + Spring Boot + Spring Security + JWT + JPA + Hibernate

Real-Time

WebSocket + STOMP + WebRTC

Database

MySQL

Frontend

HTML + CSS + JavaScript

DevOps

Docker + Docker Compose + GitHub Actions

👨‍💻 Author
Manoj Sanikala

Java Backend Developer

Technologies: Java | Spring Boot | MySQL | REST API | WebSocket | WebRTC | Docker

GitHub: [ManojSanikala](https://github.com/ManojSanikala)

⭐ Connect

Connect is a full-stack real-time communication platform that combines secure backend development, REST APIs, real-time WebSocket communication, WebRTC-based voice and video calling, database persistence, containerization, and continuous integration.

Built with Java. Powered by Spring Boot. Connected in real time.
