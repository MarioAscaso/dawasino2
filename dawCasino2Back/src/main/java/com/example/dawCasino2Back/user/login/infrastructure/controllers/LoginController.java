package com.example.dawCasino2Back.user.login.infrastructure.controllers;

import com.example.dawCasino2Back.user.login.application.LoginUserApp;
import com.example.dawCasino2Back.user.login.application.dtos.LoginRequest;
import com.example.dawCasino2Back.user.shared.domain.entities.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LoginController {

    private final LoginUserApp loginUserApp;

    public LoginController(LoginUserApp loginUserApp) {
        this.loginUserApp = loginUserApp;
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