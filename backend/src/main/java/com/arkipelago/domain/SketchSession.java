package com.arkipelago.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sketch_studio_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SketchSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 32)
    private String projectCode;

    @Column(nullable = false, length = 32)
    private String sheetCode; // e.g. "A-101", "S-201"

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "CLOB")
    private String canvasDataJson;

    @Column(columnDefinition = "CLOB")
    private String layersJson;

    @Builder.Default
    private String scaleRatio = "1:100"; // Architectural scale, e.g. "1:100", "1:50"

    private String updatedByEmail;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
