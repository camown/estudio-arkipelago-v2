package com.arkipelago.repository;

import com.arkipelago.domain.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, UUID> {
    Optional<PushSubscription> findByEndpoint(String endpoint);
    List<PushSubscription> findByUserEmail(String userEmail);
    void deleteByEndpoint(String endpoint);
}
