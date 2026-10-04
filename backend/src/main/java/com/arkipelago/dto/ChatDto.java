package com.arkipelago.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

public class ChatDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendMessageRequest {
        @NotBlank
        private String threadId;

        private String projectCode;

        @NotBlank
        private String content;

        private String attachmentUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatMessageDto {
        private UUID id;
        private UUID senderId;
        private String senderName;
        private String senderRole;
        private String threadId;
        private String projectCode;
        private String content;
        private String attachmentUrl;
        private String reactionsJson;
        private Instant createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateWallPostRequest {
        @NotBlank
        private String title;

        @NotBlank
        private String content;

        private String category = "ANNOUNCEMENT";
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WallPostDto {
        private UUID id;
        private UUID authorId;
        private String authorName;
        private String authorRole;
        private String title;
        private String content;
        private String category;
        private int likesCount;
        private Instant createdAt;
    }
}
