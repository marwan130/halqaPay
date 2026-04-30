package com.halqapay.controller;

import com.halqapay.security.AuthUserPrincipal;
import com.halqapay.service.WalletService;
import com.halqapay.users.UserEntity;
import com.halqapay.users.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {
    private final WalletService walletService;
    private final UserRepository userRepository;
    private final com.halqapay.repository.TransactionRepository transactionRepository;

    public WalletController(WalletService walletService, 
                            UserRepository userRepository,
                            com.halqapay.repository.TransactionRepository transactionRepository) {
        this.walletService = walletService;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @GetMapping
    public Map<String, Object> getWallet(@AuthenticationPrincipal AuthUserPrincipal principal) {
        UserEntity user = userRepository.findById(principal.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        List<Map<String, Object>> recentTransactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(principal.userId()).stream()
                .limit(5)
                .map(tx -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", tx.getId());
                    map.put("type", tx.getType());
                    map.put("amount", tx.getAmount());
                    map.put("currency", tx.getCurrency());
                    map.put("status", tx.getStatus());
                    map.put("description", tx.getDescription());
                    map.put("createdAt", tx.getCreatedAt());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("balance", user.getWalletBalance().toPlainString());
        response.put("currency", user.getCurrency());
        response.put("recentTransactions", recentTransactions);
        return response;
    }

    @PostMapping("/topup")
    public Map<String, String> topup(@AuthenticationPrincipal AuthUserPrincipal principal, @RequestBody Map<String, BigDecimal> request) {
        BigDecimal amount = request.get("amount");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid amount");
        }
        walletService.topup(principal.userId(), amount);
        
        UserEntity user = userRepository.findById(principal.userId()).get();
        return Map.of("newBalance", user.getWalletBalance().toPlainString());
    }

    @PostMapping("/withdraw")
    public Map<String, String> withdraw(@AuthenticationPrincipal AuthUserPrincipal principal, @RequestBody Map<String, BigDecimal> request) {
        BigDecimal amount = request.get("amount");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid amount");
        }
        walletService.withdraw(principal.userId(), amount);
        
        UserEntity user = userRepository.findById(principal.userId()).get();
        return Map.of("newBalance", user.getWalletBalance().toPlainString());
    }
}
