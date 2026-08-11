package com.fintrack.config;

import com.fintrack.model.Category;
import com.fintrack.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log =
            LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;

    public DataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {

        if (categoryRepository.findByIsDefaultTrue().isEmpty()) {

            log.info("Loading default categories...");

            List<Category> defaults = List.of(
                    Category.builder().name("Food")
                            .icon("utensils").color("#FF6B6B")
                            .isDefault(true).build(),
                    Category.builder().name("Transport")
                            .icon("bus").color("#4ECDC4")
                            .isDefault(true).build(),
                    Category.builder().name("Stationery")
                            .icon("pencil").color("#45B7D1")
                            .isDefault(true).build(),
                    Category.builder().name("Entertainment")
                            .icon("film").color("#96CEB4")
                            .isDefault(true).build(),
                    Category.builder().name("Shopping")
                            .icon("shopping-bag").color("#FFEAA7")
                            .isDefault(true).build(),
                    Category.builder().name("Health")
                            .icon("heart").color("#DDA0DD")
                            .isDefault(true).build(),
                    Category.builder().name("Education")
                            .icon("book").color("#98D8C8")
                            .isDefault(true).build(),
                    Category.builder().name("Rent")
                            .icon("home").color("#F7DC6F")
                            .isDefault(true).build(),
                    Category.builder().name("Salary")
                            .icon("briefcase").color("#82E0AA")
                            .isDefault(true).build(),
                    Category.builder().name("Other")
                            .icon("circle").color("#BDC3C7")
                            .isDefault(true).build()
            );

            categoryRepository.saveAll(defaults);
            log.info("Default categories loaded successfully.");
        }
    }
}