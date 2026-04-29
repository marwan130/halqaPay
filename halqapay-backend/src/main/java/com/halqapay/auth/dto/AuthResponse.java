package com.halqapay.auth.dto;

public record AuthResponse(
        String token,
        UserSummaryResponse user
) {
}
