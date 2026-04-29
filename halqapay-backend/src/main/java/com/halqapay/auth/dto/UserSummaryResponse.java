package com.halqapay.auth.dto;

import com.halqapay.users.CurrencyCode;

public record UserSummaryResponse(
        String id,
        String email,
        String fullName,
        String salary,
        String walletBalance,
        CurrencyCode currency
) {
}
