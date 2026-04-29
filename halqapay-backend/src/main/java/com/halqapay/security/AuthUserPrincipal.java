package com.halqapay.security;

import java.util.UUID;

public record AuthUserPrincipal(
        UUID userId,
        String email
) {
}
