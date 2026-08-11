package com.fintrack.controller;

import com.fintrack.config.ApiResponse;
import com.fintrack.dto.request.AddTransactionRequest;
import com.fintrack.dto.response.SummaryResponse;
import com.fintrack.dto.response.TransactionResponse;
import com.fintrack.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // ─── ADD TRANSACTION ─────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> addTransaction(
            @Valid @RequestBody AddTransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        TransactionResponse response = transactionService
                .addTransaction(request, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Transaction added successfully", response));
    }

    // ─── GET ALL TRANSACTIONS ─────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionResponse>>>
    getAllTransactions(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<TransactionResponse> response = transactionService
                .getAllTransactions(userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Transactions fetched successfully", response));
    }

    // ─── GET SINGLE TRANSACTION ───────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>>
    getTransactionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        TransactionResponse response = transactionService
                .getTransactionById(id, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Transaction fetched successfully", response));
    }

    // ─── UPDATE TRANSACTION ───────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>>
    updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody AddTransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        TransactionResponse response = transactionService
                .updateTransaction(id, request, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Transaction updated successfully", response));
    }

    // ─── DELETE TRANSACTION ───────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        transactionService.deleteTransaction(
                id, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Transaction deleted successfully"));
    }

    // ─── GET SUMMARY ──────────────────────────────────────────────────

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<SummaryResponse>> getSummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate end) {

        SummaryResponse response = transactionService
                .getSummary(userDetails.getUsername(), start, end);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(
                        "Summary fetched successfully", response));
    }
}