package com.example.dawCasino2Back.games.roulette.infrastructure.controllers;

import com.example.dawCasino2Back.games.roulette.application.RouletteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/roulette")
@CrossOrigin(origins = "*")
public class RouletteController {

    private final RouletteService rouletteService;

    public RouletteController(RouletteService rouletteService) {
        this.rouletteService = rouletteService;
    }

    @PostMapping("/spin")
    public ResponseEntity<?> spin(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            String betType = payload.get("betType").toString(); // NUMBER, COLOR, PARITY
            String betValue = payload.get("betValue").toString(); // "14", "RED", "EVEN"
            Double amount = Double.valueOf(payload.get("betAmount").toString());

            return ResponseEntity.ok(rouletteService.spinWheel(userId, betType, betValue, amount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(rouletteService.getUserHistory(userId));
    }
}