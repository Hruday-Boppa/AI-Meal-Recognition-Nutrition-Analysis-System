package com.calai.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "meals", indexes = {
    @Index(name = "idx_meal_user_logged", columnList = "user_id, logged_at")
})
@Data
@NoArgsConstructor
public class Meal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name = "Scanned Meal";

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    private int calories;
    private double protein;
    private double carbs;
    private double fats;

    @Column(name = "health_score")
    private double healthScore;

    private double confidence;

    @Column(name = "analysis_status")
    @Enumerated(EnumType.STRING)
    private AnalysisStatus analysisStatus = AnalysisStatus.PENDING;

    @Column(name = "meal_type")
    @Enumerated(EnumType.STRING)
    private MealType mealType = MealType.LUNCH;

    @Column(length = 2000)
    private String ingredients;

    private String notes;

    @Column(name = "logged_at")
    private LocalDateTime loggedAt = LocalDateTime.now();

    public enum AnalysisStatus { PENDING, PROCESSING, COMPLETED, FAILED }
    public enum MealType { BREAKFAST, LUNCH, DINNER, SNACK }
}
