package com.example.dawCasino2Back.games.slots.domain.repositories;

import com.example.dawCasino2Back.games.slots.domain.SlotsGame;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SlotsGameRepository extends JpaRepository<SlotsGame, Long> {
    List<SlotsGame> findByUserIdOrderByPlayedAtDesc(Long userId);
}