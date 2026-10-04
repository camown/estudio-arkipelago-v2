package com.arkipelago.service;

import com.arkipelago.domain.PushSubscription;
import com.arkipelago.dto.NotificationDto;
import com.arkipelago.repository.PushSubscriptionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import nl.martijndwars.webpush.Subscription.Keys;
import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Security;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebPushNotificationService {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final ObjectMapper objectMapper;

    @Value("${arkipelago.webpush.public-key}")
    private String publicKey;

    @Value("${arkipelago.webpush.private-key}")
    private String privateKey;

    @Value("${arkipelago.webpush.subject:mailto:admin@arkipelago.ph}")
    private String subject;

    private PushService pushService;

    @PostConstruct
    public void init() {
        try {
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }

            this.pushService = new PushService(publicKey, privateKey, subject);
            log.info("WebPush PushService initialized with subject: {}", subject);
        } catch (Exception e) {
            log.error("Failed to initialize WebPush service", e);
        }
    }

    @Transactional
    public NotificationDto.PushResponse sendPushNotification(NotificationDto.SendPushRequest request) {
        List<PushSubscription> targets;
        if (request.getTargetEmail() != null && !request.getTargetEmail().isBlank()) {
            targets = pushSubscriptionRepository.findByUserEmail(request.getTargetEmail());
        } else {
            targets = pushSubscriptionRepository.findAll();
        }

        if (targets.isEmpty()) {
            return NotificationDto.PushResponse.builder()
                    .success(true)
                    .sentCount(0)
                    .totalTargets(0)
                    .message("No active push subscriptions found")
                    .build();
        }

        int successCount = 0;
        for (PushSubscription sub : targets) {
            try {
                Map<String, Object> payloadMap = new HashMap<>();
                payloadMap.put("title", request.getTitle() != null ? request.getTitle() : "ESTUDIO ARKIPELAGO");
                payloadMap.put("body", request.getMessage());
                payloadMap.put("url", request.getUrl() != null ? request.getUrl() : "/dashboard");
                payloadMap.put("tag", request.getTag() != null ? request.getTag() : "studio-alert");

                String payloadJson = objectMapper.writeValueAsString(payloadMap);

                Subscription subscription = new Subscription(
                        sub.getEndpoint(),
                        new Keys(sub.getP256dh(), sub.getAuth())
                );

                Notification notification = new Notification(subscription, payloadJson);
                HttpResponse response = pushService.send(notification);
                int statusCode = response.getStatusLine().getStatusCode();

                if (statusCode >= 200 && statusCode < 300) {
                    successCount++;
                } else if (statusCode == 410 || statusCode == 404) {
                    // Subscription has expired or unregistered, prune it
                    log.info("Pruning expired push subscription: {}", sub.getEndpoint());
                    pushSubscriptionRepository.delete(sub);
                } else {
                    log.warn("WebPush gateway returned status {} for endpoint {}", statusCode, sub.getEndpoint());
                }
            } catch (Exception ex) {
                log.error("Failed to deliver WebPush notification to: {}", sub.getEndpoint(), ex);
            }
        }

        return NotificationDto.PushResponse.builder()
                .success(true)
                .sentCount(successCount)
                .totalTargets(targets.size())
                .message("Push notifications dispatched successfully")
                .build();
    }
}
