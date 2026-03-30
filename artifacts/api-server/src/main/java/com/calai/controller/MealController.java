package com.calai.controller;

import com.calai.dto.meal.MealDto;
import com.calai.security.UserPrincipal;
import com.calai.service.MealService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/meals")
public class MealController {

    private final MealService mealService;

    public MealController(MealService mealService) {
        this.mealService = mealService;
    }

    @PostMapping("/scan")
    public ResponseEntity<Map<String, Object>> scanMeal(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "mealType", defaultValue = "LUNCH") String mealType,
            @RequestParam(value = "notes", required = false) String notes) throws IOException {
        return ResponseEntity.ok(mealService.scanMeal(principal.getUser(), image, mealType, notes));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMeals(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String date) {
        Page<MealDto> meals = mealService.getMeals(principal.getUser(), page, size, date);
        Map<String, Object> response = new HashMap<>();
        response.put("content", meals.getContent());
        response.put("totalElements", meals.getTotalElements());
        response.put("totalPages", meals.getTotalPages());
        response.put("page", page);
        response.put("size", size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MealDto> getMeal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(mealService.getMealById(principal.getUser(), id));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<MealDto> getMealStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(mealService.getMealById(principal.getUser(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MealDto> updateMeal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(mealService.updateMeal(principal.getUser(), id, updates));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        mealService.deleteMeal(principal.getUser(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/log")
    public ResponseEntity<MealDto> logFood(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(mealService.logFood(principal.getUser(), body));
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<MealDto> retryAnalysis(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) throws IOException {
        return ResponseEntity.ok(mealService.retryAnalysis(principal.getUser(), id));
    }
}
