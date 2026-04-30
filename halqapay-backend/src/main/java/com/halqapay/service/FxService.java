package com.halqapay.service;

import com.halqapay.entity.FxRateEntity;
import com.halqapay.repository.FxRateRepository;
import com.halqapay.users.CurrencyCode;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class FxService {
    private final FxRateRepository fxRateRepository;

    public FxService(FxRateRepository fxRateRepository) {
        this.fxRateRepository = fxRateRepository;
    }

    public BigDecimal convert(BigDecimal amount, CurrencyCode from, CurrencyCode to) {
        if (from == to) {
            return amount;
        }

        // Standardize to USD first
        BigDecimal rateToUsd = getRate(from, CurrencyCode.USD);
        BigDecimal amountInUsd = amount.multiply(rateToUsd);

        // Then to target currency
        BigDecimal rateFromUsd = getRate(CurrencyCode.USD, to);
        
        return amountInUsd.multiply(rateFromUsd).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal getRate(CurrencyCode from, CurrencyCode to) {
        if (from == to) return BigDecimal.ONE;
        
        return fxRateRepository.findByFromCurrencyAndToCurrency(from, to)
                .map(FxRateEntity::getRate)
                .orElseThrow(() -> new RuntimeException("Exchange rate not found for " + from + " to " + to));
    }
}
