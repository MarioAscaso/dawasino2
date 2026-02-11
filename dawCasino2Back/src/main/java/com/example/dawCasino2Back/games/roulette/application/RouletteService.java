package com.example.dawCasino2Back.games.roulette.application;

import com.example.dawCasino2Back.games.roulette.domain.RouletteGame;
import com.example.dawCasino2Back.games.roulette.domain.repositories.RouletteGameRepository;
// IMPORTS ACTUALIZADOS: Añadido ".shared"
import com.example.dawCasino2Back.user.shared.domain.entities.User;
import com.example.dawCasino2Back.user.shared.domain.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

@Service
public class RouletteService {
    // ... (Código idéntico, solo imports actualizados)
    private final UserRepository userRepository;
    private final RouletteGameRepository rouletteGameRepository;
    private final Random random = new Random();

    private final Set<Integer> redNumbers = Set.of(
            1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
    );

    public RouletteService(UserRepository userRepository, RouletteGameRepository rouletteGameRepository) {
        this.userRepository = userRepository;
        this.rouletteGameRepository = rouletteGameRepository;
    }

    public Map<String, Object> spinWheel(Long userId, String betType, String betValue, Double betAmount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getBalance() < betAmount) throw new RuntimeException("Saldo insuficiente");

        user.setBalance(user.getBalance() - betAmount);

        int winningNumber = random.nextInt(37);
        double winAmount = calculateWin(betType, betValue, betAmount, winningNumber);

        if (winAmount > 0) {
            user.setBalance(user.getBalance() + winAmount);
        }

        userRepository.save(user);

        RouletteGame game = new RouletteGame(user, betType, betValue, winningNumber, betAmount, winAmount);
        rouletteGameRepository.save(game);

        return Map.of(
                "winningNumber", winningNumber,
                "winAmount", winAmount,
                "newBalance", user.getBalance(),
                "color", getNumberColor(winningNumber)
        );
    }

    private double calculateWin(String type, String value, double amount, int result) {
        if (result == 0 && !type.equals("NUMBER")) return 0.0;

        switch (type) {
            case "NUMBER":
                if (Integer.parseInt(value) == result) return amount * 36;
                break;
            case "COLOR":
                String resultColor = getNumberColor(result);
                if (value.equalsIgnoreCase(resultColor)) return amount * 2;
                break;
            case "PARITY":
                boolean isEven = (result % 2 == 0);
                if (value.equals("EVEN") && isEven) return amount * 2;
                if (value.equals("ODD") && !isEven) return amount * 2;
                break;
        }
        return 0.0;
    }

    private String getNumberColor(int number) {
        if (number == 0) return "GREEN";
        return redNumbers.contains(number) ? "RED" : "BLACK";
    }

    public List<RouletteGame> getUserHistory(Long userId) {
        return rouletteGameRepository.findByUserIdOrderByPlayedAtDesc(userId);
    }
}