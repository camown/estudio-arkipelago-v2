package com.arkipelago.controller;

import com.arkipelago.dto.SketchDto;
import com.arkipelago.service.SketchService;
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
@RequestMapping("/api/sketch")
@RequiredArgsConstructor
@Tag(name = "Sketch Studio", description = "Endpoints for digital blueprint redlines, architectural stamps, and canvas sessions")
public class SketchController {

    private final SketchService sketchService;

    @PostMapping("/save")
    @Operation(summary = "Save or update drawing markup session with layers and architectural scale")
    public ResponseEntity<SketchDto.SketchSessionDto> saveSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SketchDto.SaveSketchRequest request) {
        return ResponseEntity.ok(sketchService.saveSession(userDetails.getUsername(), request));
    }

    @GetMapping("/{projectCode}/{sheetCode}")
    @Operation(summary = "Get saved sketch session for project and sheet code")
    public ResponseEntity<SketchDto.SketchSessionDto> getSession(
            @PathVariable String projectCode,
            @PathVariable String sheetCode) {
        return sketchService.getSession(projectCode, sheetCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{projectCode}")
    @Operation(summary = "List all markup sessions under a project")
    public ResponseEntity<List<SketchDto.SketchSessionDto>> getProjectSessions(
            @PathVariable String projectCode) {
        return ResponseEntity.ok(sketchService.getProjectSessions(projectCode));
    }
}
