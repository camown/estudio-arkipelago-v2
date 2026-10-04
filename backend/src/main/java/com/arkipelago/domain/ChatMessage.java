package com.arkipelago.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(nullable = false)
    private String senderName;

    private String senderRole;

    @Column(nullable = false, length = 64)
    private String threadId; // e.g. "thread-001", "MT-2024", "CV-2024"

    private String projectCode;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private String attachmentUrl;

    @Column(columnDefinition = "TEXT")
    private String reactionsJson; // e.g. {"👍": ["admin@arkipelago.ph"], "🔥": ["junior@arkipelago.ph"]}

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
