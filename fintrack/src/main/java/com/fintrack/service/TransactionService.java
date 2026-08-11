package com.fintrack.service;

import com.fintrack.dto.request.AddTransactionRequest;
import com.fintrack.dto.response.SummaryResponse;
import com.fintrack.dto.response.TransactionResponse;
import com.fintrack.exception.BadRequestException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.exception.UnauthorizedException;
import com.fintrack.model.Category;
import com.fintrack.model.Transaction;
import com.fintrack.model.User;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              UserRepository userRepository,
                              CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    // ─── ADD TRANSACTION ────────────────────────────────────────────

    @Transactional
    public TransactionResponse addTransaction(
            AddTransactionRequest request, String email) {

        // Rule 1 — find the logged-in user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        // Rule 2 — find and validate the category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: "
                                + request.getCategoryId()));

        // Rule 3 — if category has a user, it must belong to THIS user
        if (category.getUser() != null &&
                !category.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException(
                    "You do not have access to this category");
        }

        // Rule 4 — if recurring, recurrence period must be provided
        if (Boolean.TRUE.equals(request.getIsRecurring())
                && request.getRecurrencePeriod() == null) {
            throw new BadRequestException(
                    "Recurrence period is required for recurring transactions");
        }

        // Rule 5 — build and save the transaction
        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .type(request.getType())
                .amount(request.getAmount())
                .description(request.getDescription())
                .merchant(request.getMerchant())
                .transactionDate(request.getTransactionDate())
                .paymentMethod(request.getPaymentMethod())
                .necessityType(request.getNecessityType())
                .isRecurring(request.getIsRecurring() != null
                        ? request.getIsRecurring() : false)
                .recurrencePeriod(request.getRecurrencePeriod())
                .build();

        Transaction saved = transactionRepository.save(transaction);

        return mapToResponse(saved);
    }

    // ─── GET ALL TRANSACTIONS ────────────────────────────────────────

    public List<TransactionResponse> getAllTransactions(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        return transactionRepository
                .findByUserIdOrderByTransactionDateDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── GET SINGLE TRANSACTION ──────────────────────────────────────

    public TransactionResponse getTransactionById(
            Long transactionId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        Transaction transaction = transactionRepository
                .findByIdAndUserId(transactionId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found with id: " + transactionId));

        return mapToResponse(transaction);
    }

    // ─── UPDATE TRANSACTION ──────────────────────────────────────────

    @Transactional
    public TransactionResponse updateTransaction(
            Long transactionId,
            AddTransactionRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        // Ownership check — only the owner can update
        Transaction transaction = transactionRepository
                .findByIdAndUserId(transactionId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found with id: " + transactionId));

        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: "
                                + request.getCategoryId()));

        // Update all fields
        transaction.setCategory(category);
        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setMerchant(request.getMerchant());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setNecessityType(request.getNecessityType());
        transaction.setIsRecurring(request.getIsRecurring() != null
                ? request.getIsRecurring() : false);
        transaction.setRecurrencePeriod(request.getRecurrencePeriod());

        Transaction updated = transactionRepository.save(transaction);

        return mapToResponse(updated);
    }

    // ─── DELETE TRANSACTION ──────────────────────────────────────────

    @Transactional
    public void deleteTransaction(Long transactionId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        // Ownership check — only the owner can delete
        Transaction transaction = transactionRepository
                .findByIdAndUserId(transactionId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found with id: " + transactionId));

        transactionRepository.delete(transaction);
    }

    // ─── GET SUMMARY ─────────────────────────────────────────────────

    public SummaryResponse getSummary(
            String email, LocalDate start, LocalDate end) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        Long userId = user.getId();

        // Total income in period
        BigDecimal totalIncome = transactionRepository
                .sumByUserIdAndTypeAndDateRange(
                        userId, "INCOME", start, end);

        // Total expenses in period
        BigDecimal totalExpense = transactionRepository
                .sumByUserIdAndTypeAndDateRange(
                        userId, "EXPENSE", start, end);

        // Net balance
        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        // Category breakdown
        List<Object[]> breakdown = transactionRepository
                .getCategoryBreakdown(userId, start, end);

        Map<String, BigDecimal> categoryBreakdown = new HashMap<>();
        for (Object[] row : breakdown) {
            String categoryName = (String) row[0];
            BigDecimal total = (BigDecimal) row[1];
            categoryBreakdown.put(categoryName, total);
        }

        return SummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(netBalance)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }

    // ─── PRIVATE HELPER ──────────────────────────────────────────────

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .description(transaction.getDescription())
                .merchant(transaction.getMerchant())
                .transactionDate(transaction.getTransactionDate())
                .paymentMethod(transaction.getPaymentMethod())
                .necessityType(transaction.getNecessityType())
                .isRecurring(transaction.getIsRecurring())
                .recurrencePeriod(transaction.getRecurrencePeriod())
                .categoryId(transaction.getCategory().getId())
                .categoryName(transaction.getCategory().getName())
                .categoryIcon(transaction.getCategory().getIcon())
                .categoryColor(transaction.getCategory().getColor())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
}