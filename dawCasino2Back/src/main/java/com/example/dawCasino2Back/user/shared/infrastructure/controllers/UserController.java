package com.example.dawCasino2Back.user.shared.infrastructure.controllers;

import com.example.dawCasino2Back.user.shared.domain.entities.User;
import com.example.dawCasino2Back.user.shared.domain.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PutMapping("/{id}/avatar")
    public ResponseEntity<?> updateAvatar(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            user.setAvatar(payload.get("avatar"));
            userRepository.save(user);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}