package com.fintrack.controller;

import com.fintrack.config.ApiResponse;
import com.fintrack.model.Category;
import com.fintrack.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.fintrack.repository.UserRepository;
import com.fintrack.model.User;
import com.fintrack.exception.ResourceNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryController(CategoryRepository categoryRepository,
                              UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getCategories(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository
                .findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        List<Category> categories = categoryRepository
                .findByIsDefaultTrueOrUserId(true, user.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Categories fetched", categories));
    }
}