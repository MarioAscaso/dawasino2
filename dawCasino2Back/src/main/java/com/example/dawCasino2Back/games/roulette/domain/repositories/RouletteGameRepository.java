package com.example.dawCasino2Back.games.roulette.domain.repositories;

import com.example.dawCasino2Back.games.roulette.domain.RouletteGame;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RouletteGameRepository extends JpaRepository<RouletteGame, Long> {
    List<RouletteGame> findByUserIdOrderByPlayedAtDesc(Long userId);
}