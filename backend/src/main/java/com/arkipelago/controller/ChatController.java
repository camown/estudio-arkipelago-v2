package com.arkipelago.controller;

import com.arkipelago.dto.ChatDto;
import com.arkipelago.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Communications & Studio Wall", description = "Endpoints for project threads, team messaging, and studio announcements")
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/messages")
    @Operation(summary = "Send a new message to a project or direct thread")
    public ResponseEntity<ChatDto.ChatMessageDto> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChatDto.SendMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(userDetails.getUsername(), request));
    }

    @GetMapping("/threads/{threadId}")
    @Operation(summary = "Get all messages for a thread (e.g. thread-001 or MT-2024)")
    public ResponseEntity<List<ChatDto.ChatMessageDto>> getThreadMessages(@PathVariable String threadId) {
        return ResponseEntity.ok(chatService.getThreadMessages(threadId));
    }

    @PostMapping("/wall")
    @Operation(summary = "Publish an announcement or update on the Estudio Wall")
    public ResponseEntity<ChatDto.WallPostDto> createWallPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChatDto.CreateWallPostRequest request) {
        return ResponseEntity.ok(chatService.createWallPost(userDetails.getUsername(), request));
    }

    @GetMapping("/wall")
    @Operation(summary = "Get all studio wall announcement posts")
    public ResponseEntity<List<ChatDto.WallPostDto>> getWallPosts() {
        return ResponseEntity.ok(chatService.getWallPosts());
    }
}
