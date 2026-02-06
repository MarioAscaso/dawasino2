package com.example.dawCasino2Back.user.application.login;

import com.example.dawCasino2Back.user.application.login.dtos.LoginRequest;
import com.example.dawCasino2Back.user.domain.models.User;
import com.example.dawCasino2Back.user.domain.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginUserApp {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginUserApp(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User execute(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return user;
    }
}