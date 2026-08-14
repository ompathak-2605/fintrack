package com.fintrack.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double usagePercentage;
    private String status;
    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean rolloverEnabled;
    private Boolean isActive;
    private LocalDateTime createdAt;
}