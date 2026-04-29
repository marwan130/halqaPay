package com.halqapay.users;

import com.halqapay.security.AuthUserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
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
                user.getRiskScore()
        );
    }

    @GetMapping("/me/circles")
    public Map<String, List<Object>> myCircles() {
        return Map.of("activeCircles", List.of(), "completedCircles", List.of());
    }

    @GetMapping("/me/transactions")
    public Map<String, List<Object>> myTransactions() {
        return Map.of("transactions", List.of());
    }
}
