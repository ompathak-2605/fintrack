package com.fintrack.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateGoalRequest {

    @NotBlank(message = "Goal name is required")
    @Size(min = 2, max = 150,
            message = "Goal name must be between 2 and 150 characters")
    private String name;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "1.00",
            message = "Target amount must be at least 1")
    private BigDecimal targetAmount;

    @NotNull(message = "Deadline is required")
    @Future(message = "Deadline must be a future date")
    private LocalDate deadline;

    @Size(max = 255,
            message = "Description cannot exceed 255 characters")
    private String description;
}