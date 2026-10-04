package com.arkipelago.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

public class NotificationDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PushKeyDto {
        @NotBlank
        private String p256dh;

        @NotBlank
        private String auth;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PushSubscriptionPayload {
        @NotBlank
        private String endpoint;

        @NotNull
        private PushKeyDto keys;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscribeRequest {
        @NotNull
        private PushSubscriptionPayload subscription;

        private String userEmail;
        private UUID userId;
        private String userAgent;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendPushRequest {
        private String title;

        @NotBlank
        private String message;

        private String url;
        private String tag;
        private String targetEmail;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PushResponse {
        private boolean success;
        private int sentCount;
        private int totalTargets;
        private String message;
        private String error;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PushSubscriptionInfoDto {
        private UUID id;
        private String userEmail;
        private String endpoint;
        private String userAgent;
        private Instant createdAt;
    }
}
