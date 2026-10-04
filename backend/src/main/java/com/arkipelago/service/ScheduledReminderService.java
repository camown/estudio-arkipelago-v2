package com.arkipelago.service;

import com.arkipelago.domain.TimeEntry;
import com.arkipelago.domain.User;
import com.arkipelago.dto.NotificationDto;
import com.arkipelago.repository.TimeEntryRepository;
import com.arkipelago.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledReminderService {

    private final UserRepository userRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final WebPushNotificationService webPushNotificationService;

    // Weekday 9:00 AM Manila Time (PST is UTC+8, so 01:00 UTC) morning clock-in nudge
    @Scheduled(cron = "0 0 9 * * MON-FRI", zone = "Asia/Manila")
    public void sendMorningClockInNudge() {
        log.info("Running scheduled morning clock-in nudge...");
        List<TimeEntry> activeSessions = timeEntryRepository.findAllActiveSessions();
        Set<String> clockedInEmails = activeSessions.stream()
                .map(t -> t.getUser().getEmail())
                .collect(Collectors.toSet());

        List<User> allStaff = userRepository.findAll();
        for (User staff : allStaff) {
            if (!clockedInEmails.contains(staff.getEmail())) {
                webPushNotificationService.sendPushNotification(new NotificationDto.SendPushRequest(
                        "ESTUDIO ARKIPELAGO — Time Tracker",
                        "Good morning " + staff.getName() + "! Don't forget to clock in for your project today.",
                        "/hr",
                        "morning-clockin-nudge",
                        staff.getEmail()
                ));
            }
        }
    }

    // Every 30 minutes, alert users who have been clocked in for more than 8 hours
    @Scheduled(cron = "0 0/30 * * * *")
    public void sendLongSessionAlerts() {
        List<TimeEntry> activeSessions = timeEntryRepository.findAllActiveSessions();
        Instant now = Instant.now();

        for (TimeEntry session : activeSessions) {
            Duration duration = Duration.between(session.getStartTime(), now);
            if (duration.toHours() >= 8 && duration.toHours() < 9) {
                webPushNotificationService.sendPushNotification(new NotificationDto.SendPushRequest(
                        "ESTUDIO ARKIPELAGO — Session Alert",
                        "You've been clocked into " + session.getProjectCode() + " for 8+ hours. Remember to clock out or log a break!",
                        "/hr",
                        "overtime-nudge",
                        session.getUser().getEmail()
                ));
            }
        }
    }
}
