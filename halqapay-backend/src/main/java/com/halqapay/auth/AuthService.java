package com.halqapay.auth;

import com.halqapay.auth.dto.AuthResponse;
import com.halqapay.auth.dto.LoginRequest;
import com.halqapay.auth.dto.RegisterRequest;
import com.halqapay.auth.dto.UserSummaryResponse;
import com.halqapay.security.JwtService;
import com.halqapay.users.UserEntity;
import com.halqapay.users.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone().trim());
        user.setCountry(request.country().trim());
        user.setCurrency(request.currency());
        user.setSalary(request.salary());
        user.setWalletBalance(BigDecimal.ZERO);
        user.setRiskScore(750);
        user.setRole(com.halqapay.users.UserRole.USER);
        user.setKycStatus(com.halqapay.users.KycStatus.VERIFIED);

        UserEntity saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getId(), saved.getEmail());
        return new AuthResponse(token, toSummary(saved));
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(Locale.ROOT), request.password())
            );
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        UserEntity user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, toSummary(user));
    }

    public static UserSummaryResponse toSummary(UserEntity user) {
        return new UserSummaryResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getFullName(),
                user.getSalary().toPlainString(),
                user.getWalletBalance().toPlainString(),
                user.getCurrency()
        );
    }
}
