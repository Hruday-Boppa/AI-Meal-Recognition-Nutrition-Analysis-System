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

    @Value("${app.ollama.model:qwen2.5vl:7b}")
    private String ollamaModel;

    @Value("${app.ollama.api-url:http://localhost:11434/api/generate}")
    private String ollamaApiUrl;

    private final MealRepository mealRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiAnalysisService(MealRepository mealRepository) {
        this.mealRepository = mealRepository;
    }

    @Async("aiTaskExecutor")
    public void analyzeMealAsync(Long mealId, String base64Image, String mimeType) {
        if (mealId == null) {
            log.error("Received null mealId for analysis");
            return;
        }
        log.info("Starting background analysis for meal ID: {}", mealId);

        // --- Handle transaction race condition ---
        // Give the main thread a tiny moment to commit the transaction
        Meal meal = null;
        for (int i = 0; i < 5; i++) {
            Optional<Meal> optionalMeal = mealRepository.findById(mealId);
            if (optionalMeal.isPresent()) {
                meal = optionalMeal.get();
                break;
            }
            try {
                Thread.sleep(200); // 200ms * 5 = 1 second total wait
            } catch (InterruptedException ignored) {}
        }

        if (meal == null) {
            log.error("Could not find meal with ID {} after 1s wait. Transaction might have failed.", mealId);
            return;
        }

        final Meal finalMeal = meal;
        finalMeal.setAnalysisStatus(Meal.AnalysisStatus.PROCESSING);
        mealRepository.save(finalMeal);

        final int MAX_ATTEMPTS = 3;
        Exception lastException = null;
        NutritionResult result = null;

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                result = analyzeImage(base64Image, mimeType);
                break; // success — stop retrying
            } catch (Exception e) {
                lastException = e;
                String msg = e.getMessage().toLowerCase();
                
                // If Rate Limited (429), we MUST wait longer
                if (msg.contains("429") || msg.contains("resource_exhausted")) {
                    log.warn("Rate limited (429) for meal {}. Waiting 15s to retry (Attempt {}/{})", mealId, attempt, MAX_ATTEMPTS);
                    try { Thread.sleep(15000); } catch (InterruptedException ignored) {}
                } else {
                    log.warn("AI analysis attempt {}/{} failed for meal {}: {}", attempt, MAX_ATTEMPTS, mealId, e.getMessage());
                    try { Thread.sleep(2000); } catch (InterruptedException ignored) {}
                }
            }
        }

        if (result != null) {
            finalMeal.setName(result.name);
            finalMeal.setCalories(result.calories);
            finalMeal.setProtein(result.protein);
            finalMeal.setCarbs(result.carbs);
            finalMeal.setFats(result.fats);
            finalMeal.setHealthScore(result.healthScore);
            finalMeal.setConfidence(result.confidence);
            finalMeal.setIngredients(result.ingredients);
            finalMeal.setAnalysisStatus(Meal.AnalysisStatus.COMPLETED);
        } else {
            log.error("AI analysis failed after {} attempts for meal {}: {}",
                      MAX_ATTEMPTS, mealId, lastException != null ? lastException.getMessage() : "unknown");
            finalMeal.setAnalysisStatus(Meal.AnalysisStatus.FAILED);
            applyFallbackEstimate(finalMeal);
        }
        mealRepository.save(finalMeal);
    }

    private NutritionResult analyzeImage(String base64Image, String mimeType) throws Exception {
        if (ollamaApiUrl == null || ollamaApiUrl.isBlank()) {
            log.info("Ollama API URL is missing. Using random estimate fallback.");
            return generateEstimate();
        }

        RestTemplate rest = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // System prompt and user instructions
        String systemPrompt = "You are a nutrition analysis AI. Analyze the food in the image and provide nutritional information.";
        String userPrompt = "Identify ALL food items in this photo and return EXACTLY this JSON structure:\n" +
            "{\n" +
            "  \"foods\": [\n" +
            "    {\n" +
            "      \"name\": \"<food name>\",\n" +
            "      \"calories\": <integer>,\n" +
            "      \"protein\": <number in grams>,\n" +
            "      \"carbs\": <number in grams>,\n" +
            "      \"fats\": <number in grams>,\n" +
            "      \"ingredients\": \"<comma-separated ingredients>\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"totalCalories\": <integer>,\n" +
            "  \"totalProtein\": <number>,\n" +
            "  \"totalCarbs\": <number>,\n" +
            "  \"totalFats\": <number>,\n" +
            "  \"healthScore\": <number 1-10>,\n" +
            "  \"confidence\": <integer 0-100>\n" +
            "}\n" +
            "Rules:\n" +
            "1. ONLY include food items clearly visible in the image.\n" +
            "2. If unsure, use a low 'confidence' score.\n" +
            "3. DO NOT invent ingredients that are not typically in the identified foods.\n" +
            "4. Respond ONLY with the JSON object. No other text.";

        // Construct Ollama payload for /api/generate
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", ollamaModel);
        body.put("prompt", systemPrompt + "\n\n" + userPrompt);
        body.put("images", List.of(base64Image));
        body.put("stream", false);
        body.put("format", "json");
        
        // Add options to minimize hallucinations
        Map<String, Object> options = new HashMap<>();
        options.put("temperature", 0.0); // Strict, deterministic output
        options.put("top_p", 0.1);
        body.put("options", options);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        
        log.info("Sending request to Ollama /api/generate at {} with model {}", ollamaApiUrl, ollamaModel);
        ResponseEntity<String> response = rest.postForEntity(ollamaApiUrl, entity, String.class);

        JsonNode root = objectMapper.readTree(response.getBody());
        String text = root.path("response").asText();
        
        if (text == null || text.isBlank()) {
            throw new Exception("Ollama returned empty content");
        }
        
        return parseAndValidateNutritionJson(text);
    }

    private NutritionResult parseAndValidateNutritionJson(String json) throws Exception {
        String cleaned = json.trim();
        // Strip markdown code fences if present
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("```[a-z]*\\n?", "").replace("```", "").trim();
        }
        JsonNode node = objectMapper.readTree(cleaned);

        // Strict validation — throw if required fields are missing or wrong type
        if (!node.has("totalCalories") || !node.has("healthScore") || !node.has("confidence")) {
            throw new Exception("AI response missing required top-level fields: " + cleaned);
        }
        if (!node.get("totalCalories").isNumber()) throw new Exception("totalCalories must be a number");
        if (!node.get("healthScore").isNumber()) throw new Exception("healthScore must be a number");
        if (!node.get("confidence").isNumber()) throw new Exception("confidence must be a number");

        double hs = node.get("healthScore").asDouble();
        if (hs < 0 || hs > 10) throw new Exception("healthScore out of range: " + hs);

        int conf = node.get("confidence").asInt();
        if (conf < 0 || conf > 100) throw new Exception("confidence out of range: " + conf);

        // Build result — aggregate from foods[] if present
        NutritionResult r = new NutritionResult();
        r.calories = node.path("totalCalories").asInt(0);
        r.protein   = node.path("totalProtein").asDouble(0);
        r.carbs     = node.path("totalCarbs").asDouble(0);
        r.fats      = node.path("totalFats").asDouble(0);
        r.healthScore = hs;
        r.confidence  = conf;

        // Collect food names and ingredients from foods[]
        JsonNode foods = node.path("foods");
        if (foods.isArray() && foods.size() > 0) {
            StringBuilder names = new StringBuilder();
            StringBuilder ingr  = new StringBuilder();
            for (JsonNode f : foods) {
                if (names.length() > 0) names.append(", ");
                names.append(f.path("name").asText("Food"));
                String fi = f.path("ingredients").asText("");
                if (!fi.isBlank()) { if (ingr.length() > 0) ingr.append("; "); ingr.append(fi); }
            }
            r.name = names.toString();
            r.ingredients = ingr.toString();
        } else {
            r.name = "Scanned Meal";
            r.ingredients = "";
        }
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
        meal.setName("Analysis Failed (Please retry)");
        meal.setCalories(0);
        meal.setProtein(0);
        meal.setCarbs(0);
        meal.setFats(10); // Maybe keep a tiny fat or just 0
        meal.setFats(0);
        meal.setHealthScore(0);
        meal.setConfidence(0);
        meal.setAnalysisStatus(Meal.AnalysisStatus.FAILED);
    }

    private static class NutritionResult {
        String name; int calories; double protein; double carbs;
        double fats; double healthScore; int confidence; String ingredients;
    }
}
