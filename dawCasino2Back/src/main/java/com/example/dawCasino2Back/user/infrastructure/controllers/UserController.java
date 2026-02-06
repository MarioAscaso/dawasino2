package com.example.dawCasino2Back.user.infrastructure.controllers;

import com.example.dawCasino2Back.user.application.login.LoginUserApp;
import com.example.dawCasino2Back.user.application.login.dtos.LoginRequest;
import com.example.dawCasino2Back.user.application.register.RegisterUserApp;
import com.example.dawCasino2Back.user.application.register.dtos.RegisterRequest;
import com.example.dawCasino2Back.user.domain.models.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final RegisterUserApp registerUserApp;
    private final LoginUserApp loginUserApp;

    public UserController(RegisterUserApp registerUserApp, LoginUserApp loginUserApp) {
        this.registerUserApp = registerUserApp;
        this.loginUserApp = loginUserApp;
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

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        try {
            User user = loginUserApp.execute(request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}