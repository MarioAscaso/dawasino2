package com.example.dawCasino2Back.games.roulette.infrastructure.controllers;

import com.example.dawCasino2Back.games.roulette.application.RouletteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
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
            List<Map<String, Object>> bets = (List<Map<String, Object>>) payload.get("bets");

            return ResponseEntity.ok(rouletteService.spinWheel(userId, bets));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(rouletteService.getUserHistory(userId));
    }
}