package com.arkipelago.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 32)
    private String code; // e.g. "MT-2024", "CV-2024"

    @Column(nullable = false)
    private String name;

    private String clientName;

    @Column(nullable = false, length = 32)
    private String status; // "active", "on-hold", "completed"

    @Column(precision = 14, scale = 2)
    private BigDecimal contractAmountPhp;

    // Standard 5-stage architectural billing breakdown (%)
    @Builder.Default
    private int schematicPct = 15;

    @Builder.Default
    private int designDevPct = 20;

    @Builder.Default
    private int contractDocsPct = 35;

    @Builder.Default
    private int biddingPct = 5;

    @Builder.Default
    private int constructionAdminPct = 25;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
