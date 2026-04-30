package com.halqapay.dto.response;

import com.halqapay.entity.CircleStatus;
import com.halqapay.users.CurrencyCode;
import java.math.BigDecimal;
import java.util.UUID;

public record CircleResponse(
    UUID id,
    String name,
    BigDecimal totalValue,
    Integer durationMonths,
    BigDecimal monthlyContribution,
    CurrencyCode currency,
    Integer maxMembers,
    Integer currentMembers,
    CircleStatus status,
    boolean isAffordable,
    boolean isJoined
) {}
