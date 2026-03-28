package com.calai.service;

import com.calai.dto.meal.MealDto;
import com.calai.model.Meal;
import com.calai.model.User;
import com.calai.repository.MealRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
public class MealService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Value("${app.base-url:}")
    private String baseUrl;

    private final MealRepository mealRepository;
    private final AiAnalysisService aiAnalysisService;

    public MealService(MealRepository mealRepository, AiAnalysisService aiAnalysisService) {
        this.mealRepository = mealRepository;
        this.aiAnalysisService = aiAnalysisService;
    }

    public Map<String, Object> scanMeal(User user, MultipartFile image, String mealType, String notes) throws IOException {
        String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
        Path dir = Paths.get(uploadDir);
        if (!dir.toFile().exists()) dir.toFile().mkdirs();
        Path filePath = dir.resolve(filename);
        Files.write(filePath, image.getBytes());

        Meal meal = new Meal();
        meal.setUser(user);
        meal.setName("Analyzing...");
        meal.setAnalysisStatus(Meal.AnalysisStatus.PENDING);
        meal.setMealType(parseMealType(mealType));
        if (notes != null && !notes.isBlank()) meal.setNotes(notes);
        meal.setImageUrl("/uploads/" + filename);
        mealRepository.save(meal);

        String base64 = Base64.getEncoder().encodeToString(image.getBytes());
        String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";
        aiAnalysisService.analyzeMealAsync(meal.getId(), base64, mimeType);

        return Map.of("meal", MealDto.from(meal), "message", "Meal uploaded and being analyzed");
    }

    public Page<MealDto> getMeals(User user, int page, int size, String date) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("loggedAt").descending());
        if (date != null && !date.isBlank()) {
            LocalDate ld = LocalDate.parse(date);
            LocalDateTime start = ld.atStartOfDay();
            LocalDateTime end = ld.atTime(LocalTime.MAX);
            return mealRepository.findByUserAndLoggedAtBetweenOrderByLoggedAtDesc(user, start, end)
                    .stream().map(MealDto::from)
                    .collect(java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toList(),
                        list -> new org.springframework.data.domain.PageImpl<>(list, pageable, list.size())
                    ));
        }
        return mealRepository.findByUserOrderByLoggedAtDesc(user, pageable).map(MealDto::from);
    }

    public MealDto getMealById(User user, Long id) {
        Meal meal = mealRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meal not found"));
        if (!meal.getUser().getId().equals(user.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return MealDto.from(meal);
    }

    public MealDto updateMeal(User user, Long id, Map<String, Object> updates) {
        Meal meal = mealRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!meal.getUser().getId().equals(user.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        if (updates.containsKey("name")) meal.setName((String) updates.get("name"));
        if (updates.containsKey("notes")) meal.setNotes((String) updates.get("notes"));
        if (updates.containsKey("mealType")) meal.setMealType(parseMealType((String) updates.get("mealType")));
        return MealDto.from(mealRepository.save(meal));
    }

    public void deleteMeal(User user, Long id) {
        Meal meal = mealRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!meal.getUser().getId().equals(user.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        if (meal.getImageUrl() != null) {
            String filename = meal.getImageUrl().replace("/uploads/", "");
            new File(uploadDir + File.separator + filename).delete();
        }
        mealRepository.delete(meal);
    }

    public MealDto logFood(User user, Map<String, Object> body) {
        Meal meal = new Meal();
        meal.setUser(user);
        meal.setName((String) body.getOrDefault("name", "Food"));
        meal.setCalories(toInt(body.get("calories")));
        meal.setProtein(toDouble(body.get("protein")));
        meal.setCarbs(toDouble(body.get("carbs")));
        meal.setFats(toDouble(body.get("fats")));
        meal.setHealthScore(6);
        meal.setConfidence(100);
        meal.setAnalysisStatus(Meal.AnalysisStatus.COMPLETED);
        if (body.containsKey("mealType")) meal.setMealType(parseMealType((String) body.get("mealType")));
        return MealDto.from(mealRepository.save(meal));
    }

    private Meal.MealType parseMealType(String type) {
        try { return Meal.MealType.valueOf(type.toUpperCase()); }
        catch (Exception e) { return Meal.MealType.LUNCH; }
    }

    private int toInt(Object o) {
        if (o instanceof Integer) return (Integer) o;
        if (o instanceof Number) return ((Number) o).intValue();
        try { return Integer.parseInt(String.valueOf(o)); } catch (Exception e) { return 0; }
    }

    private double toDouble(Object o) {
        if (o instanceof Double) return (Double) o;
        if (o instanceof Number) return ((Number) o).doubleValue();
        try { return Double.parseDouble(String.valueOf(o)); } catch (Exception e) { return 0.0; }
    }
}
