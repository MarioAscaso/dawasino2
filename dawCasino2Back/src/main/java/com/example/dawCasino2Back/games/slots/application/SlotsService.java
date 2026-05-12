package com.example.dawCasino2Back.games.slots.application;

import com.example.dawCasino2Back.games.slots.domain.SlotsGame;
import com.example.dawCasino2Back.games.slots.domain.repositories.SlotsGameRepository;
import com.example.dawCasino2Back.user.shared.domain.entities.User;
import com.example.dawCasino2Back.user.shared.domain.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class SlotsService {
    private final UserRepository userRepository;
    private final SlotsGameRepository slotsGameRepository;
    private final Random random = new Random();
    private final String[] symbolsList = {"🍒", "🍋", "🔔", "💎", "7️⃣"};

    public SlotsService(UserRepository userRepository, SlotsGameRepository slotsGameRepository) {
        this.userRepository = userRepository;
        this.slotsGameRepository = slotsGameRepository;
    }

    public Map<String, Object> spin(Long userId, Double betAmount) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (user.getBalance() < betAmount) throw new RuntimeException("Saldo insuficiente");

        user.setBalance(user.getBalance() - betAmount);

        String s1 = symbolsList[random.nextInt(symbolsList.length)];
        String s2 = symbolsList[random.nextInt(symbolsList.length)];
        String s3 = symbolsList[random.nextInt(symbolsList.length)];

        double multiplier = 0;
        if(s1.equals(s2) && s2.equals(s3)) {
            if(s1.equals("7️⃣")) multiplier = 50;
            else if(s1.equals("💎")) multiplier = 25;
            else multiplier = 10;
        } else if (s1.equals(s2) || s2.equals(s3) || s1.equals(s3)) {
            multiplier = 2;
        }

        double winAmount = betAmount * multiplier;
        String resultString = winAmount > 0 ? "WIN" : "LOSE";

        if (winAmount > 0) user.setBalance(user.getBalance() + winAmount);
        userRepository.save(user);

        String symbolsConcat = s1 + "," + s2 + "," + s3;
        SlotsGame game = new SlotsGame(user, resultString, symbolsConcat, betAmount, winAmount);
        slotsGameRepository.save(game);

        return Map.of(
                "symbols", List.of(s1, s2, s3),
                "winAmount", winAmount,
                "newBalance", user.getBalance(),
                "status", resultString
        );
    }

    public List<SlotsGame> getUserHistory(Long userId) {
        return slotsGameRepository.findByUserIdOrderByPlayedAtDesc(userId);
    }
}