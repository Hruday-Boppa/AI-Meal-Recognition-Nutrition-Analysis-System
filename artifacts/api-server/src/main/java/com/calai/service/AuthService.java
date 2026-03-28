package com.calai.service;

import com.calai.dto.auth.AuthResponse;
import com.calai.dto.auth.LoginRequest;
import com.calai.dto.auth.RegisterRequest;
import com.calai.model.User;
import com.calai.repository.UserRepository;
import com.calai.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }
        User user = new User();
        user.setEmail(req.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setCalorieGoal(req.getCalorieGoal() > 0 ? req.getCalorieGoal() : 2000);
        userRepository.save(user);
        String token = jwtTokenProvider.generateToken(user.getId());
        return new AuthResponse(token, user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String token = jwtTokenProvider.generateToken(user.getId());
        return new AuthResponse(token, user);
    }

    public User updateUser(User user, java.util.Map<String, Object> updates) {
        if (updates.containsKey("firstName")) user.setFirstName((String) updates.get("firstName"));
        if (updates.containsKey("lastName")) user.setLastName((String) updates.get("lastName"));
        if (updates.containsKey("calorieGoal")) {
            Object goal = updates.get("calorieGoal");
            if (goal instanceof Integer) user.setCalorieGoal((Integer) goal);
            else if (goal instanceof Number) user.setCalorieGoal(((Number) goal).intValue());
        }
        return userRepository.save(user);
    }
}
