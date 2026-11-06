package com.marineai.controller;

import com.marineai.model.ChatRequest;
import com.marineai.model.ChatResponse;
import com.marineai.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody(required = false) ChatRequest request) {
        if (request == null) {
            request = new ChatRequest();
        }
        return ResponseEntity.ok(chatService.processChat(request));
    }
}
