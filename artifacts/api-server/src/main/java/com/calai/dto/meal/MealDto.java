package com.calai.dto.meal;

import com.calai.model.Meal;
import java.time.LocalDateTime;

public class MealDto {
    private Long id;
    private String name;
    private String imageUrl;
    private int calories;
    private double protein;
    private double carbs;
    private double fats;
    private double healthScore;
    private double confidence;
    private String analysisStatus;
    private String mealType;
    private String ingredients;
    private String notes;
    private LocalDateTime loggedAt;

    public static MealDto from(Meal meal) {
        MealDto dto = new MealDto();
        dto.id = meal.getId();
        dto.name = meal.getName();
        dto.imageUrl = meal.getImageUrl();
        dto.calories = meal.getCalories();
        dto.protein = meal.getProtein();
        dto.carbs = meal.getCarbs();
        dto.fats = meal.getFats();
        dto.healthScore = meal.getHealthScore();
        dto.confidence = meal.getConfidence();
        dto.analysisStatus = meal.getAnalysisStatus() != null ? meal.getAnalysisStatus().name() : null;
        dto.mealType = meal.getMealType() != null ? meal.getMealType().name() : null;
        dto.ingredients = meal.getIngredients();
        dto.notes = meal.getNotes();
        dto.loggedAt = meal.getLoggedAt();
        return dto;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getImageUrl() { return imageUrl; }
    public int getCalories() { return calories; }
    public double getProtein() { return protein; }
    public double getCarbs() { return carbs; }
    public double getFats() { return fats; }
    public double getHealthScore() { return healthScore; }
    public double getConfidence() { return confidence; }
    public String getAnalysisStatus() { return analysisStatus; }
    public String getMealType() { return mealType; }
    public String getIngredients() { return ingredients; }
    public String getNotes() { return notes; }
    public LocalDateTime getLoggedAt() { return loggedAt; }
}
