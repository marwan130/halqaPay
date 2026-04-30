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

        BigDecimal rateFrom = getRateToUsd(from);
        BigDecimal rateTo = getRateToUsd(to);

        // amount * rateFrom = amountInUsd
        // amountInUsd / rateTo = amountInTo
        return amount.multiply(rateFrom).divide(rateTo, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal getRateToUsd(CurrencyCode currency) {
        if (currency == CurrencyCode.USD) return BigDecimal.ONE;
        
        return fxRateRepository.findByFromCurrencyAndToCurrency(currency, CurrencyCode.USD)
                .map(FxRateEntity::getRate)
                .orElseThrow(() -> new RuntimeException("Exchange rate to USD not found for " + currency));
    }
}
