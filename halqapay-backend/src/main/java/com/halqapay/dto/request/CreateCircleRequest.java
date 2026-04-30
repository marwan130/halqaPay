package com.halqapay.dto.request;

import com.halqapay.users.CurrencyCode;
import java.math.BigDecimal;

public record CreateCircleRequest(
    String name,
    BigDecimal totalValue,
    Integer durationMonths,
    CurrencyCode currency,
    Integer maxMembers
) {}
