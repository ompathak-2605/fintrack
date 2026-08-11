package com.fintrack.repository;

import com.fintrack.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    // Get all transactions for a user, newest first
    List<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId);

    // Get transactions for a user within a date range
    List<Transaction> findByUserIdAndTransactionDateBetween(
            Long userId, LocalDate start, LocalDate end);

    // Get transactions by type (EXPENSE or INCOME)
    List<Transaction> findByUserIdAndType(Long userId, String type);

    // Get transactions by category
    List<Transaction> findByUserIdAndCategoryId(
            Long userId, Long categoryId);

    // Find a single transaction by id and userId
    // (security check — user can only see their own)
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    // Get total amount for a type in a date range
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.user.id = :userId " +
            "AND t.type = :type " +
            "AND t.transactionDate BETWEEN :start AND :end")
    BigDecimal sumByUserIdAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") String type,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    // Get spending breakdown by category
    @Query("SELECT t.category.name, COALESCE(SUM(t.amount), 0) " +
            "FROM Transaction t " +
            "WHERE t.user.id = :userId " +
            "AND t.type = 'EXPENSE' " +
            "AND t.transactionDate BETWEEN :start AND :end " +
            "GROUP BY t.category.name " +
            "ORDER BY SUM(t.amount) DESC")
    List<Object[]> getCategoryBreakdown(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);
}