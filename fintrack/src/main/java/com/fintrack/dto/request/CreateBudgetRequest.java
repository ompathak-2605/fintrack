package com.fintrack.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateBudgetRequest {

    private Long categoryId;

    @NotNull(message = "Limit amount is required")
    @DecimalMin(value = "1.00",
            message = "Budget limit must be at least 1")
    private BigDecimal limitAmount;

    @NotBlank(message = "Period is required")
    @Pattern(regexp = "DAILY|WEEKLY|MONTHLY",
            message = "Period must be DAILY, WEEKLY or MONTHLY")
    private String period;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private Boolean rolloverEnabled = false;
}