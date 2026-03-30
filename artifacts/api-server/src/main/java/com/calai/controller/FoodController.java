package com.calai.controller;

import com.calai.dto.meal.MealDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/foods")
public class FoodController {

    private static final List<Map<String, Object>> FOOD_DB = buildFoodDatabase();

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchFoods(@RequestParam("q") String query) {
        if (query == null || query.isBlank()) return ResponseEntity.ok(List.of());
        String q = query.toLowerCase().trim();
        List<Map<String, Object>> results = FOOD_DB.stream()
            .filter(f -> ((String) f.get("name")).toLowerCase().contains(q))
            .limit(20)
            .toList();
        return ResponseEntity.ok(results);
    }


    private static List<Map<String, Object>> buildFoodDatabase() {
        List<Map<String, Object>> db = new ArrayList<>();
        db.add(food("Chicken Breast (100g)", 165, 31, 0, 3.6, "100g"));
        db.add(food("Salmon (100g)", 208, 20, 0, 13, "100g"));
        db.add(food("Egg (large)", 74, 6.3, 0.4, 5, "1 large"));
        db.add(food("Banana (medium)", 89, 1.1, 23, 0.3, "1 medium"));
        db.add(food("Apple (medium)", 52, 0.3, 14, 0.2, "1 medium"));
        db.add(food("Avocado (half)", 130, 2, 7, 12, "half"));
        db.add(food("Brown Rice (cooked)", 216, 5, 45, 2, "1 cup"));
        db.add(food("Oatmeal (cooked)", 150, 5, 27, 3, "1 cup"));
        db.add(food("Greek Yogurt", 100, 17, 6, 0.7, "100g"));
        db.add(food("Almonds", 162, 6, 6, 14, "28g / 23 nuts"));
        db.add(food("Broccoli (cooked)", 55, 4, 11, 0.6, "1 cup"));
        db.add(food("Sweet Potato (baked)", 103, 2, 24, 0.1, "medium"));
        db.add(food("Peanut Butter", 94, 4, 3, 8, "1 tbsp"));
        db.add(food("Whole Milk (cup)", 149, 8, 12, 8, "1 cup"));
        db.add(food("Cheddar Cheese (1oz)", 110, 7, 0, 9, "1 oz"));
        db.add(food("Tuna (canned, drained)", 100, 22, 0, 1, "85g"));
        db.add(food("White Rice (cooked)", 205, 4, 45, 0.4, "1 cup"));
        db.add(food("Pasta (cooked)", 220, 8, 43, 1.3, "1 cup"));
        db.add(food("Bread (whole wheat, slice)", 69, 3.6, 12, 0.9, "1 slice"));
        db.add(food("Orange (medium)", 62, 1.2, 15, 0.2, "1 medium"));
        db.add(food("Strawberries", 49, 1, 12, 0.5, "1 cup"));
        db.add(food("Spinach (raw)", 7, 0.9, 1.1, 0.1, "1 cup"));
        db.add(food("Lentils (cooked)", 230, 18, 40, 0.8, "1 cup"));
        db.add(food("Black Beans (cooked)", 227, 15, 41, 0.9, "1 cup"));
        db.add(food("Quinoa (cooked)", 222, 8, 39, 3.5, "1 cup"));
        db.add(food("Cottage Cheese (cup)", 206, 28, 8, 9, "1 cup"));
        db.add(food("Blueberries", 84, 1.1, 21, 0.5, "1 cup"));
        db.add(food("Walnuts", 185, 4, 4, 18, "28g / 14 halves"));
        db.add(food("Turkey Breast (100g)", 135, 30, 0, 1, "100g"));
        db.add(food("Beef (ground, 90% lean)", 215, 28, 0, 11, "100g"));
        return db;
    }

    private static Map<String, Object> food(String name, int cal, double protein, double carbs, double fats, String serving) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", name); m.put("calories", cal); m.put("protein", protein);
        m.put("carbs", carbs); m.put("fats", fats); m.put("servingSize", serving);
        return m;
    }
}
