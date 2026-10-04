package com.arkipelago.service;

import com.arkipelago.domain.ChatMessage;
import com.arkipelago.domain.User;
import com.arkipelago.domain.WallPost;
import com.arkipelago.dto.ChatDto;
import com.arkipelago.repository.ChatMessageRepository;
import com.arkipelago.repository.UserRepository;
import com.arkipelago.repository.WallPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final WallPostRepository wallPostRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ChatDto.ChatMessageDto sendMessage(String userEmail, ChatDto.SendMessageRequest request) {
        User sender = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        ChatMessage message = ChatMessage.builder()
                .sender(sender)
                .senderName(sender.getName())
                .senderRole(sender.getRole().name())
                .threadId(request.getThreadId())
                .projectCode(request.getProjectCode())
                .content(request.getContent())
                .attachmentUrl(request.getAttachmentUrl())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        ChatDto.ChatMessageDto dto = mapToDto(saved);

        // Broadcast to WebSocket subscribers on this thread
        messagingTemplate.convertAndSend("/topic/chat/" + request.getThreadId(), dto);

        return dto;
    }

    public List<ChatDto.ChatMessageDto> getThreadMessages(String threadId) {
        return chatMessageRepository.findByThreadIdOrderByCreatedAtAsc(threadId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatDto.WallPostDto createWallPost(String userEmail, ChatDto.CreateWallPostRequest request) {
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        WallPost post = WallPost.builder()
                .author(author)
                .authorName(author.getName())
                .authorRole(author.getRole().name())
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory() != null ? request.getCategory() : "ANNOUNCEMENT")
                .likesCount(0)
                .build();

        WallPost saved = wallPostRepository.save(post);
        ChatDto.WallPostDto dto = mapToDto(saved);

        // Broadcast to all clients tuned into the studio wall
        messagingTemplate.convertAndSend("/topic/wall", dto);

        return dto;
    }

    public List<ChatDto.WallPostDto> getWallPosts() {
        return wallPostRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ChatDto.ChatMessageDto mapToDto(ChatMessage m) {
        return ChatDto.ChatMessageDto.builder()
                .id(m.getId())
                .senderId(m.getSender() != null ? m.getSender().getId() : null)
                .senderName(m.getSenderName())
                .senderRole(m.getSenderRole())
                .threadId(m.getThreadId())
                .projectCode(m.getProjectCode())
                .content(m.getContent())
                .attachmentUrl(m.getAttachmentUrl())
                .reactionsJson(m.getReactionsJson())
                .createdAt(m.getCreatedAt())
                .build();
    }

    private ChatDto.WallPostDto mapToDto(WallPost p) {
        return ChatDto.WallPostDto.builder()
                .id(p.getId())
                .authorId(p.getAuthor() != null ? p.getAuthor().getId() : null)
                .authorName(p.getAuthorName())
                .authorRole(p.getAuthorRole())
                .title(p.getTitle())
                .content(p.getContent())
                .category(p.getCategory())
                .likesCount(p.getLikesCount())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
