package com.psicologia.seguimiento_anonimo.service;

import com.psicologia.seguimiento_anonimo.model.Encuesta;
import com.psicologia.seguimiento_anonimo.model.Paciente;
import com.psicologia.seguimiento_anonimo.model.Seudonimo;
import com.psicologia.seguimiento_anonimo.repository.EncuestaRepository;
import com.psicologia.seguimiento_anonimo.repository.PacienteRepository;
import com.psicologia.seguimiento_anonimo.repository.SeudonimoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class EncuestaService {

    @Autowired
    private EncuestaRepository encuestaRepository;
    
    @Autowired  // <-- AGREGAR
    private PacienteRepository pacienteRepository;
    
    @Autowired  // <-- AGREGAR
    private SeudonimoRepository seudonimoRepository;

    public void guardarEncuesta(String alias, int clinico, int servicio, String cualitativo) {
        // 1. Buscar el seudónimo por el alias
        Optional<Seudonimo> seudonimoOpt = seudonimoRepository.findByAlias(alias);
        
        if (!seudonimoOpt.isPresent()) {
            throw new RuntimeException("No se encontró el seudónimo: " + alias);
        }
        
        Seudonimo seudonimo = seudonimoOpt.get();
        
        // 2. Buscar el paciente vinculado a ese seudónimo
        Optional<Paciente> pacienteOpt = pacienteRepository.findBySeudonimo(seudonimo);
        
        if (!pacienteOpt.isPresent()) {
            throw new RuntimeException("No se encontró paciente para el seudónimo: " + alias);
        }
        
        Paciente paciente = pacienteOpt.get();
        
        // 3. Crear y guardar la encuesta vinculada al paciente
        Encuesta encuesta = new Encuesta();
        encuesta.setEjeClinico(clinico);
        encuesta.setEjeServicio(servicio);
        encuesta.setEjeCualitativo(cualitativo);
        encuesta.setPaciente(paciente);  // <-- ¡ESTO ES LO MÁS IMPORTANTE!
        
        encuestaRepository.save(encuesta);
    }
}