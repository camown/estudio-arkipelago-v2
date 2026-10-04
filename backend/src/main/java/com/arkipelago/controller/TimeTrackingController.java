package com.arkipelago.controller;

import com.arkipelago.dto.TimeTrackingDto;
import com.arkipelago.service.TimeTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
@Tag(name = "HR & Time Tracking", description = "Endpoints for clock-in/out, live timer sessions, and ledger history")
public class TimeTrackingController {

    private final TimeTrackingService timeTrackingService;

    @PostMapping("/clock-in")
    @Operation(summary = "Start live clock-in session with billable project attribution")
    public ResponseEntity<TimeTrackingDto.TimeEntryDto> clockIn(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TimeTrackingDto.ClockInRequest request) {
        return ResponseEntity.ok(timeTrackingService.clockIn(userDetails.getUsername(), request));
    }

    @PostMapping("/clock-out")
    @Operation(summary = "Stop active session, compute duration, and record session notes")
    public ResponseEntity<TimeTrackingDto.TimeEntryDto> clockOut(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) TimeTrackingDto.ClockOutRequest request) {
        return ResponseEntity.ok(timeTrackingService.clockOut(userDetails.getUsername(), request));
    }

    @GetMapping("/active-session")
    @Operation(summary = "Get user's current running clock-in session if any")
    public ResponseEntity<TimeTrackingDto.TimeEntryDto> getActiveSession(
            @AuthenticationPrincipal UserDetails userDetails) {
        return timeTrackingService.getActiveSession(userDetails.getUsername())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/today")
    @Operation(summary = "Get user's time entries recorded today")
    public ResponseEntity<List<TimeTrackingDto.TimeEntryDto>> getTodayEntries(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(timeTrackingService.getTodayEntries(userDetails.getUsername()));
    }

    @GetMapping("/history")
    @Operation(summary = "Get user's complete time tracking ledger history")
    public ResponseEntity<List<TimeTrackingDto.TimeEntryDto>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(timeTrackingService.getUserHistory(userDetails.getUsername()));
    }

    @GetMapping("/team-status")
    @Operation(summary = "Get all studio members currently clocked in")
    public ResponseEntity<List<TimeTrackingDto.TimeEntryDto>> getTeamStatus() {
        return ResponseEntity.ok(timeTrackingService.getAllActiveSessions());
    }
}
