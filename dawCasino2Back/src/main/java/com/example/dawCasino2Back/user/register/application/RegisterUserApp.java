package com.example.dawCasino2Back.user.register.application;

import com.example.dawCasino2Back.user.register.application.dtos.RegisterRequest;
import com.example.dawCasino2Back.user.shared.domain.models.User; // Import Shared
import com.example.dawCasino2Back.user.shared.domain.repositories.UserRepository; // Import Shared
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterUserApp {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterUserApp(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User execute(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setBalance(1000.00);
        user.setRole("USER");
        user.setAvatar("default_avatar.png");
        user.setCreatedAt(java.time.LocalDateTime.now());

        return userRepository.save(user);
    }
}