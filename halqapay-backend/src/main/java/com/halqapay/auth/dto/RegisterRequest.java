package com.halqapay.auth.dto;

import com.halqapay.users.CurrencyCode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 120) String password,
        @NotBlank @Size(max = 255) String fullName,
        @NotBlank @Size(max = 30) String phone,
        @NotBlank @Size(max = 100) String country,
        @NotNull CurrencyCode currency,
        @NotNull @DecimalMin(value = "0.01") BigDecimal salary
) {
}
