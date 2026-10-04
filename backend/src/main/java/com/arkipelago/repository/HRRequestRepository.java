package com.arkipelago.repository;

import com.arkipelago.domain.HRRequest;
import com.arkipelago.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HRRequestRepository extends JpaRepository<HRRequest, UUID> {
    List<HRRequest> findByUserOrderByCreatedAtDesc(User user);
    List<HRRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<HRRequest> findAllByOrderByCreatedAtDesc();
}
