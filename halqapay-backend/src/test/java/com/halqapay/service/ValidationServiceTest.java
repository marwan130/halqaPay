package com.halqapay.service;

import com.halqapay.entity.CircleEntity;
import com.halqapay.entity.CircleMembershipEntity;
import com.halqapay.entity.MembershipStatus;
import com.halqapay.repository.CircleMembershipRepository;
import com.halqapay.users.CurrencyCode;
import com.halqapay.users.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class ValidationServiceTest {

    private CircleMembershipRepository membershipRepository;
    private FxService fxService;
    private ValidationService validationService;

    @BeforeEach
    void setUp() {
        membershipRepository = Mockito.mock(CircleMembershipRepository.class);
        fxService = Mockito.mock(FxService.class);
        validationService = new ValidationService(membershipRepository, fxService);
    }

    @Test
    void validateJoin_ShouldReturnTrue_WhenUnderCap() {
        UserEntity user = createUser("10000", CurrencyCode.SAR); // 4000 cap
        CircleEntity circle = createCircle("1000", 10, CurrencyCode.SAR); // 100/mo

        when(membershipRepository.findByUser_IdAndStatus(any(), eq(MembershipStatus.ACTIVE.name())))
                .thenReturn(List.of());
        when(fxService.convert(any(), any(), any())).thenAnswer(i -> i.getArgument(0));

        assertTrue(validationService.validateJoin(user, circle));
    }

    @Test
    void validateJoin_ShouldReturnFalse_WhenOverCap() {
        UserEntity user = createUser("10000", CurrencyCode.SAR); // 4000 cap
        CircleEntity circle = createCircle("50000", 10, CurrencyCode.SAR); // 5000/mo

        when(membershipRepository.findByUser_IdAndStatus(any(), eq(MembershipStatus.ACTIVE.name())))
                .thenReturn(List.of());
        when(fxService.convert(any(), any(), any())).thenAnswer(i -> i.getArgument(0));

        assertFalse(validationService.validateJoin(user, circle));
    }

    @Test
    void validateJoin_ShouldAccumulateExistingBurden() {
        UserEntity user = createUser("10000", CurrencyCode.SAR); // 4000 cap
        
        // Existing circle: 3000/mo
        CircleEntity existingCircle = createCircle("30000", 10, CurrencyCode.SAR);
        CircleMembershipEntity membership = new CircleMembershipEntity();
        membership.setCircle(existingCircle);
        
        // New circle: 1500/mo (Total 4500 > 4000)
        CircleEntity newCircle = createCircle("15000", 10, CurrencyCode.SAR);

        when(membershipRepository.findByUser_IdAndStatus(any(), eq(MembershipStatus.ACTIVE.name())))
                .thenReturn(List.of(membership));
        when(fxService.convert(any(), any(), any())).thenAnswer(i -> i.getArgument(0));

        assertFalse(validationService.validateJoin(user, newCircle));
    }

    @Test
    void suggestMinDuration_ShouldReturnCorrectMonths() {
        UserEntity user = createUser("10000", CurrencyCode.SAR); // 4000 cap
        // 1000/mo existing burden -> 3000 available
        
        CircleEntity existingCircle = createCircle("10000", 10, CurrencyCode.SAR);
        CircleMembershipEntity membership = new CircleMembershipEntity();
        membership.setCircle(existingCircle);

        when(membershipRepository.findByUser_IdAndStatus(any(), eq(MembershipStatus.ACTIVE.name())))
                .thenReturn(List.of(membership));
        when(fxService.convert(any(), any(), any())).thenAnswer(i -> i.getArgument(0));

        // Total value 10000. 10000 / 3000 = 3.33 -> 4 months
        Integer suggested = validationService.suggestMinDuration(user, new BigDecimal("10000"), CurrencyCode.SAR);
        assertEquals(4, suggested);
    }

    @Test
    void suggestMinDuration_ShouldReturnNull_WhenNoCapacity() {
        UserEntity user = createUser("10000", CurrencyCode.SAR); // 4000 cap
        
        CircleEntity existingCircle = createCircle("40000", 10, CurrencyCode.SAR); // 4000/mo
        CircleMembershipEntity membership = new CircleMembershipEntity();
        membership.setCircle(existingCircle);

        when(membershipRepository.findByUser_IdAndStatus(any(), eq(MembershipStatus.ACTIVE.name())))
                .thenReturn(List.of(membership));
        when(fxService.convert(any(), any(), any())).thenAnswer(i -> i.getArgument(0));

        Integer suggested = validationService.suggestMinDuration(user, new BigDecimal("10000"), CurrencyCode.SAR);
        assertNull(suggested);
    }

    private UserEntity createUser(String salary, CurrencyCode currency) {
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setSalary(new BigDecimal(salary));
        user.setCurrency(currency);
        return user;
    }

    private CircleEntity createCircle(String totalValue, int duration, CurrencyCode currency) {
        CircleEntity circle = new CircleEntity();
        circle.setId(UUID.randomUUID());
        circle.setTotalValue(new BigDecimal(totalValue));
        circle.setDurationMonths(duration);
        circle.setCurrency(currency);
        return circle;
    }
}
