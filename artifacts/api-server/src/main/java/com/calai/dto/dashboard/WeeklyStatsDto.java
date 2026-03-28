package com.calai.dto.dashboard;

import java.util.List;

public class WeeklyStatsDto {
    private List<ChartPoint> days;
    private int averageCalories;
    private long totalMeals;

    public WeeklyStatsDto(List<ChartPoint> days, int averageCalories, long totalMeals) {
        this.days = days;
        this.averageCalories = averageCalories;
        this.totalMeals = totalMeals;
    }

    public List<ChartPoint> getDays() { return days; }
    public int getAverageCalories() { return averageCalories; }
    public long getTotalMeals() { return totalMeals; }

    public static class ChartPoint {
        private String date;
        private int calories;
        private double protein;
        private double carbs;
        private double fats;

        public ChartPoint(String date, int calories, double protein, double carbs, double fats) {
            this.date = date; this.calories = calories;
            this.protein = protein; this.carbs = carbs; this.fats = fats;
        }

        public String getDate() { return date; }
        public int getCalories() { return calories; }
        public double getProtein() { return protein; }
        public double getCarbs() { return carbs; }
        public double getFats() { return fats; }
    }
}
