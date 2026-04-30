package com.halqapay.service;

import com.halqapay.dto.request.CreateCircleRequest;
import com.halqapay.dto.response.CircleJoinOrValidateResponse;
import com.halqapay.dto.response.CircleMembershipSummaryResponse;
import com.halqapay.dto.response.CircleResponse;
import com.halqapay.dto.response.MyCirclesResponse;
import com.halqapay.entity.*;
import com.halqapay.repository.CircleMembershipRepository;
import com.halqapay.repository.CircleRepository;
import com.halqapay.users.UserEntity;
import com.halqapay.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CircleService {
    private final CircleRepository circleRepository;
    private final CircleMembershipRepository membershipRepository;
    private final ValidationService validationService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final com.halqapay.repository.MonthlyCycleRepository monthlyCycleRepository;
    private final FxService fxService;
    private final com.halqapay.repository.TransactionRepository transactionRepository;

    public CircleService(CircleRepository circleRepository,
                         CircleMembershipRepository membershipRepository,
                         ValidationService validationService,
                         UserRepository userRepository,
                         NotificationService notificationService,
                         com.halqapay.repository.MonthlyCycleRepository monthlyCycleRepository,
                         FxService fxService,
                         com.halqapay.repository.TransactionRepository transactionRepository) {
        this.circleRepository = circleRepository;
        this.membershipRepository = membershipRepository;
        this.validationService = validationService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.monthlyCycleRepository = monthlyCycleRepository;
        this.fxService = fxService;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public CircleResponse createCircle(CreateCircleRequest request, UUID creatorId) {
        UserEntity creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        CircleEntity circle = new CircleEntity();
        circle.setName(request.name());
        circle.setTotalValue(request.totalValue());
        circle.setDurationMonths(request.durationMonths());
        circle.setCurrency(request.currency());
        circle.setMaxMembers(request.maxMembers());
        circle.setCurrentMembers(0);
        circle.setCurrentMonth(0);
        circle.setStatus(CircleStatus.OPEN);
        circle.setCreator(creator);
        circle.setPrivate(request.isPrivate());
        circle.setInviteCode(generateInviteCode());

        // Preliminary validation: Can the creator afford this?
        if (!validationService.validateJoin(creator, circle)) {
            Integer suggested = validationService.suggestMinDuration(creator, circle.getTotalValue(), circle.getCurrency());
            String msg = "You are not eligible to start this circle based on your current income and commitments.";
            if (suggested != null) {
                msg += " Try a duration of at least " + suggested + " months.";
            }
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, msg);
        }

        CircleEntity saved = circleRepository.save(circle);
        
        // Auto-join the creator
        joinCircle(creatorId, saved.getId());
        
        return mapToResponse(saved, creator);
    }

    public List<CircleResponse> listAvailableCircles(
            UserEntity user,
            String currencyStr,
            java.math.BigDecimal minValue,
            java.math.BigDecimal maxValue
    ) {
        final com.halqapay.users.CurrencyCode currencyEnum;
        if (currencyStr != null && !currencyStr.isBlank()) {
            try {
                currencyEnum = com.halqapay.users.CurrencyCode.valueOf(currencyStr.toUpperCase());
            } catch (Exception e) {
                return List.of(); // Invalid currency code
            }
        } else {
            currencyEnum = null;
        }

        return circleRepository.findAll().stream()
                .filter(c -> c.getStatus() == CircleStatus.OPEN)
                .filter(c -> !c.isPrivate())  // private circles never appear in discovery
                .filter(c -> {
                    if (currencyEnum == null) return true;
                    return currencyEnum.equals(c.getCurrency());
                })
                .filter(c -> {
                    if (minValue == null) return true;
                    return c.getTotalValue().compareTo(minValue) >= 0;
                })
                .filter(c -> {
                    if (maxValue == null) return true;
                    return c.getTotalValue().compareTo(maxValue) <= 0;
                })
                .map(c -> mapToResponse(c, user))
                .collect(Collectors.toList());
    }

    @Transactional
    public CircleJoinOrValidateResponse joinCircle(UUID userId, UUID circleId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        CircleEntity circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new RuntimeException("Circle not found"));

        if (circle.getStatus() != CircleStatus.OPEN) {
            throw new RuntimeException("Circle is not open for joining");
        }

        if (circle.getCurrentMembers() >= circle.getMaxMembers()) {
            throw new RuntimeException("Circle is full");
        }

        if (membershipRepository.existsByCircle_IdAndUser_Id(circleId, userId)) {
            throw new RuntimeException("User is already a member of this circle");
        }

        if (!validationService.validateJoin(user, circle)) {
            Integer suggested = validationService.suggestMinDuration(user, circle.getTotalValue(), circle.getCurrency());
            BigDecimal newBurden = validationService.calculateCircleBurden(circle, user);
            BigDecimal existingBurden = validationService.calculateExistingBurden(user);
            BigDecimal totalBurden = existingBurden.add(newBurden);
            BigDecimal walletOffset = validationService.calculateWalletOffset(user, circle);
            BigDecimal effectiveTotalBurden = totalBurden.subtract(walletOffset).max(BigDecimal.ZERO);
            BigDecimal dtiCap = user.getSalary().multiply(new BigDecimal("0.4"));
            BigDecimal circleMonthly = circle.getTotalValue().divide(new BigDecimal(circle.getDurationMonths()), 2, java.math.RoundingMode.HALF_UP);
            return new CircleJoinOrValidateResponse(
                    false,
                    newBurden,
                    effectiveTotalBurden,
                    dtiCap.subtract(effectiveTotalBurden),
                    "DTI limit exceeded",
                    suggested,
                    user.getCurrency(),
                    circleMonthly,
                    circle.getCurrency()
            );
        }

        CircleMembershipEntity membership = new CircleMembershipEntity();
        membership.setUser(user);
        membership.setCircle(circle);
        membership.setSlotNumber(circle.getCurrentMembers() + 1);
        membership.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(membership);

        circle.setCurrentMembers(circle.getCurrentMembers() + 1);
        boolean circleNowFull = circle.getCurrentMembers().equals(circle.getMaxMembers());

        if (circleNowFull) {
            circle.setStatus(CircleStatus.ACTIVE);
            circle.setCurrentMonth(1);

            // Initialize first cycle
            com.halqapay.entity.MonthlyCycleEntity cycle = new com.halqapay.entity.MonthlyCycleEntity();
            cycle.setCircle(circle);
            cycle.setMonthNumber(1);
            cycle.setCompleted(false);
            cycle.setTotalCollected(BigDecimal.ZERO);
            cycle.setPayoutAmount(circle.getTotalValue());

            // First joiner gets first payout
            CircleMembershipEntity firstMember = membershipRepository.findByCircleIdAndSlotNumber(circle.getId(), 1)
                .orElseThrow(() -> new RuntimeException("First member not found"));
            cycle.setPayoutUser(firstMember.getUser());
            monthlyCycleRepository.save(cycle);

            // Notify ALL members — circle is now full and active
            List<CircleMembershipEntity> members = membershipRepository.findByCircleId(circle.getId());
            for (CircleMembershipEntity m : members) {
                notificationService.createNotification(m.getUser(), "Circle Active!",
                    "Circle '" + circle.getName() + "' is now full and active. Saving starts now!",
                    NotificationEntity.NotificationType.CIRCLE_ACTIVE);
            }
        } else {
            // Circle still has open slots — notify existing members that someone new joined
            int slotsLeft = circle.getMaxMembers() - circle.getCurrentMembers();
            List<CircleMembershipEntity> existingMembers = membershipRepository.findByCircleId(circle.getId());
            for (CircleMembershipEntity m : existingMembers) {
                if (!m.getUser().getId().equals(userId)) {
                    notificationService.createNotification(
                        m.getUser(),
                        "New Member Joined",
                        user.getFullName() + " joined '" + circle.getName() + "'. " +
                            slotsLeft + " slot" + (slotsLeft == 1 ? "" : "s") + " remaining.",
                        NotificationEntity.NotificationType.CIRCLE_JOINED
                    );
                }
            }
        }
        circleRepository.save(circle);

        BigDecimal newBurden = validationService.calculateCircleBurden(circle, user);
        BigDecimal existingBurden = validationService.calculateExistingBurden(user);
        BigDecimal totalBurden = existingBurden.add(newBurden);
        BigDecimal walletOffset = validationService.calculateWalletOffset(user, circle);
        BigDecimal effectiveTotalBurden = totalBurden.subtract(walletOffset).max(BigDecimal.ZERO);
        BigDecimal dtiCap = user.getSalary().multiply(new BigDecimal("0.4"));
        BigDecimal circleMonthly = circle.getTotalValue().divide(new BigDecimal(circle.getDurationMonths()), 2, java.math.RoundingMode.HALF_UP);
        return new CircleJoinOrValidateResponse(
                true,
                newBurden,
                effectiveTotalBurden,
                dtiCap.subtract(effectiveTotalBurden),
                null,
                null,
                user.getCurrency(),
                circleMonthly,
                circle.getCurrency()
        );
    }

    @Transactional
    public CircleJoinOrValidateResponse joinByCode(UUID userId, String inviteCode) {
        CircleEntity circle = circleRepository.findByInviteCode(inviteCode.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Circle with this code not found"));
        return joinCircle(userId, circle.getId());
    }

    @Transactional
    public void leaveCircle(UUID userId, UUID circleId) {
        CircleEntity circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new RuntimeException("Circle not found"));

        if (circle.getStatus() != CircleStatus.OPEN) {
            throw new RuntimeException("You can only leave a circle before payouts have started. This circle is already " + circle.getStatus().name().toLowerCase() + ".");
        }

        List<CircleMembershipEntity> memberships = membershipRepository.findByCircleId(circleId);
        CircleMembershipEntity membership = memberships.stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("You are not a member of this circle"));

        membershipRepository.delete(membership);
        circle.setCurrentMembers(Math.max(0, circle.getCurrentMembers() - 1));
        circleRepository.save(circle);
    }

    public CircleJoinOrValidateResponse validateCircle(UUID userId, UUID circleId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        CircleEntity circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new RuntimeException("Circle not found"));

        boolean approved = validationService.validateJoin(user, circle);
        BigDecimal newBurden = validationService.calculateCircleBurden(circle, user);
        BigDecimal existingBurden = validationService.calculateExistingBurden(user);
        BigDecimal totalBurden = existingBurden.add(newBurden);
        BigDecimal walletOffset = validationService.calculateWalletOffset(user, circle);
        BigDecimal effectiveTotalBurden = totalBurden.subtract(walletOffset).max(BigDecimal.ZERO);

        BigDecimal dtiCap = user.getSalary().multiply(new BigDecimal("0.4"));
        BigDecimal remaining = dtiCap.subtract(effectiveTotalBurden);
        BigDecimal circleMonthly = circle.getTotalValue().divide(new BigDecimal(circle.getDurationMonths()), 2, java.math.RoundingMode.HALF_UP);

        Integer suggested = null;
        String reason = null;
        if (!approved) {
            suggested = validationService.suggestMinDuration(user, circle.getTotalValue(), circle.getCurrency());
            reason = "DTI limit exceeded";
        }

        return new CircleJoinOrValidateResponse(
                approved,
                newBurden,
                effectiveTotalBurden,
                remaining,
                reason,
                suggested,
                user.getCurrency(),
                circleMonthly,
                circle.getCurrency()
        );
    }

    public MyCirclesResponse getUserCircles(UUID userId) {
        List<CircleMembershipEntity> memberships = membershipRepository.findByUser_Id(userId);
        
        List<CircleMembershipSummaryResponse> active = memberships.stream()
                .filter(m -> m.getCircle().getStatus() != CircleStatus.COMPLETED)
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        List<CircleMembershipSummaryResponse> completed = memberships.stream()
                .filter(m -> m.getCircle().getStatus() == CircleStatus.COMPLETED)
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return new MyCirclesResponse(active, completed);
    }

    private CircleMembershipSummaryResponse mapToSummary(CircleMembershipEntity m) {
        CircleEntity c = m.getCircle();
        UserEntity u = m.getUser();
        BigDecimal monthly = c.getTotalValue().divide(new BigDecimal(c.getDurationMonths()), 2, RoundingMode.HALF_UP);
        int remaining = Math.max(0, c.getDurationMonths() - (c.getCurrentMonth() > 0 ? c.getCurrentMonth() - 1 : 0));

        // Convert monthly payment to user's home currency for accurate DTI display
        com.halqapay.users.CurrencyCode userCurrency = u != null ? u.getCurrency() : c.getCurrency();
        BigDecimal monthlyInUserCurrency;
        try {
            monthlyInUserCurrency = fxService.convert(monthly, c.getCurrency(), userCurrency);
        } catch (RuntimeException e) {
            // FX rate missing — fall back to raw amount so the app doesn't crash
            monthlyInUserCurrency = monthly;
            userCurrency = c.getCurrency();
        }

        // Compute the NEXT upcoming payment deadline (10th) and payout (25th) from today
        // This ensures countdowns are always in the future, regardless of when the circle started
        String nextPayoutDate = null;
        String nextDeadline = null;
        if (c.getStatus() == CircleStatus.ACTIVE && c.getCurrentMonth() != null && c.getCurrentMonth() > 0) {
            java.time.OffsetDateTime now = java.time.OffsetDateTime.now();

            // Next 10th that hasn't passed yet
            java.time.OffsetDateTime deadlineCandidate = now.withDayOfMonth(10)
                    .withHour(23).withMinute(59).withSecond(59).withNano(0);
            if (!deadlineCandidate.isAfter(now)) deadlineCandidate = deadlineCandidate.plusMonths(1);

            // Next 25th that hasn't passed yet
            java.time.OffsetDateTime payoutCandidate = now.withDayOfMonth(25)
                    .withHour(23).withMinute(59).withSecond(59).withNano(0);
            if (!payoutCandidate.isAfter(now)) payoutCandidate = payoutCandidate.plusMonths(1);

            nextDeadline = deadlineCandidate.toString();
            nextPayoutDate = payoutCandidate.toString();
        }

        return new CircleMembershipSummaryResponse(
                c.getId(),
                c.getName(),
                monthly,              // circle's own currency — shown on the card
                c.getCurrency(),
                monthlyInUserCurrency, // user's home currency — used for DTI
                userCurrency,
                c.getDurationMonths(),
                c.getCurrentMonth(),
                remaining,
                m.getSlotNumber(),
                c.getStatus().name(),
                c.getInviteCode(),
                c.isPrivate(),
                nextPayoutDate,
                nextDeadline
        );
    }

    private CircleResponse mapToResponse(CircleEntity c, UserEntity user) {
        BigDecimal monthly = c.getTotalValue().divide(new BigDecimal(c.getDurationMonths()), 2, RoundingMode.HALF_UP);
        boolean affordable = user != null && validationService.validateJoin(user, c);
        boolean joined = user != null && membershipRepository.existsByCircle_IdAndUser_Id(c.getId(), user.getId());

        java.time.OffsetDateTime payoutDate = null;
        java.time.OffsetDateTime deadline = null;

        if (c.getStatus() == CircleStatus.ACTIVE && c.getCurrentMonth() != null && c.getCurrentMonth() > 0) {
            java.time.OffsetDateTime now = java.time.OffsetDateTime.now();

            deadline = now.withDayOfMonth(10).withHour(23).withMinute(59).withSecond(59).withNano(0);
            if (!deadline.isAfter(now)) deadline = deadline.plusMonths(1);

            payoutDate = now.withDayOfMonth(25).withHour(23).withMinute(59).withSecond(59).withNano(0);
            if (!payoutDate.isAfter(now)) payoutDate = payoutDate.plusMonths(1);
        }

        return new CircleResponse(
                c.getId(),
                c.getName(),
                c.getTotalValue(),
                c.getDurationMonths(),
                monthly,
                c.getCurrency(),
                c.getMaxMembers(),
                c.getCurrentMembers(),
                c.getStatus(),
                affordable,
                joined,
                c.getInviteCode(),
                c.isPrivate(),
                payoutDate,
                deadline
        );
    }


    public com.halqapay.dto.response.CircleDetailResponse getCircleDetail(UUID userId, UUID circleId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        CircleEntity circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new RuntimeException("Circle not found"));

        if (!membershipRepository.existsByCircle_IdAndUser_Id(circleId, userId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "You are not a member of this circle");
        }

        List<CircleMembershipEntity> memberships = membershipRepository.findByCircleId(circleId);

        int mySlot = memberships.stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .mapToInt(CircleMembershipEntity::getSlotNumber)
                .findFirst()
                .orElse(-1);

        java.time.OffsetDateTime now = java.time.OffsetDateTime.now();
        final java.time.OffsetDateTime rawBase = now.withDayOfMonth(25)
                .withHour(23).withMinute(59).withSecond(59).withNano(0);
        final java.time.OffsetDateTime basePayout = rawBase.isAfter(now) ? rawBase : rawBase.plusMonths(1);

        final int currentMonth = circle.getCurrentMonth() > 0 ? circle.getCurrentMonth() : 1;
        boolean isMyPayoutMonth = mySlot == currentMonth;

        List<com.halqapay.dto.response.CircleMemberDetailItem> members = memberships.stream()
                .sorted(java.util.Comparator.comparingInt(CircleMembershipEntity::getSlotNumber))
                .map(m -> {
                    int slot = m.getSlotNumber();
                    java.time.OffsetDateTime payoutDate = basePayout.plusMonths((long) slot - currentMonth);
                    boolean received = slot < currentMonth;
                    return new com.halqapay.dto.response.CircleMemberDetailItem(
                            slot,
                            m.getUser().getFullName(),
                            slot,
                            payoutDate.toString(),
                            received
                    );
                })
                .collect(Collectors.toList());

        BigDecimal monthly = circle.getTotalValue()
                .divide(new BigDecimal(circle.getDurationMonths()), 2, RoundingMode.HALF_UP);
        int paidMonths = Math.max(0, currentMonth - 1);
        int remainingMonths = Math.max(0, circle.getDurationMonths() - paidMonths);
        BigDecimal amountRemaining = monthly.multiply(new BigDecimal(remainingMonths));

        java.time.OffsetDateTime rawDeadline = now.withDayOfMonth(10)
                .withHour(23).withMinute(59).withSecond(59).withNano(0);
        java.time.OffsetDateTime deadline = rawDeadline.isAfter(now) ? rawDeadline : rawDeadline.plusMonths(1);

        return new com.halqapay.dto.response.CircleDetailResponse(
                circle.getId(),
                circle.getName(),
                circle.getCurrency(),
                circle.getTotalValue(),
                monthly,
                circle.getDurationMonths(),
                currentMonth,
                circle.getStatus().name(),
                mySlot,
                isMyPayoutMonth,
                deadline.toString(),
                amountRemaining,
                members
        );
    }


    @Transactional
    public void contributeToCircle(UUID userId, UUID circleId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        CircleEntity circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new RuntimeException("Circle not found"));

        if (!membershipRepository.existsByCircle_IdAndUser_Id(circleId, userId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "You are not a member of this circle");
        }

        if (circle.getStatus() != CircleStatus.ACTIVE) {
            throw new RuntimeException("Circle is not active");
        }

        BigDecimal monthly = circle.getTotalValue()
                .divide(new BigDecimal(circle.getDurationMonths()), 2, RoundingMode.HALF_UP);

        if (user.getWalletBalance().compareTo(monthly) < 0) {
            throw new RuntimeException("Insufficient wallet balance");
        }

        user.setWalletBalance(user.getWalletBalance().subtract(monthly));
        userRepository.save(user);

        com.halqapay.entity.TransactionEntity tx = new com.halqapay.entity.TransactionEntity();
        tx.setUser(user);
        tx.setType(com.halqapay.entity.TransactionType.CONTRIBUTION);
        tx.setAmount(monthly);
        tx.setCurrency(circle.getCurrency());
        tx.setStatus(com.halqapay.entity.TransactionStatus.COMPLETED);
        tx.setDescription("Monthly contribution to '" + circle.getName() + "'");
        transactionRepository.save(tx);

        notificationService.createNotification(user,
                "Contribution Paid",
                "Your contribution of " + monthly + " " + circle.getCurrency() +
                        " to '" + circle.getName() + "' has been recorded.",
                com.halqapay.entity.NotificationEntity.NotificationType.GENERIC);
    }

    private String generateInviteCode() {
        final String chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        java.security.SecureRandom rnd = new java.security.SecureRandom();
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                sb.append(chars.charAt(rnd.nextInt(chars.length())));
            }
            String code = sb.toString();
            if (circleRepository.findByInviteCode(code).isEmpty()) {
                return code;
            }
        }
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }
}
