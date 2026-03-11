package com.psicologia.seguimiento_anonimo.repository;

import com.psicologia.seguimiento_anonimo.model.Seudonimo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SeudonimoRepository extends JpaRepository<Seudonimo, Long> {

    List<Seudonimo> findByDisponibleTrue();

    List<Seudonimo> findByDisponibleFalse();
    
    Optional<Seudonimo> findByAlias(String alias);  
    
    List<Seudonimo> findAllByOrderByIdAsc();
    
    // === VERIFICAR QUE ESTE MÉTODO EXISTA ===
    
    // Contar seudónimos disponibles
    long countByDisponibleTrue();
}