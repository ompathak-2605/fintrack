package com.fintrack.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AddTransactionRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Type is required")
    @Pattern(regexp = "EXPENSE|INCOME",
            message = "Type must be either EXPENSE or INCOME")
    private String type;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    @Size(max = 100, message = "Merchant name cannot exceed 100 characters")
    private String merchant;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    @Pattern(regexp = "CASH|UPI|CARD|NETBANKING",
            message = "Payment method must be CASH, UPI, CARD or NETBANKING")
    private String paymentMethod;

    @Pattern(regexp = "NEED|WANT",
            message = "Necessity type must be NEED or WANT")
    private String necessityType;

    private Boolean isRecurring = false;

    @Pattern(regexp = "DAILY|WEEKLY|MONTHLY",
            message = "Recurrence period must be DAILY, WEEKLY or MONTHLY")
    private String recurrencePeriod;
}