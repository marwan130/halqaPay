package com.halqapay.service;

import com.halqapay.entity.*;
import com.halqapay.repository.*;
import com.halqapay.users.UserEntity;
import com.halqapay.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class AdminService {
    private final CircleRepository circleRepository;
    private final CircleMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final MonthlyCycleRepository cycleRepository;

    public AdminService(CircleRepository circleRepository,
                        CircleMembershipRepository membershipRepository,
                        UserRepository userRepository,
                        TransactionRepository transactionRepository,
                        MonthlyCycleRepository cycleRepository) {
        this.circleRepository = circleRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.cycleRepository = cycleRepository;
    }

    @Transactional
    public void advanceAllCircles() {
        List<CircleEntity> activeCircles = circleRepository.findByStatus(CircleStatus.ACTIVE);
        for (CircleEntity circle : activeCircles) {
            advanceCircle(circle.getId());
        }
    }

    @Transactional
    public void advanceCircle(UUID circleId) {
        CircleEntity circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new RuntimeException("Circle not found"));

        if (circle.getStatus() != CircleStatus.ACTIVE) {
            throw new RuntimeException("Circle is not active");
        }

        int month = circle.getCurrentMonth();
        BigDecimal monthlyContribution = circle.getTotalValue().divide(new BigDecimal(circle.getDurationMonths()), 2, RoundingMode.HALF_UP);
        List<CircleMembershipEntity> members = membershipRepository.findByCircleId(circleId);

        BigDecimal totalCollected = BigDecimal.ZERO;

        // 1. Collect contributions
        for (CircleMembershipEntity membership : members) {
            UserEntity user = membership.getUser();
            user.setWalletBalance(user.getWalletBalance().subtract(monthlyContribution));
            userRepository.save(user);

            TransactionEntity tx = new TransactionEntity();
            tx.setUser(user);
            tx.setCircle(circle);
            tx.setType(TransactionType.CONTRIBUTION);
            tx.setAmount(monthlyContribution.negate());
            tx.setCurrency(circle.getCurrency());
            tx.setStatus(TransactionStatus.COMPLETED);
            tx.setMonthNumber(month);
            tx.setDescription("Contribution for month " + month + " in " + circle.getName());
            transactionRepository.save(tx);

            totalCollected = totalCollected.add(monthlyContribution);
        }

        // 2. Payout to the scheduled member
        CircleMembershipEntity payoutMember = members.stream()
                .filter(m -> m.getSlotNumber() == month)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No payout member found for slot " + month));

        UserEntity receiver = payoutMember.getUser();
        receiver.setWalletBalance(receiver.getWalletBalance().add(totalCollected));
        userRepository.save(receiver);

        TransactionEntity payoutTx = new TransactionEntity();
        payoutTx.setUser(receiver);
        payoutTx.setCircle(circle);
        payoutTx.setType(TransactionType.PAYOUT);
        payoutTx.setAmount(totalCollected);
        payoutTx.setCurrency(circle.getCurrency());
        payoutTx.setStatus(TransactionStatus.COMPLETED);
        payoutTx.setMonthNumber(month);
        payoutTx.setDescription("Payout for month " + month + " in " + circle.getName());
        transactionRepository.save(payoutTx);

        // 3. Record the cycle
        MonthlyCycleEntity cycle = new MonthlyCycleEntity();
        cycle.setCircle(circle);
        cycle.setMonthNumber(month);
        cycle.setPayoutUser(receiver);
        cycle.setTotalCollected(totalCollected);
        cycle.setPayoutAmount(totalCollected);
        cycle.setCompleted(true);
        cycleRepository.save(cycle);

        // 4. Advance or complete
        if (month >= circle.getDurationMonths()) {
            circle.setStatus(CircleStatus.COMPLETED);
        } else {
            circle.setCurrentMonth(month + 1);
        }
        circleRepository.save(circle);
    }
}
