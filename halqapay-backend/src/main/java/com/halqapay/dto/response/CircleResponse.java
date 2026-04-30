package com.halqapay.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.halqapay.entity.CircleStatus;
import com.halqapay.users.CurrencyCode;
import java.math.BigDecimal;
import java.util.UUID;

public record CircleResponse(
    @JsonProperty("id") UUID id,
    @JsonProperty("name") String name,
    @JsonProperty("totalValue") BigDecimal totalValue,
    @JsonProperty("durationMonths") Integer durationMonths,
    @JsonProperty("monthlyContribution") BigDecimal monthlyContribution,
    @JsonProperty("currency") CurrencyCode currency,
    @JsonProperty("maxMembers") Integer maxMembers,
    @JsonProperty("currentMembers") Integer currentMembers,
    @JsonProperty("status") CircleStatus status,
    @JsonProperty("isAffordable") boolean isAffordable,
    @JsonProperty("isJoined") boolean isJoined,
    @JsonProperty("inviteCode") String inviteCode,
    @JsonProperty("isPrivate") boolean isPrivate,
    @JsonProperty("nextPayoutDate") java.time.OffsetDateTime nextPayoutDate,
    @JsonProperty("nextDeadline") java.time.OffsetDateTime nextDeadline
) {}
