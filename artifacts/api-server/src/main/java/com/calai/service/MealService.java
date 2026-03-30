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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.calai.util.ImageUtils;
import com.calai.service.storage.StorageService;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Base64;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class MealService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MealService.class);

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private final MealRepository mealRepository;
    private final AiAnalysisService aiAnalysisService;
    private final StorageService storageService;

    public MealService(MealRepository mealRepository, AiAnalysisService aiAnalysisService, StorageService storageService) {
        this.mealRepository = mealRepository;
        this.aiAnalysisService = aiAnalysisService;
        this.storageService = storageService;
    }

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/jpg");

    public Map<String, Object> scanMeal(User user, MultipartFile image, String mealType, String notes) throws IOException {
        // --- Validate file type ---
        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST,
                "Only JPG and PNG images are allowed");
        }
        contentType = contentType.toLowerCase();

        // --- Compress & resize ---
        byte[] rawBytes = image.getBytes();
        byte[] imageBytes;
        try {
            imageBytes = ImageUtils.compressAndResize(rawBytes, contentType);
        } catch (IOException e) {
            log.warn("Image compression failed, using original: {}", e.getMessage());
            imageBytes = rawBytes;
        }

        // --- Save via StorageService ---
        String filename = storageService.store(imageBytes, String.valueOf(user.getId()), "meal.jpg");

        // URL points to our secure /api/images endpoint
        String imageUrl = baseUrl + "/api/images/" + user.getId() + "/" + filename;

        Meal meal = new Meal();
        meal.setUser(user);
        meal.setName("Analyzing...");
        meal.setAnalysisStatus(Meal.AnalysisStatus.PENDING);
        meal.setMealType(parseMealType(mealType));
        if (notes != null && !notes.isBlank()) meal.setNotes(notes);
        meal.setImageUrl(imageUrl);
        mealRepository.save(meal);

        String base64 = Base64.getEncoder().encodeToString(imageBytes);
        log.info("Triggering async AI analysis for meal ID: {}", meal.getId());
        aiAnalysisService.analyzeMealAsync(meal.getId(), base64, "image/jpeg");

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
        
        if (updates.containsKey("calories")) {
            Object val = updates.get("calories");
            if (val instanceof Number) meal.setCalories(((Number) val).intValue());
        }
        if (updates.containsKey("protein")) {
            Object val = updates.get("protein");
            if (val instanceof Number) meal.setProtein(((Number) val).doubleValue());
        }
        if (updates.containsKey("carbs")) {
            Object val = updates.get("carbs");
            if (val instanceof Number) meal.setCarbs(((Number) val).doubleValue());
        }
        if (updates.containsKey("fats")) {
            Object val = updates.get("fats");
            if (val instanceof Number) meal.setFats(((Number) val).doubleValue());
        }
        
        return MealDto.from(mealRepository.save(meal));
    }

    public void deleteMeal(User user, Long id) {
        Meal meal = mealRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!meal.getUser().getId().equals(user.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
            
        // Delete via StorageService
        if (meal.getImageUrl() != null) {
            String filename = meal.getImageUrl().substring(meal.getImageUrl().lastIndexOf('/') + 1);
            storageService.delete(String.valueOf(user.getId()), filename);
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

    public MealDto retryAnalysis(User user, Long id) throws IOException {
        Meal meal = mealRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meal not found"));
        
        if (!meal.getUser().getId().equals(user.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);

        if (meal.getImageUrl() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No image found for this meal");

        // Extract filename from URL (e.g., .../api/images/1/uuid.jpg)
        String url = meal.getImageUrl();
        String filename = url.substring(url.lastIndexOf("/") + 1);
        
        // Read file bytes
        org.springframework.core.io.Resource resource = storageService.loadAsResource(String.valueOf(user.getId()), filename);
        byte[] imageBytes = resource.getInputStream().readAllBytes();
        String base64 = java.util.Base64.getEncoder().encodeToString(imageBytes);

        // Reset state
        meal.setName("Analyzing...");
        meal.setAnalysisStatus(Meal.AnalysisStatus.PENDING);
        mealRepository.save(meal);

        log.info("Retry: Triggering async AI analysis for meal ID: {}", meal.getId());
        aiAnalysisService.analyzeMealAsync(meal.getId(), base64, "image/jpeg");

        return MealDto.from(meal);
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
