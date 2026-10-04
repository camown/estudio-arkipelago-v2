package com.arkipelago.service;

import com.arkipelago.domain.Project;
import com.arkipelago.dto.ProjectDto;
import com.arkipelago.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    public List<ProjectDto.ProjectDetailDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProjectDto.ProjectDetailDto getProjectByCode(String code) {
        Project project = projectRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with code: " + code));
        return mapToDto(project);
    }

    @Transactional
    public ProjectDto.ProjectDetailDto createProject(ProjectDto.CreateProjectRequest request) {
        if (projectRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Project code already exists: " + request.getCode());
        }

        Project project = Project.builder()
                .code(request.getCode().toUpperCase().trim())
                .name(request.getName().trim())
                .clientName(request.getClientName())
                .status(request.getStatus() != null ? request.getStatus() : "active")
                .contractAmountPhp(request.getContractAmountPhp())
                .schematicPct(15)
                .designDevPct(20)
                .contractDocsPct(35)
                .biddingPct(5)
                .constructionAdminPct(25)
                .build();

        Project saved = projectRepository.save(project);
        return mapToDto(saved);
    }

    private ProjectDto.ProjectDetailDto mapToDto(Project p) {
        return ProjectDto.ProjectDetailDto.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .clientName(p.getClientName())
                .status(p.getStatus())
                .contractAmountPhp(p.getContractAmountPhp())
                .schematicPct(p.getSchematicPct())
                .designDevPct(p.getDesignDevPct())
                .contractDocsPct(p.getContractDocsPct())
                .biddingPct(p.getBiddingPct())
                .constructionAdminPct(p.getConstructionAdminPct())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
