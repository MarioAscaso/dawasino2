package com.example.dawCasino2Back.domain.repositories;

import com.example.dawCasino2Back.domain.models.User;

import java.util.Optional;

public interface UserRepository {
    User save(User user);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<User> findById(Long id);

    Optional<User> findByUsername(String username);
}