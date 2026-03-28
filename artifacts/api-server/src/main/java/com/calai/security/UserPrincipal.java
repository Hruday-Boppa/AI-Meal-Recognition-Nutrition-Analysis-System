package com.calai.security;

import com.calai.model.User;

public class UserPrincipal {
    private final User user;

    public UserPrincipal(User user) {
        this.user = user;
    }

    public User getUser() { return user; }
    public Long getId() { return user.getId(); }
    public String getEmail() { return user.getEmail(); }
}
