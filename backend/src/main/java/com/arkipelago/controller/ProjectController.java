package com.arkipelago.controller;

import com.arkipelago.dto.ProjectDto;
import com.arkipelago.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects Hub", description = "Endpoints for architectural projects and contract billing milestones")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "List all active studio projects")
    public ResponseEntity<List<ProjectDto.ProjectDetailDto>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{code}")
    @Operation(summary = "Get project details and contract breakdown by project code (e.g. MT-2024)")
    public ResponseEntity<ProjectDto.ProjectDetailDto> getProjectByCode(@PathVariable String code) {
        return ResponseEntity.ok(projectService.getProjectByCode(code));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PARTNER', 'SENIOR_ARCHITECT')")
    @Operation(summary = "Register new architectural project (Partner / Senior Architect only)")
    public ResponseEntity<ProjectDto.ProjectDetailDto> createProject(@Valid @RequestBody ProjectDto.CreateProjectRequest request) {
        return ResponseEntity.ok(projectService.createProject(request));
    }
}
