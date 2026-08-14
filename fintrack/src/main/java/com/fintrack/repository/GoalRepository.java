package com.fintrack.repository;

import com.fintrack.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUserId(Long userId);

    List<Goal> findByUserIdAndIsAchievedFalse(Long userId);

    List<Goal> findByUserIdAndIsAchievedTrue(Long userId);

    Optional<Goal> findByIdAndUserId(Long id, Long userId);
}