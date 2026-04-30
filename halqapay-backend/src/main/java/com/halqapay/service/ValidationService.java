package com.halqapay.service;

import com.halqapay.entity.CircleEntity;
import com.halqapay.entity.CircleMembershipEntity;
import com.halqapay.entity.MembershipStatus;
import com.halqapay.repository.CircleMembershipRepository;
import com.halqapay.users.UserEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class ValidationService {
    private final CircleMembershipRepository membershipRepository;
    private final FxService fxService;

    public ValidationService(CircleMembershipRepository membershipRepository, FxService fxService) {
        this.membershipRepository = membershipRepository;
        this.fxService = fxService;
    }

    public boolean validateJoin(UserEntity user, CircleEntity circle) {
        BigDecimal monthlySalary = user.getSalary();
        BigDecimal dtiCap = monthlySalary.multiply(new BigDecimal("0.4"));

        BigDecimal existingBurden = calculateExistingBurden(user);
        BigDecimal newBurden = calculateCircleBurden(circle, user);

        return existingBurden.add(newBurden).compareTo(dtiCap) <= 0;
    }

    public BigDecimal calculateExistingBurden(UserEntity user) {
        List<CircleMembershipEntity> activeMemberships = membershipRepository.findByUser_IdAndStatus(user.getId(), MembershipStatus.ACTIVE.name());
        
        BigDecimal totalBurden = BigDecimal.ZERO;
        for (CircleMembershipEntity membership : activeMemberships) {
            CircleEntity circle = membership.getCircle();
            BigDecimal burden = calculateCircleBurden(circle, user);
            totalBurden = totalBurden.add(burden);
        }
        return totalBurden;
    }

    public BigDecimal calculateCircleBurden(CircleEntity circle, UserEntity user) {
        // C / M
        BigDecimal burdenInCircleCurrency = circle.getTotalValue().divide(new BigDecimal(circle.getDurationMonths()), 2, RoundingMode.HALF_UP);
        // Convert to user's currency
        return fxService.convert(burdenInCircleCurrency, circle.getCurrency(), user.getCurrency());
    }

    public Integer suggestMinDuration(UserEntity user, BigDecimal circleTotalValue, com.halqapay.users.CurrencyCode circleCurrency) {
        BigDecimal monthlySalary = user.getSalary();
        BigDecimal dtiCap = monthlySalary.multiply(new BigDecimal("0.4"));
        BigDecimal existingBurden = calculateExistingBurden(user);
        BigDecimal availableCapacity = dtiCap.subtract(existingBurden);

        if (availableCapacity.compareTo(BigDecimal.ZERO) <= 0) {
            return null; // Cannot join any new circles
        }

        // Convert circle total value to user's currency
        BigDecimal totalValueInUserCurrency = fxService.convert(circleTotalValue, circleCurrency, user.getCurrency());

        // M_min = ceil(C / availableCapacity)
        return totalValueInUserCurrency.divide(availableCapacity, 0, RoundingMode.CEILING).intValue();
    }
}
