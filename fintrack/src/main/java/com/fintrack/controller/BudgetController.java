package com.fintrack.controller;

import com.fintrack.config.ApiResponse;
import com.fintrack.dto.request.CreateBudgetRequest;
import com.fintrack.dto.response.BudgetResponse;
import com.fintrack.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @Valid @RequestBody CreateBudgetRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        BudgetResponse response = budgetService
                .createBudget(request, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Budget created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>>
    getAllBudgets(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<BudgetResponse> response = budgetService
                .getAllBudgets(userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Budgets fetched successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudgetById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        BudgetResponse response = budgetService
                .getBudgetById(id, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Budget fetched successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody CreateBudgetRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        BudgetResponse response = budgetService
                .updateBudget(id, request, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Budget updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        budgetService.deleteBudget(id, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Budget deleted successfully"));
    }
}