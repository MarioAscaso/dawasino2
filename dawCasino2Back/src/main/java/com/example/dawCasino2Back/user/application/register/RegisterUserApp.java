package com.example.dawCasino2Back.user.application.register;

import com.example.dawCasino2Back.user.application.register.dtos.RegisterRequest;
import com.example.dawCasino2Back.user.domain.models.User;
import com.example.dawCasino2Back.user.domain.repositories.UserRepository;
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

        // Mapeo manual de DTO a Entidad (Pragmático)
        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setBalance(1000.00); // Saldo inicial
        user.setRole("USER");
        user.setAvatar("default_avatar.png");
        user.setCreatedAt(java.time.LocalDateTime.now());

        return userRepository.save(user);
    }
}
