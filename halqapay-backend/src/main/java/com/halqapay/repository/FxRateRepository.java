package com.halqapay.repository;

import com.halqapay.entity.FxRateEntity;
import com.halqapay.users.CurrencyCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FxRateRepository extends JpaRepository<FxRateEntity, Long> {
    Optional<FxRateEntity> findByFromCurrencyAndToCurrency(CurrencyCode fromCurrency, CurrencyCode toCurrency);
}
