package com.example.dawCasino2Back.games.roulette.application;

import com.example.dawCasino2Back.games.roulette.domain.RouletteGame;
import com.example.dawCasino2Back.games.roulette.domain.repositories.RouletteGameRepository;
import com.example.dawCasino2Back.user.domain.models.User;
import com.example.dawCasino2Back.user.domain.repositories.UserRepository;
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

    // Definición de rojos (el resto excepto 0 son negros)
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

        // Restar apuesta
        user.setBalance(user.getBalance() - betAmount);

        // Girar ruleta (0-36)
        int winningNumber = random.nextInt(37);
        double winAmount = calculateWin(betType, betValue, betAmount, winningNumber);

        // Sumar ganancia si hubo
        if (winAmount > 0) {
            user.setBalance(user.getBalance() + winAmount);
        }

        userRepository.save(user);

        // Guardar historial
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
        // La casa gana siempre en 0 para apuestas externas (Color/Paridad)
        if (result == 0 && !type.equals("NUMBER")) return 0.0;

        switch (type) {
            case "NUMBER": // Pleno: paga 35 a 1 (+ la apuesta devuelta = x36)
                if (Integer.parseInt(value) == result) return amount * 36;
                break;
            case "COLOR": // Paga 1 a 1 (x2)
                String resultColor = getNumberColor(result);
                if (value.equalsIgnoreCase(resultColor)) return amount * 2;
                break;
            case "PARITY": // Paga 1 a 1 (x2)
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