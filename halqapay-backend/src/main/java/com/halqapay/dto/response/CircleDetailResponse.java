package com.halqapay.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.halqapay.users.CurrencyCode;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CircleDetailResponse(
    @JsonProperty("circleId")              UUID circleId,
    @JsonProperty("name")                  String name,
    @JsonProperty("currency")              CurrencyCode currency,
    @JsonProperty("totalValue")            BigDecimal totalValue,
    @JsonProperty("monthlyContribution")   BigDecimal monthlyContribution,
    @JsonProperty("durationMonths")        int durationMonths,
    @JsonProperty("currentMonth")          int currentMonth,
    @JsonProperty("circleStatus")          String circleStatus,
    @JsonProperty("mySlotNumber")          int mySlotNumber,
    @JsonProperty("isMyPayoutMonth")       boolean isMyPayoutMonth,
    @JsonProperty("nextPaymentDeadline")   String nextPaymentDeadline,
    @JsonProperty("amountRemainingToPay")  BigDecimal amountRemainingToPay,
    @JsonProperty("members")               List<CircleMemberDetailItem> members
) {}
