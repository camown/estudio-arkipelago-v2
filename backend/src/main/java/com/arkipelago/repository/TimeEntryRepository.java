package com.arkipelago.repository;

import com.arkipelago.domain.TimeEntry;
import com.arkipelago.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, UUID> {

    // Find the currently active clock-in session (where endTime is null)
    Optional<TimeEntry> findByUserAndEndTimeIsNull(User user);

    List<TimeEntry> findByUserOrderByStartTimeDesc(User user);

    List<TimeEntry> findByProjectCodeOrderByStartTimeDesc(String projectCode);

    @Query("SELECT t FROM TimeEntry t WHERE t.user = :user AND t.startTime >= :since ORDER BY t.startTime DESC")
    List<TimeEntry> findByUserAndStartTimeAfter(@Param("user") User user, @Param("since") Instant since);

    @Query("SELECT t FROM TimeEntry t WHERE t.endTime IS NULL")
    List<TimeEntry> findAllActiveSessions();
}
