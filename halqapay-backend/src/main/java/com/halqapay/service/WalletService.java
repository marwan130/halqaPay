package com.halqapay.service;

import com.halqapay.entity.NotificationEntity;
import com.halqapay.entity.TransactionEntity;
import com.halqapay.entity.TransactionStatus;
import com.halqapay.entity.TransactionType;
import com.halqapay.repository.TransactionRepository;
import com.halqapay.users.UserEntity;
import com.halqapay.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class WalletService {
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;

    public WalletService(UserRepository userRepository, 
                         TransactionRepository transactionRepository,
                         NotificationService notificationService) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void topup(UUID userId, BigDecimal amount) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setWalletBalance(user.getWalletBalance().add(amount));
        userRepository.save(user);

        TransactionEntity tx = new TransactionEntity();
        tx.setUser(user);
        tx.setType(TransactionType.TOPUP);
        tx.setAmount(amount);
        tx.setCurrency(user.getCurrency());
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setDescription("Wallet top-up");
        transactionRepository.save(tx);

        notificationService.createNotification(user, "Wallet Top-up", 
            "Successfully added " + amount + " " + user.getCurrency() + " to your wallet.",
            NotificationEntity.NotificationType.WALLET_TOPUP);
    }

    @Transactional
    public void withdraw(UUID userId, BigDecimal amount) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getWalletBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient wallet balance");
        }

        user.setWalletBalance(user.getWalletBalance().subtract(amount));
        userRepository.save(user);

        TransactionEntity tx = new TransactionEntity();
        tx.setUser(user);
        tx.setType(TransactionType.WITHDRAWAL);
        tx.setAmount(amount);           // stored positive; type signals direction
        tx.setCurrency(user.getCurrency());
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setDescription("Wallet withdrawal");
        transactionRepository.save(tx);

        notificationService.createNotification(user, "Wallet Withdrawal", 
            "Successfully withdrawn " + amount + " " + user.getCurrency() + " from your wallet.",
            NotificationEntity.NotificationType.WALLET_WITHDRAW);
    }

    @Transactional
    public void debit(UserEntity user, BigDecimal amount, String description) {
        if (user.getWalletBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient wallet balance");
        }
        user.setWalletBalance(user.getWalletBalance().subtract(amount));
        userRepository.save(user);

        TransactionEntity tx = new TransactionEntity();
        tx.setUser(user);
        tx.setType(TransactionType.WITHDRAWAL);
        tx.setAmount(amount);           // stored positive; type signals direction
        tx.setCurrency(user.getCurrency());
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setDescription(description);
        transactionRepository.save(tx);
    }

    @Transactional
    public void credit(UserEntity user, BigDecimal amount, String description) {
        user.setWalletBalance(user.getWalletBalance().add(amount));
        userRepository.save(user);

        TransactionEntity tx = new TransactionEntity();
        tx.setUser(user);
        tx.setType(TransactionType.DEPOSIT); // or generic CREDIT
        tx.setAmount(amount);
        tx.setCurrency(user.getCurrency());
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setDescription(description);
        transactionRepository.save(tx);
    }
}
