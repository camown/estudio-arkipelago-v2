package com.arkipelago.repository;

import com.arkipelago.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByThreadIdOrderByCreatedAtAsc(String threadId);
    List<ChatMessage> findByProjectCodeOrderByCreatedAtAsc(String projectCode);
}
