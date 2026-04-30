package com.halqapay.dto.response;

import com.halqapay.users.CurrencyCode;
import java.math.BigDecimal;
import java.util.UUID;

public record CircleMembershipSummaryResponse(
        UUID circleId,
        String name,
        BigDecimal monthlyPayment,
        CurrencyCode currency,
        Integer durationMonths,
        Integer currentMonth,
        Integer monthsRemaining,
        Integer slotNumber,
        String status
) {
}
