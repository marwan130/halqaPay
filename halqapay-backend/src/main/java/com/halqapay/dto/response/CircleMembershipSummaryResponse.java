package com.halqapay.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.halqapay.users.CurrencyCode;
import java.math.BigDecimal;
import java.util.UUID;

public record CircleMembershipSummaryResponse(
        @JsonProperty("circleId") UUID circleId,
        @JsonProperty("name") String name,
        // Monthly payment in the circle's OWN currency (for display)
        @JsonProperty("monthlyPayment") BigDecimal monthlyPayment,
        @JsonProperty("currency") CurrencyCode currency,
        // Monthly payment converted to the user's home currency (for DTI math)
        @JsonProperty("monthlyPaymentInUserCurrency") BigDecimal monthlyPaymentInUserCurrency,
        @JsonProperty("userCurrency") CurrencyCode userCurrency,
        @JsonProperty("durationMonths") Integer durationMonths,
        @JsonProperty("currentMonth") Integer currentMonth,
        @JsonProperty("monthsRemaining") Integer monthsRemaining,
        @JsonProperty("slotNumber") Integer slotNumber,
        @JsonProperty("status") String status,
        @JsonProperty("inviteCode") String inviteCode,
        @JsonProperty("isPrivate") boolean isPrivate,
        @JsonProperty("nextPayoutDate") String nextPayoutDate,
        @JsonProperty("nextDeadline") String nextDeadline
) {
}
