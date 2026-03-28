package com.calai.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "meals", indexes = {
    @Index(name = "idx_meal_user_logged", columnList = "user_id, logged_at")
})
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

    public Meal() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public int getCalories() { return calories; }
    public void setCalories(int calories) { this.calories = calories; }
    public double getProtein() { return protein; }
    public void setProtein(double protein) { this.protein = protein; }
    public double getCarbs() { return carbs; }
    public void setCarbs(double carbs) { this.carbs = carbs; }
    public double getFats() { return fats; }
    public void setFats(double fats) { this.fats = fats; }
    public double getHealthScore() { return healthScore; }
    public void setHealthScore(double healthScore) { this.healthScore = healthScore; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    public AnalysisStatus getAnalysisStatus() { return analysisStatus; }
    public void setAnalysisStatus(AnalysisStatus analysisStatus) { this.analysisStatus = analysisStatus; }
    public MealType getMealType() { return mealType; }
    public void setMealType(MealType mealType) { this.mealType = mealType; }
    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getLoggedAt() { return loggedAt; }
    public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }
}
