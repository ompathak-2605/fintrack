package com.fintrack.controller;

import com.fintrack.config.ApiResponse;
import com.fintrack.dto.request.CreateGoalRequest;
import com.fintrack.dto.response.GoalResponse;
import com.fintrack.service.GoalService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(
            @Valid @RequestBody CreateGoalRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        GoalResponse response = goalService
                .createGoal(request, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Goal created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getAllGoals(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<GoalResponse> response = goalService
                .getAllGoals(userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Goals fetched successfully", response));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<GoalResponse>>>
    getActiveGoals(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<GoalResponse> response = goalService
                .getActiveGoals(userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Active goals fetched successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> getGoalById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        GoalResponse response = goalService
                .getGoalById(id, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Goal fetched successfully", response));
    }

    @PatchMapping("/{id}/contribute")
    public ResponseEntity<ApiResponse<GoalResponse>> contributeToGoal(
            @PathVariable Long id,
            @RequestParam
            @NotNull(message = "Amount is required")
            @DecimalMin(value = "1.00",
                    message = "Amount must be at least 1")
            BigDecimal amount,
            @AuthenticationPrincipal UserDetails userDetails) {

        GoalResponse response = goalService.contributeToGoal(
                id, amount, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Contribution added successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody CreateGoalRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        GoalResponse response = goalService
                .updateGoal(id, request, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Goal updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        goalService.deleteGoal(id, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Goal deleted successfully"));
    }
}