package com.arkipelago.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class ProjectDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectDetailDto {
        private UUID id;
        private String code;
        private String name;
        private String clientName;
        private String status;
        private BigDecimal contractAmountPhp;
        private int schematicPct;
        private int designDevPct;
        private int contractDocsPct;
        private int biddingPct;
        private int constructionAdminPct;
        private Instant createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateProjectRequest {
        @NotBlank
        private String code;

        @NotBlank
        private String name;

        private String clientName;
        private String status = "active";
        private BigDecimal contractAmountPhp;
    }
}
