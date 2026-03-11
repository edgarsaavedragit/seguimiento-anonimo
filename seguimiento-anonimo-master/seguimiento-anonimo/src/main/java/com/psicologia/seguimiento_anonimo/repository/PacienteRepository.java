package com.psicologia.seguimiento_anonimo.repository;

import com.psicologia.seguimiento_anonimo.model.Paciente;
import com.psicologia.seguimiento_anonimo.model.Seudonimo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    Optional<Paciente> findByTokenInvitacion(String tokenInvitacion);

    Optional<Paciente> findBySeudonimo(Seudonimo seudonimo);
    
    Optional<Paciente> findBySeudonimoAlias(String alias);
    
    // === NUEVOS MÉTODOS PARA DASHBOARD ===
    
    // Contar pacientes vinculados (con seudónimo)
    long countBySeudonimoIsNotNull();
    
    // Últimos pacientes registrados
    List<Paciente> findTop5ByOrderByIdDesc();
}