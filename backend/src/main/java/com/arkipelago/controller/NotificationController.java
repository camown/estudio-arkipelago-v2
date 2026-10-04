package com.arkipelago.controller;

import com.arkipelago.domain.PushSubscription;
import com.arkipelago.domain.User;
import com.arkipelago.dto.NotificationDto;
import com.arkipelago.repository.PushSubscriptionRepository;
import com.arkipelago.repository.UserRepository;
import com.arkipelago.service.WebPushNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Mobile Push Notifications", description = "Endpoints for registering browser/mobile PWA push tokens and dispatching alerts")
public class NotificationController {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final UserRepository userRepository;
    private final WebPushNotificationService webPushNotificationService;

    @PostMapping("/subscribe")
    @Operation(summary = "Register browser or mobile PWA push subscription token")
    public ResponseEntity<?> subscribe(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody NotificationDto.SubscribeRequest request) {

        String email = (userDetails != null) ? userDetails.getUsername() : request.getUserEmail();
        User user = (email != null) ? userRepository.findByEmail(email).orElse(null) : null;

        String endpoint = request.getSubscription().getEndpoint();
        String p256dh = request.getSubscription().getKeys().getP256dh();
        String auth = request.getSubscription().getKeys().getAuth();

        Optional<PushSubscription> existing = pushSubscriptionRepository.findByEndpoint(endpoint);
        PushSubscription sub;
        if (existing.isPresent()) {
            sub = existing.get();
            sub.setP256dh(p256dh);
            sub.setAuth(auth);
            sub.setUser(user);
            sub.setUserEmail(email);
            sub.setUserAgent(request.getUserAgent());
        } else {
            sub = PushSubscription.builder()
                    .endpoint(endpoint)
                    .p256dh(p256dh)
                    .auth(auth)
                    .user(user)
                    .userEmail(email)
                    .userAgent(request.getUserAgent())
                    .build();
        }

        pushSubscriptionRepository.save(sub);
        return ResponseEntity.ok(NotificationDto.PushResponse.builder()
                .success(true)
                .message("Push subscription registered successfully in Spring Boot")
                .build());
    }

    @PostMapping("/send")
    @Operation(summary = "Dispatch encrypted Web Push notification to target users or broadcast")
    public ResponseEntity<NotificationDto.PushResponse> sendPush(
            @Valid @RequestBody NotificationDto.SendPushRequest request) {
        return ResponseEntity.ok(webPushNotificationService.sendPushNotification(request));
    }

    @PostMapping("/test")
    @Operation(summary = "Send immediate test push notification to currently authenticated user's device")
    public ResponseEntity<NotificationDto.PushResponse> sendTestPush(
            @AuthenticationPrincipal UserDetails userDetails) {
        NotificationDto.SendPushRequest req = new NotificationDto.SendPushRequest(
                "ESTUDIO ARKIPELAGO — Push Test",
                "Mobile push notifications are working with Java + Spring Boot!",
                "/dashboard",
                "test-notification",
                userDetails.getUsername()
        );
        return ResponseEntity.ok(webPushNotificationService.sendPushNotification(req));
    }

    @GetMapping("/my-subscriptions")
    @Operation(summary = "List registered push subscriptions for logged in user")
    public ResponseEntity<List<NotificationDto.PushSubscriptionInfoDto>> getMySubscriptions(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<NotificationDto.PushSubscriptionInfoDto> subs = pushSubscriptionRepository
                .findByUserEmail(userDetails.getUsername())
                .stream()
                .map(s -> NotificationDto.PushSubscriptionInfoDto.builder()
                        .id(s.getId())
                        .userEmail(s.getUserEmail())
                        .endpoint(s.getEndpoint())
                        .userAgent(s.getUserAgent())
                        .createdAt(s.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(subs);
    }
}
