package com.halqapay.repository;

import com.halqapay.entity.CircleMembershipEntity;
import com.halqapay.entity.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CircleMembershipRepository extends JpaRepository<CircleMembershipEntity, UUID> {
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM circle_memberships WHERE circle_id = CAST(:circleId AS UUID)", nativeQuery = true)
    List<CircleMembershipEntity> findByCircleId(@org.springframework.data.repository.query.Param("circleId") java.util.UUID circleId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM circle_memberships WHERE user_id = CAST(:userId AS UUID)", nativeQuery = true)
    List<CircleMembershipEntity> findByUser_Id(@org.springframework.data.repository.query.Param("userId") java.util.UUID userId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM circle_memberships WHERE user_id = CAST(:userId AS UUID) AND status = CAST(:status AS membership_status)", nativeQuery = true)
    List<CircleMembershipEntity> findByUser_IdAndStatus(
            @org.springframework.data.repository.query.Param("userId") java.util.UUID userId,
            @org.springframework.data.repository.query.Param("status") String status
    );

    @org.springframework.data.jpa.repository.Query(value = "SELECT EXISTS(SELECT 1 FROM circle_memberships WHERE circle_id = CAST(:circleId AS UUID) AND user_id = CAST(:userId AS UUID))", nativeQuery = true)
    boolean existsByCircle_IdAndUser_Id(
            @org.springframework.data.repository.query.Param("circleId") java.util.UUID circleId,
            @org.springframework.data.repository.query.Param("userId") java.util.UUID userId
    );

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM circle_memberships WHERE circle_id = CAST(:circleId AS UUID) AND slot_number = :slotNumber", nativeQuery = true)
    java.util.Optional<CircleMembershipEntity> findByCircleIdAndSlotNumber(
            @org.springframework.data.repository.query.Param("circleId") java.util.UUID circleId,
            @org.springframework.data.repository.query.Param("slotNumber") int slotNumber
    );
}
