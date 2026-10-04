package com.arkipelago.controller;

import com.arkipelago.dto.HRRequestDto;
import com.arkipelago.service.HRRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/requests")
@RequiredArgsConstructor
@Tag(name = "HR Requests & Approvals", description = "Endpoints for leave requests, overtime, official business, and resolution reviews")
public class HRRequestController {

    private final HRRequestService hrRequestService;

    @PostMapping
    @Operation(summary = "Submit a new HR request (overtime, leave, official business, complaint)")
    public ResponseEntity<HRRequestDto.HRRequestResponse> submitRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody HRRequestDto.CreateHRRequest request) {
        return ResponseEntity.ok(hrRequestService.createRequest(userDetails.getUsername(), request));
    }

    @GetMapping("/my")
    @Operation(summary = "List current user's submitted HR requests")
    public ResponseEntity<List<HRRequestDto.HRRequestResponse>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(hrRequestService.getMyRequests(userDetails.getUsername()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('PARTNER')")
    @Operation(summary = "List all studio HR requests for partner review")
    public ResponseEntity<List<HRRequestDto.HRRequestResponse>> getAllRequests() {
        return ResponseEntity.ok(hrRequestService.getAllRequests());
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasRole('PARTNER')")
    @Operation(summary = "Approve or reject an HR request with resolution notes")
    public ResponseEntity<HRRequestDto.HRRequestResponse> reviewRequest(
            @PathVariable UUID id,
            @Valid @RequestBody HRRequestDto.ReviewHRRequest review) {
        return ResponseEntity.ok(hrRequestService.reviewRequest(id, review));
    }
}
