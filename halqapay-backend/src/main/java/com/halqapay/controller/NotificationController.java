package com.halqapay.controller;

import com.halqapay.entity.NotificationEntity;
import com.halqapay.security.AuthUserPrincipal;
import com.halqapay.service.NotificationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationEntity> getNotifications(@AuthenticationPrincipal AuthUserPrincipal principal) {
        return notificationService.getUserNotifications(principal.userId());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@AuthenticationPrincipal AuthUserPrincipal principal) {
        return Map.of("count", notificationService.getUnreadCount(principal.userId()));
    }

    @PostMapping("/{id}/read")
    public void markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
    }

    @PostMapping("/read-all")
    public void markAllAsRead(@AuthenticationPrincipal AuthUserPrincipal principal) {
        notificationService.markAllAsRead(principal.userId());
    }
}
