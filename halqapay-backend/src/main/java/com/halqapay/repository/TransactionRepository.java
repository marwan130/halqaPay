package com.halqapay.repository;

import com.halqapay.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, UUID> {
    List<TransactionEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<TransactionEntity> findByCircleId(UUID circleId);
    
    boolean existsByUserIdAndCircleIdAndTypeAndMonthNumber(
        UUID userId, 
        UUID circleId, 
        com.halqapay.entity.TransactionType type, 
        Integer monthNumber
    );
}
