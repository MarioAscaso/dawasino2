package com.example.dawCasino2Back.games.blackjack.domain.repositories;

import com.example.dawCasino2Back.games.blackjack.domain.BlackjackGame;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BlackjackGameRepository extends JpaRepository<BlackjackGame, Long> {
    List<BlackjackGame> findByUserIdOrderByPlayedAtDesc(Long userId);
}