package com.halqapay.service;

import com.halqapay.entity.CircleEntity;
import com.halqapay.repository.CircleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PayoutService {
    private final CircleRepository circleRepository;
    private final CircleService circleService;

    public PayoutService(CircleRepository circleRepository, CircleService circleService) {
        this.circleRepository = circleRepository;
        this.circleService = circleService;
    }

    @Scheduled(fixedRate = 300000) // Run every 5 minutes (300,000 ms)
    @Transactional
    public void processAllPendingPayouts() {
        List<CircleEntity> activeCircles = circleRepository.findByStatus(com.halqapay.entity.CircleStatus.ACTIVE);
        
        for (CircleEntity circle : activeCircles) {
            try {
                circleService.processAutomaticPayout(circle);
            } catch (Exception e) {
                // Log error but continue processing other circles
                System.err.println("Error processing payout for circle " + circle.getId() + ": " + e.getMessage());
            }
        }
    }

    @Scheduled(cron = "0 0 0 * * ?") // Run daily at midnight
    @Transactional
    public void dailyPayoutCheck() {
        processAllPendingPayouts();
    }
}
