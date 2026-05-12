package com.example.dawCasino2Back.games.roulette.application;

import com.example.dawCasino2Back.games.roulette.domain.RouletteGame;
import com.example.dawCasino2Back.games.roulette.domain.repositories.RouletteGameRepository;
import com.example.dawCasino2Back.user.shared.domain.entities.User;
import com.example.dawCasino2Back.user.shared.domain.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

@Service
public class RouletteService {
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

    public Map<String, Object> spinWheel(Long userId, List<Map<String, Object>> bets) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        double totalBetAmount = bets.stream()
                .mapToDouble(b -> Double.valueOf(b.get("betAmount").toString()))
                .sum();

        if (user.getBalance() < totalBetAmount) throw new RuntimeException("Saldo insuficiente");

        user.setBalance(user.getBalance() - totalBetAmount);
        int winningNumber = random.nextInt(37);
        double totalWinAmount = 0.0;

        for (Map<String, Object> bet : bets) {
            String betType = bet.get("betType").toString();
            String betValue = bet.get("betValue").toString();
            Double betAmount = Double.valueOf(bet.get("betAmount").toString());

            double winAmount = calculateWin(betType, betValue, betAmount, winningNumber);
            totalWinAmount += winAmount;

            RouletteGame game = new RouletteGame(user, betType, betValue, winningNumber, betAmount, winAmount);
            rouletteGameRepository.save(game);
        }

        if (totalWinAmount > 0) {
            user.setBalance(user.getBalance() + totalWinAmount);
        }

        userRepository.save(user);

        return Map.of(
                "winningNumber", winningNumber,
                "winAmount", totalWinAmount,
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
                if (value.equalsIgnoreCase(getNumberColor(result))) return amount * 2;
                break;
            case "PARITY":
                boolean isEven = (result % 2 == 0);
                if (value.equals("EVEN") && isEven) return amount * 2;
                if (value.equals("ODD") && !isEven) return amount * 2;
                break;
            case "HALF":
                if (value.equals("LOW") && result >= 1 && result <= 18) return amount * 2;
                if (value.equals("HIGH") && result >= 19 && result <= 36) return amount * 2;
                break;
            case "DOZEN":
                if (value.equals("1") && result >= 1 && result <= 12) return amount * 3;
                if (value.equals("2") && result >= 13 && result <= 24) return amount * 3;
                if (value.equals("3") && result >= 25 && result <= 36) return amount * 3;
                break;
            case "COLUMN":
                int col = result % 3;
                if (col == 0) col = 3;
                if (Integer.parseInt(value) == col) return amount * 3;
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