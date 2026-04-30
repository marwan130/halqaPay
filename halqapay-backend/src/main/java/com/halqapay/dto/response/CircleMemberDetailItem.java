package com.halqapay.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CircleMemberDetailItem(
    @JsonProperty("slotNumber")   int slotNumber,
    @JsonProperty("fullName")     String fullName,
    @JsonProperty("payoutMonth")  int payoutMonth,
    @JsonProperty("payoutDate")   String payoutDate,      // ISO date of that month's 25th
    @JsonProperty("payoutReceived") boolean payoutReceived // month already completed
) {}
