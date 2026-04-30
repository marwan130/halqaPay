package com.halqapay.entity;

import com.halqapay.users.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "monthly_cycles")
public class MonthlyCycleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "circle_id", nullable = false, foreignKey = @ForeignKey(name = "fk_cycles_circle"))
    private CircleEntity circle;

    @Column(name = "month_number", nullable = false)
    private Integer monthNumber;

    @ManyToOne
    @JoinColumn(name = "payout_user_id", nullable = true, foreignKey = @ForeignKey(name = "fk_cycles_payout_user"))
    private UserEntity payoutUser;

    @Column(name = "total_collected", nullable = false)
    private BigDecimal totalCollected;

    @Column(name = "payout_amount")
    private BigDecimal payoutAmount;

    @Column(name = "cycle_date", insertable = false, updatable = false)
    private OffsetDateTime cycleDate;

    @Column(nullable = false)
    private Boolean completed;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public CircleEntity getCircle() {
        return circle;
    }

    public void setCircle(CircleEntity circle) {
        this.circle = circle;
    }

    public Integer getMonthNumber() {
        return monthNumber;
    }

    public void setMonthNumber(Integer monthNumber) {
        this.monthNumber = monthNumber;
    }

    public UserEntity getPayoutUser() {
        return payoutUser;
    }

    public void setPayoutUser(UserEntity payoutUser) {
        this.payoutUser = payoutUser;
    }

    public BigDecimal getTotalCollected() {
        return totalCollected;
    }

    public void setTotalCollected(BigDecimal totalCollected) {
        this.totalCollected = totalCollected;
    }

    public BigDecimal getPayoutAmount() {
        return payoutAmount;
    }

    public void setPayoutAmount(BigDecimal payoutAmount) {
        this.payoutAmount = payoutAmount;
    }

    public OffsetDateTime getCycleDate() {
        return cycleDate;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
}
