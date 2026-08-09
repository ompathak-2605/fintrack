package com.fintrack.model;

import jakarta.persistence.*;
import  lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name= "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name= "name", nullable = false, length = 100)
    private String name;

    @Column(name= "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name= "passoword_hash", nullable = false)
    private String passwordHash;

    @Column(name= "persona_type", length = 50)
    private String personaType;

    @Column(name = "currency", length = 50)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "monthly_income", precision = 12, scale = 2)
    private BigDecimal monthlyIncome;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive =  true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
