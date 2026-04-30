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

    @org.springframework.beans.factory.annotation.Value("${app.dti-threshold:0.4}")
    private BigDecimal dtiThreshold;

    public ValidationService(CircleMembershipRepository membershipRepository, FxService fxService) {
        this.membershipRepository = membershipRepository;
        this.fxService = fxService;
    }

    public boolean validateJoin(UserEntity user, CircleEntity circle) {
        BigDecimal monthlySalary = user.getSalary();
        BigDecimal dtiCap = monthlySalary.multiply(dtiThreshold);

        BigDecimal existingBurden = calculateExistingBurden(user);
        BigDecimal newBurden = calculateCircleBurden(circle, user);
        BigDecimal totalBurden = existingBurden.add(newBurden);

        // Wallet balance offsets the TOTAL burden (existing + new),
        // since wallet funds can cover payments for any circle.
        BigDecimal walletOffset = calculateWalletOffset(user, circle);
        BigDecimal effectiveBurden = totalBurden.subtract(walletOffset).max(BigDecimal.ZERO);

        return effectiveBurden.compareTo(dtiCap) <= 0;
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

    /**
     * Calculates how much the user's wallet balance offsets the monthly burden
     * for a given circle. The wallet balance is converted to the user's currency
     * and spread evenly across the circle's duration months.
     */
    public BigDecimal calculateWalletOffset(UserEntity user, CircleEntity circle) {
        BigDecimal walletBalance = user.getWalletBalance();
        if (walletBalance == null || walletBalance.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        // Wallet is already in user's currency
        return walletBalance.divide(new BigDecimal(circle.getDurationMonths()), 2, RoundingMode.HALF_UP);
    }

    public Integer suggestMinDuration(UserEntity user, BigDecimal circleTotalValue, com.halqapay.users.CurrencyCode circleCurrency) {
        BigDecimal monthlySalary = user.getSalary();
        BigDecimal dtiCap = monthlySalary.multiply(dtiThreshold);
        BigDecimal existingBurden = calculateExistingBurden(user);

        // Convert circle total value to user's currency
        BigDecimal totalValueInUserCurrency = fxService.convert(circleTotalValue, circleCurrency, user.getCurrency());
        BigDecimal walletBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;

        // The constraint for duration M is:
        //   existingBurden + C/M - W/M <= dtiCap
        //   (C - W) / M <= dtiCap - existingBurden
        BigDecimal netCost = totalValueInUserCurrency.subtract(walletBalance);
        BigDecimal availableCapacity = dtiCap.subtract(existingBurden);

        if (netCost.compareTo(BigDecimal.ZERO) <= 0) {
            // Wallet covers the circle value entirely
            if (availableCapacity.compareTo(BigDecimal.ZERO) >= 0) {
                return 1; // Salary capacity alone is fine, any duration works
            }
            // Existing burden exceeds DTI cap; wallet surplus must cover the deficit per month.
            // Shorter durations = more wallet offset per month = better.
            // At M=1: offset = W, effective = existingBurden + C - W
            // Check if M=1 works:
            BigDecimal effectiveAtOne = existingBurden.add(totalValueInUserCurrency).subtract(walletBalance);
            if (effectiveAtOne.compareTo(dtiCap) <= 0) {
                return 1;
            }
            return null; // Even at M=1, wallet can't cover the deficit
        }

        // netCost > 0: circle costs more than wallet
        if (availableCapacity.compareTo(BigDecimal.ZERO) <= 0) {
            return null; // No salary capacity and wallet doesn't cover circle, impossible
        }

        // M_min = ceil(netCost / availableCapacity)
        return netCost.divide(availableCapacity, 0, RoundingMode.CEILING).intValue();
    }
}
