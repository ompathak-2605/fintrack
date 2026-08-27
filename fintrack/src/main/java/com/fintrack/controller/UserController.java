package com.fintrack.controller;

import com.fintrack.config.ApiResponse;
import com.fintrack.dto.request.UpdateProfileRequest;
import com.fintrack.dto.response.UserResponse;
import com.fintrack.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        UserResponse response = userService
                .getProfile(userDetails.getUsername());

        return ResponseEntity.ok(
                ApiResponse.success("Profile fetched", response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        UserResponse response = userService
                .updateProfile(request, userDetails.getUsername());

        return ResponseEntity.ok(
                ApiResponse.success("Profile updated", response));
    }
}