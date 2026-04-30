package com.halqapay.controller;

import com.halqapay.security.AuthUserPrincipal;
import com.halqapay.users.KycStatus;
import com.halqapay.users.UserEntity;
import com.halqapay.users.UserRepository;
import com.halqapay.users.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository userRepository;
    private final com.halqapay.service.AdminService adminService;

    public AdminController(UserRepository userRepository, com.halqapay.service.AdminService adminService) {
        this.userRepository = userRepository;
        this.adminService = adminService;
    }

    @GetMapping("/kyc-pending")
    public List<Map<String, Object>> getPendingKyc(@AuthenticationPrincipal AuthUserPrincipal principal) {
        checkAdmin(principal);
        return userRepository.findAll().stream()
                .filter(u -> u.getKycStatus() == KycStatus.PENDING)
                .map(u -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("userId", u.getId());
                    map.put("fullName", u.getFullName());
                    map.put("email", u.getEmail());
                    map.put("salary", u.getSalary());
                    map.put("documentUrl", u.getKycDocumentUrl());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @PostMapping("/kyc-verify/{userId}")
    public void verifyUser(@PathVariable UUID userId, 
                           @RequestBody Map<String, String> request,
                           @AuthenticationPrincipal AuthUserPrincipal principal) {
        checkAdmin(principal);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String statusStr = request.get("status");
        if (statusStr == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        try {
            KycStatus status = KycStatus.valueOf(statusStr);
            if (status != KycStatus.VERIFIED && status != KycStatus.REJECTED) {
                throw new IllegalArgumentException();
            }
            user.setKycStatus(status);
            userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status. Must be VERIFIED or REJECTED");
        }
    }

    @PostMapping("/simulate/advance")
    public java.util.Map<String, Object> advanceAll(@AuthenticationPrincipal AuthUserPrincipal principal) {
        checkAdmin(principal);
        adminService.advanceAllCircles();
        return java.util.Map.of("message", "Cycles processed successfully");
    }

    @PostMapping("/simulate/advance-circle/{circleId}")
    public void advanceCircle(@PathVariable UUID circleId, @AuthenticationPrincipal AuthUserPrincipal principal) {
        checkAdmin(principal);
        adminService.advanceCircle(circleId);
    }

    @PostMapping("/simulate/seed")
    public java.util.Map<String, String> seed(@AuthenticationPrincipal AuthUserPrincipal principal) {
        checkAdmin(principal);
        adminService.seedDemoData();
        return java.util.Map.of("message", "Demo data seeded successfully");
    }

    private void checkAdmin(AuthUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        UserEntity user = userRepository.findById(principal.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        
        if (user.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
