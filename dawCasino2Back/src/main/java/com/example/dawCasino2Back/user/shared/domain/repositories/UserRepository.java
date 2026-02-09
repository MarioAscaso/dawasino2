package com.example.dawCasino2Back.user.shared.domain.repositories; // CAMBIO DE PAQUETE

import com.example.dawCasino2Back.user.shared.domain.models.User; // IMPORT ACTUALIZADO
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Estos métodos siguen igual
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);
}