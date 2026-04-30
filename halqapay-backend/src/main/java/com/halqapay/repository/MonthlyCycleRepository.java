package com.halqapay.repository;

import com.halqapay.entity.MonthlyCycleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MonthlyCycleRepository extends JpaRepository<MonthlyCycleEntity, UUID> {
    List<MonthlyCycleEntity> findByCircleId(UUID circleId);
    Optional<MonthlyCycleEntity> findByCircleIdAndMonthNumber(UUID circleId, Integer monthNumber);
}
