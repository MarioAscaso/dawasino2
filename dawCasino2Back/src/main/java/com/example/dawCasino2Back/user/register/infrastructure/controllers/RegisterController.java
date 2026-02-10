package com.example.dawCasino2Back.user.register.infrastructure.controllers;

import com.example.dawCasino2Back.user.register.application.RegisterUserApp;
import com.example.dawCasino2Back.user.register.application.dtos.RegisterRequest;
import com.example.dawCasino2Back.user.shared.domain.models.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RegisterController {

    private final RegisterUserApp registerUserApp;

    public RegisterController(RegisterUserApp registerUserApp) {
        this.registerUserApp = registerUserApp;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            User registeredUser = registerUserApp.execute(request);
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}