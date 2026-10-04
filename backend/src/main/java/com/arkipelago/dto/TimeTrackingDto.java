package com.arkipelago.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

public class TimeTrackingDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClockInRequest {
        @NotBlank
        private String projectCode;

        private String projectName;
        private String note;
        private boolean billable = true;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClockOutRequest {
        private String note;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimeEntryDto {
        private UUID id;
        private UUID userId;
        private String userEmail;
        private String userName;
        private String projectCode;
        private String projectName;
        private Instant startTime;
        private Instant endTime;
        private Long durationSeconds;
        private String durationFormatted;
        private String note;
        private boolean billable;
        private boolean active;
    }
}
