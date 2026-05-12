package com.example.dawCasino2Back.games.slots.infrastructure.controllers;

import com.example.dawCasino2Back.games.slots.application.SlotsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "*")
public class SlotsController {
    private final SlotsService slotsService;
    public SlotsController(SlotsService slotsService) { this.slotsService = slotsService; }

    @PostMapping("/spin")
    public ResponseEntity<?> spin(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Double betAmount = Double.valueOf(payload.get("betAmount").toString());
            return ResponseEntity.ok(slotsService.spin(userId, betAmount));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(slotsService.getUserHistory(userId));
    }
}