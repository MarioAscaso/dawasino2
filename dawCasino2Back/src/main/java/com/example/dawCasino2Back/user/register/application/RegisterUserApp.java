package com.example.dawCasino2Back.user.register.application;

import com.example.dawCasino2Back.user.register.application.dtos.RegisterRequest;
import com.example.dawCasino2Back.user.shared.domain.entities.User;
import com.example.dawCasino2Back.user.shared.domain.repositories.UserRepository;
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

    public boolean execute(RegisterRequest request) {
        try {
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
            user.setRole("USER");
            user.setCreatedAt(java.time.LocalDateTime.now());

            userRepository.save(user);
        }catch (Exception e){
            return false;
        }
        return true;
    }
}