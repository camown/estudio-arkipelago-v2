package com.arkipelago.repository;

import com.arkipelago.domain.SketchSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SketchSessionRepository extends JpaRepository<SketchSession, UUID> {
    Optional<SketchSession> findByProjectCodeAndSheetCode(String projectCode, String sheetCode);
    List<SketchSession> findByProjectCodeOrderByUpdatedAtDesc(String projectCode);
}
