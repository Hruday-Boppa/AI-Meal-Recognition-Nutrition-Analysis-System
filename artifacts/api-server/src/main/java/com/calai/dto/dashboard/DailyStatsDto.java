package com.calai.dto.dashboard;

public class DailyStatsDto {
    private String date;
    private int totalCalories;
    private int calorieGoal;
    private double totalProtein;
    private double totalCarbs;
    private double totalFats;
    private long mealsCount;
    private int remainingCalories;

    public DailyStatsDto(String date, int totalCalories, int calorieGoal,
                          double totalProtein, double totalCarbs, double totalFats, long mealsCount) {
        this.date = date;
        this.totalCalories = totalCalories;
        this.calorieGoal = calorieGoal;
        this.totalProtein = Math.round(totalProtein * 10.0) / 10.0;
        this.totalCarbs = Math.round(totalCarbs * 10.0) / 10.0;
        this.totalFats = Math.round(totalFats * 10.0) / 10.0;
        this.mealsCount = mealsCount;
        this.remainingCalories = calorieGoal - totalCalories;
    }

    public String getDate() { return date; }
    public int getTotalCalories() { return totalCalories; }
    public int getCalorieGoal() { return calorieGoal; }
    public double getTotalProtein() { return totalProtein; }
    public double getTotalCarbs() { return totalCarbs; }
    public double getTotalFats() { return totalFats; }
    public long getMealsCount() { return mealsCount; }
    public int getRemainingCalories() { return remainingCalories; }
}
