package com.halqapay.controller;

import com.halqapay.dto.request.CreateCircleRequest;
import com.halqapay.dto.response.CircleJoinOrValidateResponse;
import com.halqapay.dto.response.CircleResponse;
import com.halqapay.security.AuthUserPrincipal;
import com.halqapay.service.CircleService;
import com.halqapay.users.UserEntity;
import com.halqapay.users.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/circles")
public class CircleController {
    private final CircleService circleService;
    private final UserRepository userRepository;

    public CircleController(CircleService circleService, UserRepository userRepository) {
        this.circleService = circleService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CircleResponse createCircle(@RequestBody CreateCircleRequest request, @AuthenticationPrincipal AuthUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required to create circles");
        }
        try {
            return circleService.createCircle(request, principal.userId());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping
    public List<CircleResponse> listAvailableCircles(
            @AuthenticationPrincipal AuthUserPrincipal principal,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) java.math.BigDecimal minValue,
            @RequestParam(required = false) java.math.BigDecimal maxValue
    ) {
        System.out.println("listAvailableCircles: principal=" + (principal != null ? principal.userId() : "null"));
        UserEntity user = null;
        if (principal != null) {
            user = userRepository.findById(principal.userId()).orElse(null);
            System.out.println("listAvailableCircles: user found=" + (user != null));
        }
        return circleService.listAvailableCircles(user, currency, minValue, maxValue);
    }

    @PostMapping("/{id}/validate")
    public CircleJoinOrValidateResponse validateCircle(@PathVariable UUID id, @AuthenticationPrincipal AuthUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required to validate circles");
        }
        return circleService.validateCircle(principal.userId(), id);
    }

    @PostMapping("/{id}/join")
    public void joinCircle(@PathVariable UUID id, @AuthenticationPrincipal AuthUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required to join circles");
        }
        try {
            circleService.joinCircle(principal.userId(), id);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/{id}/leave")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveCircle(@PathVariable UUID id, @AuthenticationPrincipal AuthUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required to leave circles");
        }
        try {
            circleService.leaveCircle(principal.userId(), id);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
