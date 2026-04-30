package com.halqapay.users;

import com.halqapay.security.AuthUserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    private final com.halqapay.service.CircleService circleService;
    private final com.halqapay.repository.TransactionRepository transactionRepository;

    public UserController(UserRepository userRepository, 
                          com.halqapay.service.CircleService circleService,
                          com.halqapay.repository.TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.circleService = circleService;
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/me")
    public java.util.Map<String, Object> me(@AuthenticationPrincipal AuthUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        UserEntity user = userRepository.findById(principal.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        com.halqapay.dto.response.MyCirclesResponse circles = circleService.getUserCircles(principal.userId());

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", user.getId().toString());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("country", user.getCountry());
        response.put("currency", user.getCurrency());
        response.put("salary", user.getSalary().toPlainString());
        response.put("walletBalance", user.getWalletBalance().toPlainString());
        response.put("riskScore", user.getRiskScore());
        response.put("kycStatus", user.getKycStatus());
        response.put("activeCircles", circles.activeCircles());
        
        return response;
    }

    @GetMapping("/me/circles")
    public com.halqapay.dto.response.MyCirclesResponse myCircles(@AuthenticationPrincipal AuthUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return circleService.getUserCircles(principal.userId());
    }

    @PostMapping("/me/verify-salary")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void verifySalary(@AuthenticationPrincipal AuthUserPrincipal principal, @RequestBody Map<String, String> request) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        UserEntity user = userRepository.findById(principal.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        String documentUrl = request.get("documentUrl");
        if (documentUrl == null || documentUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document URL is required");
        }

        user.setKycDocumentUrl(documentUrl);
        user.setKycStatus(KycStatus.PENDING);
        userRepository.save(user);
    }

    @PatchMapping("/me/salary")
    public java.util.Map<String, String> updateSalary(@AuthenticationPrincipal AuthUserPrincipal principal, @RequestBody Map<String, java.math.BigDecimal> request) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        UserEntity user = userRepository.findById(principal.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        java.math.BigDecimal newSalary = request.get("salary");
        if (newSalary == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Salary is required");
        }

        user.setSalary(newSalary);
        // If they change salary, maybe reset KYC status? User didn't ask but it's logical.
        // For now, just update.
        userRepository.save(user);
        
        return java.util.Map.of("message", "Salary updated successfully", "salary", user.getSalary().toPlainString());
    }

    @GetMapping("/me/transactions")
    public Map<String, List<Map<String, Object>>> myTransactions(@AuthenticationPrincipal AuthUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        List<Map<String, Object>> transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(principal.userId()).stream()
                .map(tx -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", tx.getId());
                    map.put("type", tx.getType());
                    map.put("amount", tx.getAmount());
                    map.put("currency", tx.getCurrency());
                    map.put("status", tx.getStatus());
                    map.put("description", tx.getDescription());
                    map.put("createdAt", tx.getCreatedAt());
                    map.put("circleName", tx.getCircle() != null ? tx.getCircle().getName() : "Wallet");
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
        return Map.of("transactions", transactions);
    }
}
