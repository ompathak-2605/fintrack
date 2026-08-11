package com.fintrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private BigDecimal amount;
    private String type;
    private String description;
    private String merchant;
    private LocalDate transactionDate;
    private String paymentMethod;
    private String necessityType;
    private Boolean isRecurring;
    private String recurrencePeriod;

    // Category info — readable name instead of just ID
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}