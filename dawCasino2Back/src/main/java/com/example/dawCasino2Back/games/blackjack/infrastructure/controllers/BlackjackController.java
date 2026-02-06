package com.example.dawCasino2Back.games.blackjack.infrastructure.controllers;

import com.example.dawCasino2Back.games.blackjack.application.BlackjackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/blackjack")
@CrossOrigin(origins = "*")
public class BlackjackController {

    private final BlackjackService blackjackService;

    public BlackjackController(BlackjackService blackjackService) {
        this.blackjackService = blackjackService;
    }

    @PostMapping("/deal")
    public ResponseEntity<?> deal(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Double bet = Double.valueOf(payload.get("bet").toString());
            return ResponseEntity.ok(blackjackService.startGame(userId, bet));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/hit")
    public ResponseEntity<?> hit(@RequestBody Map<String, Object> payload) {
        try { return ResponseEntity.ok(blackjackService.hit(Long.valueOf(payload.get("userId").toString()))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/stand")
    public ResponseEntity<?> stand(@RequestBody Map<String, Object> payload) {
        try { return ResponseEntity.ok(blackjackService.stand(Long.valueOf(payload.get("userId").toString()))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(blackjackService.getUserHistory(userId));
    }
}