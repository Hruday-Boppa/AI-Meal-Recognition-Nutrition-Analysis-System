package com.calai.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @Email @NotBlank
    private String email;
    @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    private int calorieGoal = 2000;
}
