package com.fintrack.repository;

import com.fintrack.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByIsDefaultTrue();

    List<Category> findByUserId(Long userId);

    List<Category> findByIsDefaultTrueOrUserId(Boolean isDefault, Long userId);
}