package com.arkipelago.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "hr_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HRRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 64)
    private String requestType; // overtime, leave, schedule_adjustment, official_business, reimbursement, submit_complaint

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "pending"; // pending, approved, rejected

    private String calendarDate;
    private String clockIn;
    private String clockOut;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    private String leaveType;

    @Column(precision = 12, scale = 2)
    private BigDecimal amountPhp;

    private String complaintCategory;

    @Builder.Default
    private boolean confidential = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
