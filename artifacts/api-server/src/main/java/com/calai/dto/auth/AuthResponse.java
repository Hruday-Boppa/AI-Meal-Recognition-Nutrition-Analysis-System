package com.calai.dto.auth;

import com.calai.model.User;
import java.time.LocalDateTime;

public class AuthResponse {
    private String token;
    private UserDto user;

    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = new UserDto(user);
    }

    public String getToken() { return token; }
    public UserDto getUser() { return user; }

    public static class UserDto {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private int calorieGoal;
        private LocalDateTime createdAt;

        public UserDto(User user) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
            this.calorieGoal = user.getCalorieGoal();
            this.createdAt = user.getCreatedAt();
        }

        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public int getCalorieGoal() { return calorieGoal; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
}
