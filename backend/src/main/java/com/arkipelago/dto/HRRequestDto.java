package com.arkipelago.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class HRRequestDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateHRRequest {
        @NotBlank
        private String requestType; // overtime, leave, schedule_adjustment, official_business, reimbursement, submit_complaint

        private String calendarDate;
        private String clockIn;
        private String clockOut;

        @NotBlank
        private String reason;

        private String leaveType;
        private BigDecimal amountPhp;
        private String complaintCategory;
        private boolean confidential;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewHRRequest {
        @NotBlank
        private String status; // approved, rejected
        private String resolutionNotes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HRRequestResponse {
        private UUID id;
        private UUID userId;
        private String userName;
        private String userEmail;
        private String requestType;
        private String status;
        private String calendarDate;
        private String clockIn;
        private String clockOut;
        private String reason;
        private String resolutionNotes;
        private String leaveType;
        private BigDecimal amountPhp;
        private String complaintCategory;
        private boolean confidential;
        private Instant createdAt;
    }
}
