package com.halqapay.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.halqapay.users.CurrencyCode;

import java.math.BigDecimal;

public record CircleJoinOrValidateResponse(
    @JsonProperty("approved") boolean approved,
    // In the USER's home currency (already FX-converted by ValidationService)
    @JsonProperty("monthlyBurden") BigDecimal monthlyBurden,
    @JsonProperty("newTotalBurden") BigDecimal newTotalBurden,
    @JsonProperty("remainingCapacity") BigDecimal remainingCapacity,
    @JsonProperty("reason") String reason,
    @JsonProperty("suggestedMinDuration") Integer suggestedMinDuration,
    // The currency that monthlyBurden / remainingCapacity are expressed in
    @JsonProperty("userCurrency") CurrencyCode userCurrency,
    // The circle's own monthly contribution (in circle's currency) — for display
    @JsonProperty("circleMonthlyInCircleCurrency") BigDecimal circleMonthlyInCircleCurrency,
    @JsonProperty("circleCurrency") CurrencyCode circleCurrency
) {}
