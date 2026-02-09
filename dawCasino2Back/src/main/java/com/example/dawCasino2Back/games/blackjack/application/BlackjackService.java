package com.example.dawCasino2Back.games.blackjack.application;

// IMPORTS ACTUALIZADOS: Añadido ".shared"
import com.example.dawCasino2Back.user.shared.domain.models.User;
import com.example.dawCasino2Back.user.shared.domain.repositories.UserRepository;

import com.example.dawCasino2Back.games.blackjack.application.dtos.GameDTO;
import com.example.dawCasino2Back.games.blackjack.domain.BlackjackGame;
import com.example.dawCasino2Back.games.blackjack.domain.repositories.BlackjackGameRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BlackjackService {
    // ... (El resto del código del servicio es idéntico, solo cambiaron los imports de arriba)
    private final UserRepository userRepository;
    private final BlackjackGameRepository blackjackGameRepository;
    private final Map<Long, GameSession> activeGames = new ConcurrentHashMap<>();

    public BlackjackService(UserRepository userRepository, BlackjackGameRepository blackjackGameRepository) {
        this.userRepository = userRepository;
        this.blackjackGameRepository = blackjackGameRepository;
    }

    public GameDTO startGame(Long userId, double bet) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getBalance() < bet) throw new RuntimeException("Saldo insuficiente");

        user.setBalance(user.getBalance() - bet);
        userRepository.save(user);

        GameSession session = new GameSession(bet);
        session.dealInitialCards();
        activeGames.put(userId, session);

        if (session.getPlayerScore() == 21) {
            return stand(userId);
        }

        return mapToDTO(session, user.getBalance(), "PLAYING");
    }

    public GameDTO hit(Long userId) {
        GameSession session = activeGames.get(userId);
        if (session == null) throw new RuntimeException("No hay partida activa");

        session.playerHit();

        if (session.getPlayerScore() > 21) {
            return finishGame(userId, session, "DEALER_WIN");
        }

        return mapToDTO(session, getUserBalance(userId), "PLAYING");
    }

    public GameDTO stand(Long userId) {
        GameSession session = activeGames.get(userId);
        if (session == null) throw new RuntimeException("No hay partida activa");

        while (session.getDealerScore() < 17) {
            session.dealerHit();
        }

        String result;
        int pScore = session.getPlayerScore();
        int dScore = session.getDealerScore();

        if (dScore > 21 || pScore > dScore) result = "PLAYER_WIN";
        else if (dScore == pScore) result = "DRAW";
        else result = "DEALER_WIN";

        return finishGame(userId, session, result);
    }

    private GameDTO finishGame(Long userId, GameSession session, String resultKey) {
        User user = userRepository.findById(userId).get();
        double winAmount = 0.0;
        String historyResult = "LOSE";

        if (resultKey.equals("PLAYER_WIN")) {
            winAmount = session.bet * 2;
            user.setBalance(user.getBalance() + winAmount);
            historyResult = "WIN";
        } else if (resultKey.equals("DRAW")) {
            winAmount = session.bet;
            user.setBalance(user.getBalance() + winAmount);
            historyResult = "DRAW";
        }

        userRepository.save(user);

        BlackjackGame game = new BlackjackGame(user, historyResult, session.bet, winAmount);
        blackjackGameRepository.save(game);

        activeGames.remove(userId);
        return mapToDTO(session, user.getBalance(), resultKey);
    }

    private GameDTO mapToDTO(GameSession session, double balance, String status) {
        List<String> visibleDealerCards = new ArrayList<>(session.dealerCards);
        int visibleDealerScore = session.getDealerScore();

        if (status.equals("PLAYING") && visibleDealerCards.size() >= 2) {
            visibleDealerCards.set(0, "HIDDEN");
            List<String> visibleOnly = new ArrayList<>(session.dealerCards);
            visibleOnly.remove(0);
            visibleDealerScore = session.calculateScore(visibleOnly);
        }

        return new GameDTO(
                status,
                session.playerCards,
                visibleDealerCards,
                session.getPlayerScore(),
                visibleDealerScore,
                balance
        );
    }

    private double getUserBalance(Long userId) {
        return userRepository.findById(userId).map(User::getBalance).orElse(0.0);
    }

    public List<BlackjackGame> getUserHistory(Long userId) {
        return blackjackGameRepository.findByUserIdOrderByPlayedAtDesc(userId);
    }

    private static class GameSession {
        List<String> deck = new ArrayList<>();
        List<String> playerCards = new ArrayList<>();
        List<String> dealerCards = new ArrayList<>();
        double bet;

        public GameSession(double bet) {
            this.bet = bet;
            String[] suits = {"♠", "♥", "♦", "♣"};
            String[] ranks = {"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"};
            for (String s : suits) for (String r : ranks) deck.add(r + s);
            Collections.shuffle(deck);
        }

        void dealInitialCards() {
            playerCards.add(draw());
            dealerCards.add(draw());
            playerCards.add(draw());
            dealerCards.add(draw());
        }

        void playerHit() { playerCards.add(draw()); }
        void dealerHit() { dealerCards.add(draw()); }
        String draw() { return deck.remove(0); }
        int getPlayerScore() { return calculateScore(playerCards); }
        int getDealerScore() { return calculateScore(dealerCards); }

        int calculateScore(List<String> hand) {
            int score = 0, aces = 0;
            for (String card : hand) {
                if (card.equals("HIDDEN")) continue;
                String rank = card.substring(0, card.length() - 1);
                if ("JQK".contains(rank) || rank.equals("10")) score += 10;
                else if (rank.equals("A")) { score += 11; aces++; }
                else score += Integer.parseInt(rank);
            }
            while (score > 21 && aces > 0) { score -= 10; aces--; }
            return score;
        }
    }
}