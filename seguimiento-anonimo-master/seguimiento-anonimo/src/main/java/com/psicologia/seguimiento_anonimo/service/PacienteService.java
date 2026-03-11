package com.psicologia.seguimiento_anonimo.service;

import com.psicologia.seguimiento_anonimo.model.Paciente;
import com.psicologia.seguimiento_anonimo.model.Seudonimo;
import com.psicologia.seguimiento_anonimo.repository.PacienteRepository;
import java.util.Optional;
import com.psicologia.seguimiento_anonimo.repository.SeudonimoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class PacienteService {

    @Autowired
    private PacienteRepository repository;

    @Autowired // Necesitamos esto para buscar el seudónimo que elige
    private SeudonimoRepository seudonimoRepository;

    // FASE 1: Registrar
    public Paciente registrarPaciente(Paciente paciente) {
        // Generar token único
        String token = UUID.randomUUID().toString();
        paciente.setTokenInvitacion(token);

        // Guardar en base de datos
        return repository.save(paciente);
    }

    // FASE 2: Vincular (Match)
    public void vincularPaciente(String token, Long idSeudonimo) {
        System.out.println("=== DEPURACIÓN VINCULACIÓN ===");
        System.out.println("Token recibido: " + token);
        System.out.println("ID Seudónimo recibido: " + idSeudonimo);

        System.out.println("=== VINCULANDO SEUDÓNIMO ===");
        System.out.println("Token recibido: " + token);
        System.out.println("ID Seudónimo: " + idSeudonimo);

        // Principal: Verificar si ya tiene seudónimo
        Optional<Paciente> pacienteExistente = repository.findByTokenInvitacion(token);
        if (pacienteExistente.isPresent() && pacienteExistente.get().getSeudonimo() != null) {
            throw new RuntimeException("Este paciente ya tiene un seudónimo asignado");
        }

        // Luego:

        // 1. Buscamos al paciente por su token único
        Optional<Paciente> pacienteOpt = repository.findByTokenInvitacion(token);
        System.out.println("Paciente encontrado: " + pacienteOpt.isPresent());

        Paciente paciente = pacienteOpt.orElseGet(() -> {
            System.out.println("Creando paciente temporal...");
            Paciente nuevo = new Paciente();
            nuevo.setTokenInvitacion(token);
            nuevo.setNombreCompleto("Temporal");
            return repository.save(nuevo);
        });

        System.out.println("Paciente ID: " + paciente.getId());
        System.out.println("Paciente Nombre: " + paciente.getNombreCompleto());

        // 2. Buscamos el seudónimo que quiere
        Seudonimo seudonimo = seudonimoRepository.findById(idSeudonimo)
                .orElseThrow(() -> new RuntimeException("Seudónimo no encontrado"));

        System.out.println("Seudónimo encontrado: " + seudonimo.getAlias());
        System.out.println("Seudónimo disponible: " + seudonimo.isDisponible());

        // 3. Verificamos que nadie se lo haya ganado
        if (!seudonimo.isDisponible()) {
            System.out.println("ERROR: Seudónimo ya está ocupado");
            throw new RuntimeException("El seudónimo ya está ocupado");
        }

        // 4. Hacemos el Match
        paciente.setSeudonimo(seudonimo);
        seudonimo.setDisponible(false); // Ya no está disponible para otros

        System.out.println("Asignando seudónimo al paciente...");

        // 5. Guardamos los cambios
        seudonimoRepository.save(seudonimo);
        Paciente savedPaciente = repository.save(paciente);

        System.out.println("Paciente guardado. Seudónimo ID: " + savedPaciente.getSeudonimo().getId());
        System.out.println("=== VINCULACIÓN COMPLETADA ===");
    }

    // En PacienteService.java, agregar este método:
    public Optional<Paciente> verificarToken(String token) {
        System.out.println("=== VERIFICANDO TOKEN ===");
        System.out.println("Token: " + token);

        // Buscar paciente por token
        Optional<Paciente> pacienteOpt = repository.findByTokenInvitacion(token);

        if (pacienteOpt.isPresent()) {
            Paciente paciente = pacienteOpt.get();
            System.out.println("Paciente encontrado: " + paciente.getNombreCompleto());
            System.out.println("Tiene seudónimo: " + (paciente.getSeudonimo() != null));

            if (paciente.getSeudonimo() != null) {
                System.out.println("Seudónimo asignado: " + paciente.getSeudonimo().getAlias());
            }
        } else {
            System.out.println("Paciente no encontrado con token: " + token);
        }

        return pacienteOpt;
    }
}