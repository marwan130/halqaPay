package com.halqapay.service;

import com.halqapay.entity.FxRateEntity;
import com.halqapay.repository.FxRateRepository;
import com.halqapay.users.CurrencyCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class FxServiceTest {

    private FxRateRepository fxRateRepository;
    private FxService fxService;

    @BeforeEach
    void setUp() {
        fxRateRepository = Mockito.mock(FxRateRepository.class);
        fxService = new FxService(fxRateRepository);
    }

    @Test
    void convert_SameCurrency_ShouldReturnAmount() {
        BigDecimal amount = new BigDecimal("100.00");
        BigDecimal result = fxService.convert(amount, CurrencyCode.SAR, CurrencyCode.SAR);
        assertEquals(0, amount.compareTo(result));
    }

    @Test
    void convert_DifferentCurrency_ShouldUseUsdAsBridge() {
        // 1 SAR = 0.27 USD
        // 1 USD = 3.75 SAR (so 1 SAR = 1 SAR)
        
        FxRateEntity sarToUsd = new FxRateEntity();
        sarToUsd.setRate(new BigDecimal("0.2667")); // approx 1/3.75
        
        FxRateEntity usdToSar = new FxRateEntity();
        usdToSar.setRate(new BigDecimal("3.75"));

        when(fxRateRepository.findByFromCurrencyAndToCurrency(CurrencyCode.SAR, CurrencyCode.USD))
                .thenReturn(Optional.of(sarToUsd));
        when(fxRateRepository.findByFromCurrencyAndToCurrency(CurrencyCode.USD, CurrencyCode.SAR))
                .thenReturn(Optional.of(usdToSar));

        BigDecimal result = fxService.convert(new BigDecimal("100"), CurrencyCode.SAR, CurrencyCode.SAR);
        // Wait, convert(100, SAR, SAR) returns early.
        
        // Let's test SAR to AED
        // 1 USD = 3.67 AED
        FxRateEntity usdToAed = new FxRateEntity();
        usdToAed.setRate(new BigDecimal("3.67"));
        
        when(fxRateRepository.findByFromCurrencyAndToCurrency(CurrencyCode.USD, CurrencyCode.AED))
                .thenReturn(Optional.of(usdToAed));
                
        BigDecimal resultAed = fxService.convert(new BigDecimal("100"), CurrencyCode.SAR, CurrencyCode.AED);
        // 100 * 0.2667 * 3.67 = 97.8789 -> 97.88
        assertEquals(new BigDecimal("97.88"), resultAed);
    }

    @Test
    void convert_MissingRate_ShouldThrowException() {
        when(fxRateRepository.findByFromCurrencyAndToCurrency(any(), any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> 
            fxService.convert(new BigDecimal("100"), CurrencyCode.SAR, CurrencyCode.USD)
        );
    }

    private <T> T any() {
        return Mockito.any();
    }
}
