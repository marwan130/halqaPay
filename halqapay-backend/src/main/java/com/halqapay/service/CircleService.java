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
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CircleService {
    private final CircleRepository circleRepository;
    private final CircleMembershipRepository membershipRepository;
    private final ValidationService validationService;
    private final UserRepository userRepository;

    public CircleService(CircleRepository circleRepository, 
                         CircleMembershipRepository membershipRepository,
                         ValidationService validationService,
                         UserRepository userRepository) {
        this.circleRepository = circleRepository;
        this.membershipRepository = membershipRepository;
        this.validationService = validationService;
        this.userRepository = userRepository;
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
        System.out.println("Filtering circles: currency=" + currencyStr + ", min=" + minValue + ", max=" + maxValue);
        
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
    public void joinCircle(UUID userId, UUID circleId) {
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
            throw new RuntimeException("Join rejected: DTI limit exceeded. Suggested minimum duration: " + (suggested != null ? suggested : "N/A"));
        }

        CircleMembershipEntity membership = new CircleMembershipEntity();
        membership.setUser(user);
        membership.setCircle(circle);
        membership.setSlotNumber(circle.getCurrentMembers() + 1);
        membership.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(membership);

        circle.setCurrentMembers(circle.getCurrentMembers() + 1);
        if (circle.getCurrentMembers().equals(circle.getMaxMembers())) {
            circle.setStatus(CircleStatus.ACTIVE);
            circle.setCurrentMonth(1);
        }
        circleRepository.save(circle);
    }

    @Transactional
    public void leaveCircle(UUID userId, UUID circleId) {
        CircleEntity circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new RuntimeException("Circle not found"));

        if (circle.getStatus() != CircleStatus.OPEN) {
            throw new RuntimeException("You can only leave a circle before payouts have started. This circle is already " + circle.getStatus().name().toLowerCase() + ".");
        }

        CircleMembershipEntity membership = membershipRepository.findAll().stream()
                .filter(m -> m.getCircle().getId().equals(circleId) && m.getUser().getId().equals(userId))
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
        
        BigDecimal dtiCap = user.getSalary().multiply(new BigDecimal("0.4"));
        BigDecimal remaining = dtiCap.subtract(totalBurden);
        
        Integer suggested = null;
        String reason = null;
        if (!approved) {
            suggested = validationService.suggestMinDuration(user, circle.getTotalValue(), circle.getCurrency());
            reason = "DTI limit exceeded";
        }

        return new CircleJoinOrValidateResponse(
                approved,
                newBurden,
                totalBurden,
                remaining,
                reason,
                suggested
        );
    }

    public MyCirclesResponse getUserCircles(UUID userId) {
        List<CircleMembershipEntity> memberships = membershipRepository.findByUser_Id(userId);
        System.out.println("Found " + memberships.size() + " memberships for user " + userId);
        
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
        BigDecimal monthly = c.getTotalValue().divide(new BigDecimal(c.getDurationMonths()), 2, RoundingMode.HALF_UP);
        int remaining = Math.max(0, c.getDurationMonths() - (c.getCurrentMonth() > 0 ? c.getCurrentMonth() - 1 : 0));
        
        return new CircleMembershipSummaryResponse(
                c.getId(),
                c.getName(),
                monthly,
                c.getCurrency(),
                c.getDurationMonths(),
                c.getCurrentMonth(),
                remaining,
                m.getSlotNumber(),
                c.getStatus().name()
        );
    }

    private CircleResponse mapToResponse(CircleEntity c, UserEntity user) {
        BigDecimal monthly = c.getTotalValue().divide(new BigDecimal(c.getDurationMonths()), 2, RoundingMode.HALF_UP);
        boolean affordable = user != null && validationService.validateJoin(user, c);
        boolean joined = user != null && membershipRepository.existsByCircle_IdAndUser_Id(c.getId(), user.getId());

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
                joined
        );
    }
}
