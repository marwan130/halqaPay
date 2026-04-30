package com.halqapay.repository;

import com.halqapay.entity.CircleEntity;
import com.halqapay.entity.CircleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CircleRepository extends JpaRepository<CircleEntity, UUID> {
    List<CircleEntity> findByStatus(CircleStatus status);
    java.util.Optional<CircleEntity> findByInviteCode(String inviteCode);
}
