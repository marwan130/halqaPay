package com.halqapay.dto.response;

import java.math.BigDecimal;

public record CircleJoinOrValidateResponse(
    boolean approved,
    BigDecimal monthlyBurden,
    BigDecimal newTotalBurden,
    BigDecimal remainingCapacity,
    String reason,
    Integer suggestedMinDuration
) {}
