package com.arkipelago.service;

import com.arkipelago.domain.SketchSession;
import com.arkipelago.dto.SketchDto;
import com.arkipelago.repository.SketchSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SketchService {

    private final SketchSessionRepository sketchSessionRepository;

    @Transactional
    public SketchDto.SketchSessionDto saveSession(String userEmail, SketchDto.SaveSketchRequest request) {
        Optional<SketchSession> existing = sketchSessionRepository
                .findByProjectCodeAndSheetCode(request.getProjectCode(), request.getSheetCode());

        SketchSession session;
        if (existing.isPresent()) {
            session = existing.get();
            session.setTitle(request.getTitle());
            session.setCanvasDataJson(request.getCanvasDataJson());
            session.setLayersJson(request.getLayersJson());
            session.setScaleRatio(request.getScaleRatio());
            session.setUpdatedByEmail(userEmail);
        } else {
            session = SketchSession.builder()
                    .projectCode(request.getProjectCode())
                    .sheetCode(request.getSheetCode())
                    .title(request.getTitle())
                    .canvasDataJson(request.getCanvasDataJson())
                    .layersJson(request.getLayersJson())
                    .scaleRatio(request.getScaleRatio())
                    .updatedByEmail(userEmail)
                    .build();
        }

        SketchSession saved = sketchSessionRepository.save(session);
        return mapToDto(saved);
    }

    public Optional<SketchDto.SketchSessionDto> getSession(String projectCode, String sheetCode) {
        return sketchSessionRepository.findByProjectCodeAndSheetCode(projectCode, sheetCode)
                .map(this::mapToDto);
    }

    public List<SketchDto.SketchSessionDto> getProjectSessions(String projectCode) {
        return sketchSessionRepository.findByProjectCodeOrderByUpdatedAtDesc(projectCode)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private SketchDto.SketchSessionDto mapToDto(SketchSession s) {
        return SketchDto.SketchSessionDto.builder()
                .id(s.getId())
                .projectCode(s.getProjectCode())
                .sheetCode(s.getSheetCode())
                .title(s.getTitle())
                .canvasDataJson(s.getCanvasDataJson())
                .layersJson(s.getLayersJson())
                .scaleRatio(s.getScaleRatio())
                .updatedByEmail(s.getUpdatedByEmail())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
