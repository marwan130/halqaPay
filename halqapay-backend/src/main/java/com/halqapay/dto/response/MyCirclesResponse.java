package com.halqapay.dto.response;

import java.util.List;

public record MyCirclesResponse(
        List<CircleMembershipSummaryResponse> activeCircles,
        List<CircleMembershipSummaryResponse> completedCircles
) {
}
