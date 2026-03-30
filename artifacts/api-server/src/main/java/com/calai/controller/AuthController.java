package com.calai.controller;

import com.calai.dto.auth.AuthResponse;
import com.calai.dto.auth.LoginRequest;
import com.calai.dto.auth.RegisterRequest;
import com.calai.model.User;
import com.calai.security.UserPrincipal;
import com.calai.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(new AuthResponse.UserDto(principal.getUser()));
    }

    @PutMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> updateMe(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> updates) {
        User updated = authService.updateUser(principal.getUser(), updates);
        return ResponseEntity.ok(new AuthResponse.UserDto(updated));
    }
}
