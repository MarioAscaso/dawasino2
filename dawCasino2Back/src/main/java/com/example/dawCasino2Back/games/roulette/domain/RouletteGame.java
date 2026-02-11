package com.example.dawCasino2Back.games.roulette.domain;

// IMPORT ACTUALIZADO: Añadido ".shared"
import com.example.dawCasino2Back.user.shared.domain.entities.User;
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

    private String betType;
    private String betValue;
    private Integer resultNumber;
    private Double betAmount;
    private Double winAmount;
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

    public Long getId() { return id; }
    public String getGameType() { return "ROULETTE"; }
    public String getResult() { return winAmount > 0 ? "WIN" : "LOSE"; }
    public Double getBetAmount() { return betAmount; }
    public Double getWinAmount() { return winAmount; }
    public Integer getResultNumber() { return resultNumber; }
    public LocalDateTime getPlayedAt() { return playedAt; }
}