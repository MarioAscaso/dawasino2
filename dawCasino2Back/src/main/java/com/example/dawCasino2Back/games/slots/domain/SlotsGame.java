package com.example.dawCasino2Back.games.slots.domain;

import com.example.dawCasino2Back.user.shared.domain.entities.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "slots_games")
public class SlotsGame {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String result;
    private String symbols;
    private Double betAmount;
    private Double winAmount;
    private LocalDateTime playedAt;

    public SlotsGame() {}
    public SlotsGame(User user, String result, String symbols, Double betAmount, Double winAmount) {
        this.user = user;
        this.result = result;
        this.symbols = symbols;
        this.betAmount = betAmount;
        this.winAmount = winAmount;
        this.playedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getGameType() { return "SLOTS"; }
    public String getResult() { return result; }
    public Double getBetAmount() { return betAmount; }
    public Double getWinAmount() { return winAmount; }
    public LocalDateTime getPlayedAt() { return playedAt; }
}