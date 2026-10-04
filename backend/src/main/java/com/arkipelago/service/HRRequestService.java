package com.arkipelago.service;

import com.arkipelago.domain.HRRequest;
import com.arkipelago.domain.User;
import com.arkipelago.dto.HRRequestDto;
import com.arkipelago.repository.HRRequestRepository;
import com.arkipelago.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HRRequestService {

    private final HRRequestRepository hrRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public HRRequestDto.HRRequestResponse createRequest(String userEmail, HRRequestDto.CreateHRRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        HRRequest entity = HRRequest.builder()
                .user(user)
                .requestType(request.getRequestType())
                .calendarDate(request.getCalendarDate())
                .clockIn(request.getClockIn())
                .clockOut(request.getClockOut())
                .reason(request.getReason())
                .status("pending")
                .leaveType(request.getLeaveType())
                .amountPhp(request.getAmountPhp())
                .complaintCategory(request.getComplaintCategory())
                .confidential(request.isConfidential())
                .build();

        HRRequest saved = hrRequestRepository.save(entity);
        return mapToDto(saved);
    }

    public List<HRRequestDto.HRRequestResponse> getMyRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));
        return hrRequestRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<HRRequestDto.HRRequestResponse> getAllRequests() {
        return hrRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public HRRequestDto.HRRequestResponse reviewRequest(UUID requestId, HRRequestDto.ReviewHRRequest review) {
        HRRequest req = hrRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("HR request not found: " + requestId));

        req.setStatus(review.getStatus().toLowerCase());
        req.setResolutionNotes(review.getResolutionNotes());

        HRRequest saved = hrRequestRepository.save(req);
        return mapToDto(saved);
    }

    private HRRequestDto.HRRequestResponse mapToDto(HRRequest r) {
        return HRRequestDto.HRRequestResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getName())
                .userEmail(r.getUser().getEmail())
                .requestType(r.getRequestType())
                .status(r.getStatus())
                .calendarDate(r.getCalendarDate())
                .clockIn(r.getClockIn())
                .clockOut(r.getClockOut())
                .reason(r.getReason())
                .resolutionNotes(r.getResolutionNotes())
                .leaveType(r.getLeaveType())
                .amountPhp(r.getAmountPhp())
                .complaintCategory(r.getComplaintCategory())
                .confidential(r.isConfidential())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
