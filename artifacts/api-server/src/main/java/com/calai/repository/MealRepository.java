package com.calai.repository;

import com.calai.model.Meal;
import com.calai.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MealRepository extends JpaRepository<Meal, Long> {

    Page<Meal> findByUserOrderByLoggedAtDesc(User user, Pageable pageable);

    List<Meal> findByUserAndLoggedAtBetweenOrderByLoggedAtDesc(
        User user, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(m.calories), 0) FROM Meal m WHERE m.user = :user " +
           "AND m.loggedAt >= :start AND m.loggedAt <= :end AND m.analysisStatus = 'COMPLETED'")
    int sumCaloriesByUserAndDate(@Param("user") User user,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(m.protein), 0) FROM Meal m WHERE m.user = :user " +
           "AND m.loggedAt >= :start AND m.loggedAt <= :end AND m.analysisStatus = 'COMPLETED'")
    double sumProteinByUserAndDate(@Param("user") User user,
                                    @Param("start") LocalDateTime start,
                                    @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(m.carbs), 0) FROM Meal m WHERE m.user = :user " +
           "AND m.loggedAt >= :start AND m.loggedAt <= :end AND m.analysisStatus = 'COMPLETED'")
    double sumCarbsByUserAndDate(@Param("user") User user,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(m.fats), 0) FROM Meal m WHERE m.user = :user " +
           "AND m.loggedAt >= :start AND m.loggedAt <= :end AND m.analysisStatus = 'COMPLETED'")
    double sumFatsByUserAndDate(@Param("user") User user,
                                 @Param("start") LocalDateTime start,
                                 @Param("end") LocalDateTime end);

    long countByUserAndLoggedAtBetween(User user, LocalDateTime start, LocalDateTime end);
}
