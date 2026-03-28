package com.calai.service;

import com.calai.dto.dashboard.DailyStatsDto;
import com.calai.dto.dashboard.WeeklyStatsDto;
import com.calai.model.User;
import com.calai.repository.MealRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    private final MealRepository mealRepository;

    public DashboardService(MealRepository mealRepository) {
        this.mealRepository = mealRepository;
    }

    public DailyStatsDto getDailyStats(User user, String dateStr) {
        LocalDate date = (dateStr != null && !dateStr.isBlank()) ? LocalDate.parse(dateStr) : LocalDate.now();
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        int calories = mealRepository.sumCaloriesByUserAndDate(user, start, end);
        double protein = mealRepository.sumProteinByUserAndDate(user, start, end);
        double carbs = mealRepository.sumCarbsByUserAndDate(user, start, end);
        double fats = mealRepository.sumFatsByUserAndDate(user, start, end);
        long count = mealRepository.countByUserAndLoggedAtBetween(user, start, end);
        return new DailyStatsDto(date.toString(), calories, user.getCalorieGoal(), protein, carbs, fats, count);
    }

    public WeeklyStatsDto getWeeklyStats(User user) {
        LocalDate today = LocalDate.now();
        List<WeeklyStatsDto.ChartPoint> days = new ArrayList<>();
        long totalMeals = 0; int totalCal = 0;
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);
            int cal = mealRepository.sumCaloriesByUserAndDate(user, start, end);
            double protein = mealRepository.sumProteinByUserAndDate(user, start, end);
            double carbs = mealRepository.sumCarbsByUserAndDate(user, start, end);
            double fats = mealRepository.sumFatsByUserAndDate(user, start, end);
            long count = mealRepository.countByUserAndLoggedAtBetween(user, start, end);
            days.add(new WeeklyStatsDto.ChartPoint(date.toString(), cal, protein, carbs, fats));
            totalCal += cal; totalMeals += count;
        }
        int avgCal = days.isEmpty() ? 0 : totalCal / days.size();
        return new WeeklyStatsDto(days, avgCal, totalMeals);
    }

    public WeeklyStatsDto getMonthlyStats(User user) {
        LocalDate today = LocalDate.now();
        List<WeeklyStatsDto.ChartPoint> weeks = new ArrayList<>();
        long totalMeals = 0; int totalCal = 0;
        for (int w = 3; w >= 0; w--) {
            LocalDate weekEnd = today.minusWeeks(w);
            LocalDate weekStart = weekEnd.minusDays(6);
            LocalDateTime start = weekStart.atStartOfDay();
            LocalDateTime end = weekEnd.atTime(LocalTime.MAX);
            int cal = mealRepository.sumCaloriesByUserAndDate(user, start, end);
            double protein = mealRepository.sumProteinByUserAndDate(user, start, end);
            double carbs = mealRepository.sumCarbsByUserAndDate(user, start, end);
            double fats = mealRepository.sumFatsByUserAndDate(user, start, end);
            long count = mealRepository.countByUserAndLoggedAtBetween(user, start, end);
            weeks.add(new WeeklyStatsDto.ChartPoint("Week " + (4 - w), cal, protein, carbs, fats));
            totalCal += cal; totalMeals += count;
        }
        int avgCal = weeks.isEmpty() ? 0 : totalCal / weeks.size();
        return new WeeklyStatsDto(weeks, avgCal, totalMeals);
    }
}
