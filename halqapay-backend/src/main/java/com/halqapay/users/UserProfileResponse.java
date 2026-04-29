package com.halqapay.users;

public record UserProfileResponse(
        String id,
        String email,
        String fullName,
        String country,
        CurrencyCode currency,
        String salary,
        String walletBalance,
        int riskScore
) {
}
