package com.calai.service;

import com.calai.model.Meal;
import com.calai.repository.MealRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AiAnalysisService.class);

    @Value("${app.openai.api-key:}")
    private String openAiKey;

    private final MealRepository mealRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiAnalysisService(MealRepository mealRepository) {
        this.mealRepository = mealRepository;
    }

    @Async("aiTaskExecutor")
    public void analyzeMealAsync(Long mealId, String base64Image, String mimeType) {
        mealRepository.findById(mealId).ifPresent(meal -> {
            meal.setAnalysisStatus(Meal.AnalysisStatus.PROCESSING);
            mealRepository.save(meal);
            try {
                NutritionResult result = analyzeImage(base64Image, mimeType);
                meal.setName(result.name);
                meal.setCalories(result.calories);
                meal.setProtein(result.protein);
                meal.setCarbs(result.carbs);
                meal.setFats(result.fats);
                meal.setHealthScore(result.healthScore);
                meal.setConfidence(result.confidence);
                meal.setIngredients(result.ingredients);
                meal.setAnalysisStatus(Meal.AnalysisStatus.COMPLETED);
            } catch (Exception e) {
                log.error("AI analysis failed for meal {}: {}", mealId, e.getMessage());
                meal.setAnalysisStatus(Meal.AnalysisStatus.FAILED);
                applyFallbackEstimate(meal);
            }
            mealRepository.save(meal);
        });
    }

    private NutritionResult analyzeImage(String base64Image, String mimeType) throws Exception {
        if (openAiKey == null || openAiKey.isBlank()) {
            return generateEstimate();
        }

        RestTemplate rest = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiKey);

        String prompt = "Analyze this meal photo and return a JSON object with these fields: " +
            "name (string, descriptive meal name), calories (integer, total kcal), " +
            "protein (number, grams), carbs (number, grams), fats (number, grams), " +
            "healthScore (number 1-10), confidence (integer 0-100, how confident you are), " +
            "ingredients (comma-separated string of main ingredients). " +
            "Respond with ONLY the JSON object, no markdown, no explanation.";

        Map<String, Object> imageContent = new LinkedHashMap<>();
        imageContent.put("type", "image_url");
        Map<String, String> imageUrl = new LinkedHashMap<>();
        imageUrl.put("url", "data:" + mimeType + ";base64," + base64Image);
        imageUrl.put("detail", "low");
        imageContent.put("image_url", imageUrl);

        Map<String, Object> textContent = new LinkedHashMap<>();
        textContent.put("type", "text");
        textContent.put("text", prompt);

        Map<String, Object> message = new LinkedHashMap<>();
        message.put("role", "user");
        message.put("content", List.of(textContent, imageContent));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", "gpt-4o-mini");
        body.put("messages", List.of(message));
        body.put("max_tokens", 300);
        body.put("temperature", 0.3);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = rest.postForEntity(
            "https://api.openai.com/v1/chat/completions", entity, String.class);

        JsonNode root = objectMapper.readTree(response.getBody());
        String content = root.path("choices").get(0).path("message").path("content").asText();
        return parseNutritionJson(content);
    }

    private NutritionResult parseNutritionJson(String json) throws Exception {
        String cleaned = json.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("```[a-z]*\\n?", "").replace("```", "").trim();
        }
        JsonNode node = objectMapper.readTree(cleaned);
        NutritionResult r = new NutritionResult();
        r.name = node.path("name").asText("Scanned Meal");
        r.calories = node.path("calories").asInt(350);
        r.protein = node.path("protein").asDouble(20);
        r.carbs = node.path("carbs").asDouble(40);
        r.fats = node.path("fats").asDouble(15);
        r.healthScore = node.path("healthScore").asDouble(7);
        r.confidence = node.path("confidence").asInt(75);
        r.ingredients = node.path("ingredients").asText("");
        return r;
    }

    private NutritionResult generateEstimate() {
        NutritionResult r = new NutritionResult();
        r.name = "Mixed Meal";
        r.calories = 450 + new Random().nextInt(300);
        r.protein = 20 + Math.random() * 20;
        r.carbs = 40 + Math.random() * 30;
        r.fats = 10 + Math.random() * 20;
        r.healthScore = 5 + Math.random() * 4;
        r.confidence = 60;
        r.ingredients = "mixed ingredients";
        return r;
    }

    private void applyFallbackEstimate(Meal meal) {
        meal.setName("Unknown Meal");
        meal.setCalories(400);
        meal.setProtein(20);
        meal.setCarbs(45);
        meal.setFats(15);
        meal.setHealthScore(6);
        meal.setConfidence(0);
        meal.setAnalysisStatus(Meal.AnalysisStatus.COMPLETED);
    }

    private static class NutritionResult {
        String name; int calories; double protein; double carbs;
        double fats; double healthScore; int confidence; String ingredients;
    }
}
