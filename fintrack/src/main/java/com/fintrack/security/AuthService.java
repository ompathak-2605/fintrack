package com.fintrack.service;

import com.fintrack.dto.request.LoginRequest;
import com.fintrack.dto.request.RegisterRequest;
import com.fintrack.dto.response.AuthResponse;
import com.fintrack.exception.BadRequestException;
import com.fintrack.exception.DuplicateResourceException;
import com.fintrack.model.User;
import com.fintrack.repository.UserRepository;
import com.fintrack.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {

        // Rule 1 — check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "An account with this email already exists: " + request.getEmail()
            );
        }

        // Rule 2 — build the User object from the request
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .personaType(request.getPersonaType())
                .monthlyIncome(request.getMonthlyIncome())
                .build();

        // Rule 3 — save to database
        User savedUser = userRepository.save(user);

        // Rule 4 — generate JWT token
        String token = jwtService.generateToken(savedUser.getEmail());

        // Rule 5 — build and return the response
        return AuthResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .personaType(savedUser.getPersonaType())
                .currency(savedUser.getCurrency())
                .token(token)
                .tokenType("Bearer")
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        // Rule 1 — find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException(
                        "Invalid email or password"
                ));

        // Rule 2 — verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        // Rule 3 — generate JWT token
        String token = jwtService.generateToken(user.getEmail());

        // Rule 4 — build and return the response
        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .personaType(user.getPersonaType())
                .currency(user.getCurrency())
                .token(token)
                .tokenType("Bearer")
                .build();
    }
}