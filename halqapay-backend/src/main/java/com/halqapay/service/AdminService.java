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
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AdminService(CircleRepository circleRepository,
                        CircleMembershipRepository membershipRepository,
                        UserRepository userRepository,
                        TransactionRepository transactionRepository,
                        MonthlyCycleRepository cycleRepository,
                        org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.circleRepository = circleRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.cycleRepository = cycleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void seedDemoData() {
        // 1. Create Demo Users
        createUser("Alice Smith", "alice@example.com", "USD", new BigDecimal("5000"));
        createUser("Bob Jones", "bob@example.com", "USD", new BigDecimal("4500"));
        createUser("Charlie Brown", "charlie@example.com", "USD", new BigDecimal("6000"));
        createUser("Diana Prince", "diana@example.com", "USD", new BigDecimal("5500"));

        UserEntity alice = userRepository.findByEmailIgnoreCase("alice@example.com").get();
        UserEntity bob = userRepository.findByEmailIgnoreCase("bob@example.com").get();
        UserEntity charlie = userRepository.findByEmailIgnoreCase("charlie@example.com").get();
        UserEntity diana = userRepository.findByEmailIgnoreCase("diana@example.com").get();

        // 2. Create a Demo Circle
        CircleEntity circle = new CircleEntity();
        circle.setName("Tech Savings 2024");
        circle.setDescription("A group for tech enthusiasts to save for gadgets.");
        circle.setCurrency(com.halqapay.users.CurrencyCode.USD);
        circle.setTotalValue(new BigDecimal("4000"));
        circle.setDurationMonths(4);
        circle.setMonthlyContribution(new BigDecimal("1000"));
        circle.setMinParticipants(4);
        circle.setMaxMembers(4);
        circle.setCreator(alice);
        circle.setStatus(CircleStatus.ACTIVE);
        circle.setCurrentMonth(1);
        circle = circleRepository.save(circle);

        // 3. Add Members
        addMember(circle, alice, 1);
        addMember(circle, bob, 2);
        addMember(circle, charlie, 3);
        addMember(circle, diana, 4);
    }

    private void createUser(String name, String email, String currency, BigDecimal salary) {
        if (userRepository.existsByEmailIgnoreCase(email)) return;
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setFullName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setCurrency(com.halqapay.users.CurrencyCode.valueOf(currency));
        user.setSalary(salary);
        user.setWalletBalance(new BigDecimal("2000")); // Start with some money
        user.setRole(com.halqapay.users.UserRole.USER);
        user.setKycStatus(com.halqapay.users.KycStatus.VERIFIED);
        user.setCountry("USA");
        user.setRiskScore(80);
        userRepository.save(user);
    }

    private void addMember(CircleEntity circle, UserEntity user, int slot) {
        CircleMembershipEntity membership = new CircleMembershipEntity();
        membership.setCircle(circle);
        membership.setUser(user);
        membership.setSlotNumber(slot);
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setJoinedAt(java.time.OffsetDateTime.now());
        membershipRepository.save(membership);
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
            tx.setAmount(monthlyContribution);
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
