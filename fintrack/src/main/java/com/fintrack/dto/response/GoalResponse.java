package com.fintrack.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal targetAmount;
    private BigDecimal savedAmount;
    private BigDecimal remainingAmount;
    private Double progressPercentage;
    private BigDecimal suggestedMonthlySaving;
    private LocalDate deadline;
    private Long daysRemaining;
    private Boolean isAchieved;
    private String status;
    private LocalDateTime createdAt;
}