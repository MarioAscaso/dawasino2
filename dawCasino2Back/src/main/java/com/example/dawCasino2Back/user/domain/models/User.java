package com.example.dawCasino2Back.user.domain.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private Double balance;
    private String role;
    private LocalDateTime createdAt;

    private String avatar;
    private String avatarType;
    private Double dailyLossLimit;
    private Integer sessionTimeLimit;

    public User() {}

    public User(Long id, String username, String email, String password, Double balance, String role, String avatar, String avatarType, Double dailyLossLimit, Integer sessionTimeLimit, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.balance = balance;
        this.role = role;
        this.avatar = avatar;
        this.avatarType = avatarType;
        this.dailyLossLimit = dailyLossLimit;
        this.sessionTimeLimit = sessionTimeLimit;
        this.createdAt = createdAt;
    }

    public User(String username, String email, String password, Double balance, String role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.balance = balance;
        this.role = role;
        this.avatar = "default_avatar.png";
        this.avatarType = "IMAGE";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getAvatarType() { return avatarType; }
    public void setAvatarType(String avatarType) { this.avatarType = avatarType; }
    public Double getDailyLossLimit() { return dailyLossLimit; }
    public void setDailyLossLimit(Double dailyLossLimit) { this.dailyLossLimit = dailyLossLimit; }
    public Integer getSessionTimeLimit() { return sessionTimeLimit; }
    public void setSessionTimeLimit(Integer sessionTimeLimit) { this.sessionTimeLimit = sessionTimeLimit; }
}