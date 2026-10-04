package com.arkipelago.service;

import com.arkipelago.domain.Project;
import com.arkipelago.domain.TimeEntry;
import com.arkipelago.domain.User;
import com.arkipelago.dto.TimeTrackingDto;
import com.arkipelago.repository.ProjectRepository;
import com.arkipelago.repository.TimeEntryRepository;
import com.arkipelago.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeTrackingService {

    private final TimeEntryRepository timeEntryRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public TimeTrackingDto.TimeEntryDto clockIn(String userEmail, TimeTrackingDto.ClockInRequest request) {
        User user = getUserByEmail(userEmail);

        // Check if an active session already exists
        Optional<TimeEntry> existing = timeEntryRepository.findByUserAndEndTimeIsNull(user);
        if (existing.isPresent()) {
            throw new IllegalStateException("An active clock-in session is already running for this user.");
        }

        Project project = projectRepository.findByCode(request.getProjectCode()).orElse(null);
        String projectName = (project != null) ? project.getName() : request.getProjectName();
        if (projectName == null || projectName.isBlank()) {
            projectName = request.getProjectCode();
        }

        TimeEntry entry = TimeEntry.builder()
                .user(user)
                .project(project)
                .projectCode(request.getProjectCode())
                .projectName(projectName)
                .startTime(Instant.now())
                .note(request.getNote())
                .billable(request.isBillable())
                .build();

        TimeEntry saved = timeEntryRepository.save(entry);
        TimeTrackingDto.TimeEntryDto dto = mapToDto(saved);

        // Broadcast active status to all studio clients via WebSocket
        messagingTemplate.convertAndSend("/topic/attendance", dto);

        return dto;
    }

    @Transactional
    public TimeTrackingDto.TimeEntryDto clockOut(String userEmail, TimeTrackingDto.ClockOutRequest request) {
        User user = getUserByEmail(userEmail);

        TimeEntry active = timeEntryRepository.findByUserAndEndTimeIsNull(user)
                .orElseThrow(() -> new IllegalStateException("No active clock-in session found to clock out from."));

        Instant now = Instant.now();
        active.setEndTime(now);
        long seconds = Duration.between(active.getStartTime(), now).getSeconds();
        active.setDurationSeconds(seconds);

        if (request != null && request.getNote() != null && !request.getNote().isBlank()) {
            String combinedNote = (active.getNote() != null ? active.getNote() + " | " : "") + request.getNote();
            active.setNote(combinedNote);
        }

        TimeEntry saved = timeEntryRepository.save(active);
        TimeTrackingDto.TimeEntryDto dto = mapToDto(saved);

        // Broadcast updated status via WebSocket
        messagingTemplate.convertAndSend("/topic/attendance", dto);

        return dto;
    }

    public Optional<TimeTrackingDto.TimeEntryDto> getActiveSession(String userEmail) {
        User user = getUserByEmail(userEmail);
        return timeEntryRepository.findByUserAndEndTimeIsNull(user).map(this::mapToDto);
    }

    public List<TimeTrackingDto.TimeEntryDto> getTodayEntries(String userEmail) {
        User user = getUserByEmail(userEmail);
        Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);
        return timeEntryRepository.findByUserAndStartTimeAfter(user, startOfDay)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TimeTrackingDto.TimeEntryDto> getUserHistory(String userEmail) {
        User user = getUserByEmail(userEmail);
        return timeEntryRepository.findByUserOrderByStartTimeDesc(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TimeTrackingDto.TimeEntryDto> getAllActiveSessions() {
        return timeEntryRepository.findAllActiveSessions()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    private TimeTrackingDto.TimeEntryDto mapToDto(TimeEntry entry) {
        boolean active = (entry.getEndTime() == null);
        long duration = active
                ? Duration.between(entry.getStartTime(), Instant.now()).getSeconds()
                : (entry.getDurationSeconds() != null ? entry.getDurationSeconds() : 0);

        long hours = duration / 3600;
        long minutes = (duration % 3600) / 60;
        long secs = duration % 60;
        String formatted = String.format("%02d:%02d:%02d", hours, minutes, secs);

        return TimeTrackingDto.TimeEntryDto.builder()
                .id(entry.getId())
                .userId(entry.getUser().getId())
                .userEmail(entry.getUser().getEmail())
                .userName(entry.getUser().getName())
                .projectCode(entry.getProjectCode())
                .projectName(entry.getProjectName())
                .startTime(entry.getStartTime())
                .endTime(entry.getEndTime())
                .durationSeconds(duration)
                .durationFormatted(formatted)
                .note(entry.getNote())
                .billable(entry.isBillable())
                .active(active)
                .build();
    }
}
