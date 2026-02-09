package com.example.dawCasino2Back.games.blackjack.domain;

// IMPORT ACTUALIZADO: Añadido ".shared"
import com.example.dawCasino2Back.user.shared.domain.models.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blackjack_games")
public class BlackjackGame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String result;   // "WIN", "LOSE", "DRAW"
    private Double betAmount;
    private Double winAmount;
    private LocalDateTime playedAt;

    public BlackjackGame() {}

    public BlackjackGame(User user, String result, Double betAmount, Double winAmount) {
        this.user = user;
        this.result = result;
        this.betAmount = betAmount;
        this.winAmount = winAmount;
        this.playedAt = LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getResult() { return result; }
    public Double getBetAmount() { return betAmount; }
    public Double getWinAmount() { return winAmount; }
    public LocalDateTime getPlayedAt() { return playedAt; }

    public String getGameType() { return "BLACKJACK"; }
}