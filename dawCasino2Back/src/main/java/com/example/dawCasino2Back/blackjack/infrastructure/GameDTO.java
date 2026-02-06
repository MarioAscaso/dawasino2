package com.example.dawCasino2Back.blackjack.infrastructure;

import java.util.List;

public class GameDTO {
    private String status; // "PLAYING", "PLAYER_WIN", "DEALER_WIN", "DRAW"
    private List<String> playerCards;
    private List<String> dealerCards;
    private int playerScore;
    private int dealerScore;
    private double newBalance;

    public GameDTO(String status, List<String> playerCards, List<String> dealerCards, int playerScore, int dealerScore, double newBalance) {
        this.status = status;
        this.playerCards = playerCards;
        this.dealerCards = dealerCards;
        this.playerScore = playerScore;
        this.dealerScore = dealerScore;
        this.newBalance = newBalance;
    }

    // Getters necesarios para que Spring convierta a JSON
    public String getStatus() { return status; }
    public List<String> getPlayerCards() { return playerCards; }
    public List<String> getDealerCards() { return dealerCards; }
    public int getPlayerScore() { return playerScore; }
    public int getDealerScore() { return dealerScore; }
    public double getNewBalance() { return newBalance; }
}
