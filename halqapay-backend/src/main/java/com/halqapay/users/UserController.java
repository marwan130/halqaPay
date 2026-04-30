package com.halqapay.users;

import com.halqapay.security.AuthUserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    private final com.halqapay.service.CircleService circleService;

    public UserController(UserRepository userRepository, com.halqapay.service.CircleService circleService) {
        this.userRepository = userRepository;
        this.circleService = circleService;
    }

    @GetMapping("/me")
    public UserProfileResponse me(@AuthenticationPrincipal AuthUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        UserEntity user = userRepository.findById(principal.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return new UserProfileResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getFullName(),
                user.getCountry(),
                user.getCurrency(),
                user.getSalary().toPlainString(),
                user.getWalletBalance().toPlainString(),
                user.getRiskScore(),
                user.getKycStatus()
        );
    }

    @GetMapping("/me/circles")
    public com.halqapay.dto.response.MyCirclesResponse myCircles(@AuthenticationPrincipal AuthUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return circleService.getUserCircles(principal.userId());
    }

    @PostMapping("/me/verify-salary")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void verifySalary(@AuthenticationPrincipal AuthUserPrincipal principal, @RequestBody Map<String, String> request) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        UserEntity user = userRepository.findById(principal.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        String documentUrl = request.get("documentUrl");
        if (documentUrl == null || documentUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document URL is required");
        }

        user.setKycDocumentUrl(documentUrl);
        user.setKycStatus(KycStatus.PENDING);
        userRepository.save(user);
    }

    @GetMapping("/me/transactions")
    public Map<String, List<Object>> myTransactions() {
        return Map.of("transactions", List.of());
    }
}
