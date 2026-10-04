package com.arkipelago.repository;

import com.arkipelago.domain.WallPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WallPostRepository extends JpaRepository<WallPost, UUID> {
    List<WallPost> findAllByOrderByCreatedAtDesc();
    List<WallPost> findByCategoryOrderByCreatedAtDesc(String category);
}
