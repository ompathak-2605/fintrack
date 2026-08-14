package com.fintrack.service;

import com.fintrack.dto.request.CreateGoalRequest;
import com.fintrack.dto.response.GoalResponse;
import com.fintrack.exception.BadRequestException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.model.Goal;
import com.fintrack.model.User;
import com.fintrack.repository.GoalRepository;
import com.fintrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public GoalService(GoalRepository goalRepository,
                       UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    // ─── CREATE GOAL ─────────────────────────────────────────────────

    @Transactional
    public GoalResponse createGoal(
            CreateGoalRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        Goal goal = Goal.builder()
                .user(user)
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .savedAmount(BigDecimal.ZERO)
                .deadline(request.getDeadline())
                .description(request.getDescription())
                .isAchieved(false)
                .build();

        Goal saved = goalRepository.save(goal);
        return mapToResponse(saved);
    }

    // ─── GET ALL GOALS ───────────────────────────────────────────────

    @Transactional
    public List<GoalResponse> getAllGoals(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        return goalRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── GET ACTIVE GOALS ────────────────────────────────────────────

    @Transactional
    public List<GoalResponse> getActiveGoals(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        return goalRepository
                .findByUserIdAndIsAchievedFalse(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── GET SINGLE GOAL ─────────────────────────────────────────────

    @Transactional
    public GoalResponse getGoalById(Long goalId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        Goal goal = goalRepository
                .findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Goal not found with id: " + goalId));

        return mapToResponse(goal);
    }

    // ─── CONTRIBUTE TO GOAL ──────────────────────────────────────────

    @Transactional
    public GoalResponse contributeToGoal(
            Long goalId, BigDecimal amount, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        Goal goal = goalRepository
                .findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Goal not found with id: " + goalId));

        // Rule 1 — cannot contribute to an already achieved goal
        if (Boolean.TRUE.equals(goal.getIsAchieved())) {
            throw new BadRequestException(
                    "This goal has already been achieved");
        }

        // Rule 2 — amount must be positive
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException(
                    "Contribution amount must be greater than zero");
        }

        // Rule 3 — add contribution to saved amount
        BigDecimal newSavedAmount = goal.getSavedAmount().add(amount);
        goal.setSavedAmount(newSavedAmount);

        // Rule 4 — auto-mark as achieved if target reached
        if (newSavedAmount.compareTo(goal.getTargetAmount()) >= 0) {
            goal.setIsAchieved(true);
        }

        Goal updated = goalRepository.save(goal);
        return mapToResponse(updated);
    }

    // ─── UPDATE GOAL ─────────────────────────────────────────────────

    @Transactional
    public GoalResponse updateGoal(
            Long goalId,
            CreateGoalRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        Goal goal = goalRepository
                .findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Goal not found with id: " + goalId));

        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setDeadline(request.getDeadline());
        goal.setDescription(request.getDescription());

        // Re-check if already achieved after target change
        if (goal.getSavedAmount()
                .compareTo(request.getTargetAmount()) >= 0) {
            goal.setIsAchieved(true);
        } else {
            goal.setIsAchieved(false);
        }

        Goal updated = goalRepository.save(goal);
        return mapToResponse(updated);
    }

    // ─── DELETE GOAL ─────────────────────────────────────────────────

    @Transactional
    public void deleteGoal(Long goalId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        Goal goal = goalRepository
                .findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Goal not found with id: " + goalId));

        goalRepository.delete(goal);
    }

    // ─── PRIVATE HELPER — MAP TO RESPONSE ───────────────────────────

    private GoalResponse mapToResponse(Goal goal) {

        LocalDate today = LocalDate.now();

        BigDecimal remaining = goal.getTargetAmount()
                .subtract(goal.getSavedAmount());

        // Protect against negative remaining
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO;
        }

        // Progress percentage
        double progressPercentage = goal.getSavedAmount()
                .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();

        // Cap at 100%
        if (progressPercentage > 100) progressPercentage = 100;

        // Days remaining until deadline
        long daysRemaining = ChronoUnit.DAYS.between(
                today, goal.getDeadline());

        // Suggested monthly saving
        BigDecimal suggestedMonthlySaving = BigDecimal.ZERO;

        if (!goal.getIsAchieved()
                && daysRemaining > 0
                && remaining.compareTo(BigDecimal.ZERO) > 0) {

            // Convert days to months
            double monthsLeft = daysRemaining / 30.44;

            if (monthsLeft > 0) {
                suggestedMonthlySaving = remaining.divide(
                        BigDecimal.valueOf(monthsLeft),
                        2, RoundingMode.CEILING);
            }
        }

        // Calculate status
        String status = calculateGoalStatus(
                goal, progressPercentage, daysRemaining);

        return GoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .description(goal.getDescription())
                .targetAmount(goal.getTargetAmount())
                .savedAmount(goal.getSavedAmount())
                .remainingAmount(remaining)
                .progressPercentage(progressPercentage)
                .suggestedMonthlySaving(suggestedMonthlySaving)
                .deadline(goal.getDeadline())
                .daysRemaining(daysRemaining)
                .isAchieved(goal.getIsAchieved())
                .status(status)
                .createdAt(goal.getCreatedAt())
                .build();
    }

    private String calculateGoalStatus(
            Goal goal,
            double progressPercentage,
            long daysRemaining) {

        if (Boolean.TRUE.equals(goal.getIsAchieved())) {
            return "ACHIEVED";
        }

        if (daysRemaining < 0) {
            return "OVERDUE";
        }

        // Calculate expected progress based on time elapsed
        long totalDays = ChronoUnit.DAYS.between(
                goal.getCreatedAt().toLocalDate(),
                goal.getDeadline());

        long daysElapsed = totalDays - daysRemaining;

        double expectedProgress = totalDays > 0
                ? (double) daysElapsed / totalDays * 100 : 0;

        // If actual progress is less than 80% of expected — at risk
        if (progressPercentage < expectedProgress * 0.8) {
            return "AT_RISK";
        }

        return "ON_TRACK";
    }
}