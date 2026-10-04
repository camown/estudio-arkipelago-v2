package com.arkipelago.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

public class SketchDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaveSketchRequest {
        @NotBlank
        private String projectCode;

        @NotBlank
        private String sheetCode;

        @NotBlank
        private String title;

        private String canvasDataJson;
        private String layersJson;
        private String scaleRatio = "1:100";
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SketchSessionDto {
        private UUID id;
        private String projectCode;
        private String sheetCode;
        private String title;
        private String canvasDataJson;
        private String layersJson;
        private String scaleRatio;
        private String updatedByEmail;
        private Instant updatedAt;
    }
}
