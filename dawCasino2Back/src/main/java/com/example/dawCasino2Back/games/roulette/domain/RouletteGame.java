package com.example.dawCasino2Back.games.roulette.domain;

import com.example.dawCasino2Back.user.domain.models.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "roulette_games")
public class RouletteGame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String betType; // "NUMBER", "COLOR", "PARITY"
    private String betValue; // "17", "RED", "EVEN"
    private Integer resultNumber; // 0-36
    private Double betAmount;
    private Double winAmount; // 0.0 si pierde
    private LocalDateTime playedAt;

    public RouletteGame() {}

    public RouletteGame(User user, String betType, String betValue, Integer resultNumber, Double betAmount, Double winAmount) {
        this.user = user;
        this.betType = betType;
        this.betValue = betValue;
        this.resultNumber = resultNumber;
        this.betAmount = betAmount;
        this.winAmount = winAmount;
        this.playedAt = LocalDateTime.now();
    }

    // Getters para el JSON
    public Long getId() { return id; }
    public String getGameType() { return "ROULETTE"; } // Para el filtro del frontend
    public String getResult() { return winAmount > 0 ? "WIN" : "LOSE"; } // Compatibilidad visual
    public Double getBetAmount() { return betAmount; }
    public Double getWinAmount() { return winAmount; }
    public Integer getResultNumber() { return resultNumber; }
    public LocalDateTime getPlayedAt() { return playedAt; }
}