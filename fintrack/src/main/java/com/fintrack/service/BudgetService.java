package com.fintrack.service;

import com.fintrack.dto.request.CreateBudgetRequest;
import com.fintrack.dto.response.BudgetResponse;
import com.fintrack.exception.BadRequestException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.model.Budget;
import com.fintrack.model.Category;
import com.fintrack.model.User;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository,
                         UserRepository userRepository,
                         CategoryRepository categoryRepository,
                         TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    // ─── CREATE BUDGET ───────────────────────────────────────────────

    @Transactional
    public BudgetResponse createBudget(
            CreateBudgetRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        // Rule 1 — end date must be after start date
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new BadRequestException(
                    "End date must be after start date");
        }

        // Rule 2 — resolve category if provided
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository
                    .findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: "
                                    + request.getCategoryId()));
        }

        // Rule 3 — check for duplicate budget
        if (request.getCategoryId() != null) {
            boolean exists = budgetRepository
                    .findByUserIdAndCategoryIdAndPeriodAndStartDate(
                            user.getId(),
                            request.getCategoryId(),
                            request.getPeriod(),
                            request.getStartDate())
                    .isPresent();
            if (exists) {
                throw new BadRequestException(
                        "A budget already exists for this category "
                                + "and period");
            }
        }

        // Rule 4 — build and save budget
        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .limitAmount(request.getLimitAmount())
                .period(request.getPeriod())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .rolloverEnabled(request.getRolloverEnabled() != null
                        ? request.getRolloverEnabled() : false)
                .build();

        Budget saved = budgetRepository.save(budget);

        return mapToResponse(saved, user.getId());
    }

    // ─── GET ALL BUDGETS ─────────────────────────────────────────────

    @Transactional
    public List<BudgetResponse> getAllBudgets(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        return budgetRepository
                .findByUserIdAndIsActiveTrue(user.getId())
                .stream()
                .map(budget -> mapToResponse(budget, user.getId()))
                .collect(Collectors.toList());
    }

    // ─── GET SINGLE BUDGET ───────────────────────────────────────────

    @Transactional
    public BudgetResponse getBudgetById(Long budgetId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        Budget budget = budgetRepository
                .findByIdAndUserId(budgetId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Budget not found with id: " + budgetId));

        return mapToResponse(budget, user.getId());
    }

    // ─── UPDATE BUDGET ───────────────────────────────────────────────

    @Transactional
    public BudgetResponse updateBudget(
            Long budgetId,
            CreateBudgetRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        Budget budget = budgetRepository
                .findByIdAndUserId(budgetId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Budget not found with id: " + budgetId));

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new BadRequestException(
                    "End date must be after start date");
        }

        budget.setLimitAmount(request.getLimitAmount());
        budget.setPeriod(request.getPeriod());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setRolloverEnabled(
                request.getRolloverEnabled() != null
                        ? request.getRolloverEnabled() : false);

        Budget updated = budgetRepository.save(budget);

        return mapToResponse(updated, user.getId());
    }

    // ─── DELETE BUDGET ───────────────────────────────────────────────

    @Transactional
    public void deleteBudget(Long budgetId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        Budget budget = budgetRepository
                .findByIdAndUserId(budgetId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Budget not found with id: " + budgetId));

        budgetRepository.delete(budget);
    }

    // ─── PRIVATE HELPER — MAP TO RESPONSE ───────────────────────────

    @Transactional
    private BudgetResponse mapToResponse(Budget budget, Long userId) {

        // Calculate how much was spent in this budget's period
        BigDecimal spentAmount;

        if (budget.getCategory() != null) {
            // Category budget — only sum transactions
            // for this specific category
            spentAmount = transactionRepository
                    .sumByUserIdAndTypeAndDateRange(
                            userId, "EXPENSE",
                            budget.getStartDate(),
                            budget.getEndDate());

            // We need spent amount for this category specifically
            // so we use a filtered sum
            spentAmount = getSpentForCategory(
                    userId,
                    budget.getCategory().getId(),
                    budget.getStartDate(),
                    budget.getEndDate());
        } else {
            // Overall budget — sum all expenses in period
            spentAmount = transactionRepository
                    .sumByUserIdAndTypeAndDateRange(
                            userId, "EXPENSE",
                            budget.getStartDate(),
                            budget.getEndDate());
        }

        // Protect against null from empty result
        if (spentAmount == null) spentAmount = BigDecimal.ZERO;

        BigDecimal remaining = budget.getLimitAmount()
                .subtract(spentAmount);

        // Calculate percentage — round to 2 decimal places
        double percentage = spentAmount
                .divide(budget.getLimitAmount(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();

        // Determine status based on percentage
        String status = calculateStatus(percentage);

        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategory() != null
                        ? budget.getCategory().getId() : null)
                .categoryName(budget.getCategory() != null
                        ? budget.getCategory().getName() : "Overall")
                .limitAmount(budget.getLimitAmount())
                .spentAmount(spentAmount)
                .remainingAmount(remaining)
                .usagePercentage(percentage)
                .status(status)
                .period(budget.getPeriod())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .rolloverEnabled(budget.getRolloverEnabled())
                .isActive(budget.getIsActive())
                .createdAt(budget.getCreatedAt())
                .build();
    }

    private BigDecimal getSpentForCategory(
            Long userId, Long categoryId,
            LocalDate start, LocalDate end) {

        return transactionRepository
                .findByUserIdAndCategoryId(userId, categoryId)
                .stream()
                .filter(t -> t.getType().equals("EXPENSE"))
                .filter(t -> !t.getTransactionDate().isBefore(start)
                        && !t.getTransactionDate().isAfter(end))
                .map(t -> t.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String calculateStatus(double percentage) {
        if (percentage >= 100) return "EXCEEDED";
        if (percentage >= 80) return "WARNING";
        return "ON_TRACK";
    }
}