package com.fintrack.service;

import com.fintrack.dto.request.UpdateProfileRequest;
import com.fintrack.dto.response.UserResponse;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.model.User;
import com.fintrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(
            UpdateProfileRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPersonaType() != null) {
            user.setPersonaType(request.getPersonaType());
        }
        if (request.getMonthlyIncome() != null) {
            user.setMonthlyIncome(request.getMonthlyIncome());
        }
        if (request.getCurrency() != null) {
            user.setCurrency(request.getCurrency());
        }

        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .personaType(user.getPersonaType())
                .currency(user.getCurrency())
                .monthlyIncome(user.getMonthlyIncome())
                .build();
    }
}