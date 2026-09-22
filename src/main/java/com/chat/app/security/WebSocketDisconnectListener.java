package com.chat.app.security;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.chat.app.service.UserService;

@Component
public class WebSocketDisconnectListener {

    private final UserService userService;

    public WebSocketDisconnectListener(
            UserService userService
    ) {
        this.userService = userService;
    }


    @EventListener
    public void handleWebSocketDisconnect(
            SessionDisconnectEvent event
    ) {

        if (
                event.getUser() != null
        ) {

            String username =
                    event
                            .getUser()
                            .getName();

            System.out.println(
                    "WebSocket disconnected: "
                            + username
            );

            userService.updateOfflineStatus(
                    username
            );
        }
    }
}