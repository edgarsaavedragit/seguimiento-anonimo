package com.psicologia.seguimiento_anonimo.repository;

import com.psicologia.seguimiento_anonimo.model.Encuesta;
import com.psicologia.seguimiento_anonimo.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface EncuestaRepository extends JpaRepository<Encuesta, Long> {

    List<Encuesta> findByPacienteOrderByFechaAsc(Paciente paciente);

    List<Encuesta> findByPacienteOrderByFechaDesc(Paciente paciente);
    
    // === NUEVOS MÉTODOS PARA DASHBOARD ===
    
    // Contar encuestas desde una fecha
    long countByFechaAfter(LocalDateTime fecha);
    
    // Últimas encuestas completadas
    List<Encuesta> findTop5ByOrderByFechaDesc();
    
    // Encuestas de hoy (opcional)
    @Query("SELECT COUNT(e) FROM Encuesta e WHERE DATE(e.fecha) = CURRENT_DATE")
    long countEncuestasHoy();
}