package com.chat.app.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chat.app.service.ConversationSettingService;

@RestController
@RequestMapping("/api/chat/settings")
public class ConversationSettingController {

    @Autowired
    private ConversationSettingService settingService;

    @GetMapping("/{username}")
    public ResponseEntity<Map<String, Long>> getSetting(@PathVariable String username, Principal principal) {
        long seconds = settingService.getDurationSeconds(principal.getName(), username);
        return ResponseEntity.ok(Map.of("disappearingSeconds", seconds));
    }

    @PostMapping("/{username}")
    public ResponseEntity<Map<String, Long>> setSetting(
            @PathVariable String username,
            @RequestParam("seconds") long seconds,
            Principal principal) {
        long saved = settingService.setDurationSeconds(principal.getName(), username, seconds);
        return ResponseEntity.ok(Map.of("disappearingSeconds", saved));
    }
}
