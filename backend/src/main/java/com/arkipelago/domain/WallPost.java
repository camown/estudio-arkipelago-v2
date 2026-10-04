package com.arkipelago.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "wall_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WallPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @Column(nullable = false)
    private String authorName;

    private String authorRole;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    private String category = "ANNOUNCEMENT"; // ANNOUNCEMENT, DESIGN_REVIEW, SITE_UPDATE, SHOUTOUT

    @Builder.Default
    private int likesCount = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
