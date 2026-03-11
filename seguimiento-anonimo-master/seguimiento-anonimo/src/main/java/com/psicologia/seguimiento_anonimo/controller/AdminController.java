package com.psicologia.seguimiento_anonimo.controller;

import com.psicologia.seguimiento_anonimo.model.Paciente;
import com.psicologia.seguimiento_anonimo.model.Seudonimo;
import com.psicologia.seguimiento_anonimo.repository.PacienteRepository;
import com.psicologia.seguimiento_anonimo.repository.SeudonimoRepository;
import com.psicologia.seguimiento_anonimo.service.PacienteService;
import com.psicologia.seguimiento_anonimo.service.SeudonimoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private SeudonimoService seudonimoService;

    @Autowired
    private PacienteService pacienteService;

    @Autowired // <-- AGREGAR ESTO
    private PacienteRepository pacienteRepository;

    @Autowired // <-- AGREGAR ESTO
    private SeudonimoRepository seudonimoRepository;

    // FASE 1: Carga masiva de seudónimos
    @PostMapping("/seudonimos/carga")
    public ResponseEntity<?> cargarSeudonimos(@RequestBody List<String> nombres) {
        try {
            seudonimoService.guardarMasivos(nombres);
            return ResponseEntity.ok("");

        } catch (DataIntegrityViolationException e) {
            // Capturar error de UNIQUE constraint de la BD
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Se encontraron duplicados en la base de datos");
            errorResponse.put("duplicateError", true);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (RuntimeException e) {
            // Capturar el error de duplicado de tu servicio
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", e.getMessage()); // Este es tu mensaje "Se encontraron duplicados..."
            errorResponse.put("duplicateError", true);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Error interno del servidor");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // FASE 1: Registrar Paciente
    @PostMapping("/pacientes/nuevo")
    public Map<String, Object> registrarPaciente(@RequestBody Paciente paciente) {
        Paciente guardado = pacienteService.registrarPaciente(paciente);
        String link = "https://misistema.com/invitacion/" + guardado.getTokenInvitacion();

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("idPaciente", guardado.getId());
        respuesta.put("linkInvitacion", link);
        return respuesta;
    }

    // Listar TODOS los seudónimos (para admin)
    @GetMapping("/seudonimos/listar")
    public List<Seudonimo> listarTodosSeudonimos() {
        return seudonimoService.listarTodos();
    }

    // Eliminar un seudónimo individual
    @DeleteMapping("/seudonimos/{id}")
    public ResponseEntity<Map<String, Object>> eliminarSeudonimo(@PathVariable Long id) {
        Map<String, Object> respuesta = new HashMap<>();

        try {
            seudonimoService.eliminarSeudonimo(id);

            respuesta.put("success", true);
            respuesta.put("message", "Seudónimo eliminado correctamente");
            respuesta.put("id", id);

            return ResponseEntity.ok(respuesta);

        } catch (RuntimeException e) {
            respuesta.put("success", false);
            respuesta.put("error", e.getMessage());
            respuesta.put("id", id);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }
    }

    // Eliminar TODOS los seudónimos DISPONIBLES
    @DeleteMapping("/seudonimos/eliminar-todos")
    public ResponseEntity<Map<String, Object>> eliminarTodosSeudonimos() {
        Map<String, Object> respuesta = new HashMap<>();

        try {
            int eliminados = seudonimoService.eliminarTodosSeudonimos();

            if (eliminados == 0) {
                respuesta.put("success", true);
                respuesta.put("message", "No hay seudónimos disponibles para eliminar. " +
                        "Los seudónimos asignados a pacientes no se pueden eliminar.");
                respuesta.put("totalEliminados", 0);
                respuesta.put("advertencia", "Solo se eliminan seudónimos disponibles (no asignados)");
            } else {
                respuesta.put("success", true);
                respuesta.put("message", "Se eliminaron " + eliminados + " seudónimos disponibles");
                respuesta.put("totalEliminados", eliminados);
            }

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            respuesta.put("success", false);
            respuesta.put("error", "Error al eliminar: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(respuesta);
        }
    }

    // Listar pacientes recientes
    @GetMapping("/pacientes/recientes")
    public List<Paciente> listarPacientesRecientes() {
        // Obtener últimos 5 pacientes registrados
        return pacienteRepository.findTop5ByOrderByIdDesc();
    }

    // Eliminar paciente
    @DeleteMapping("/pacientes/{id}")
    public ResponseEntity<Map<String, Object>> eliminarPaciente(@PathVariable Long id) {
        Map<String, Object> respuesta = new HashMap<>();

        try {
            // Verificar si el paciente existe
            Paciente paciente = pacienteRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

            // Verificar si tiene seudónimo asignado
            if (paciente.getSeudonimo() != null) {
                // Desvincular el seudónimo primero
                Seudonimo seudonimo = paciente.getSeudonimo();
                seudonimo.setDisponible(true);
                seudonimoRepository.save(seudonimo);
            }

            // Eliminar el paciente
            pacienteRepository.delete(paciente);

            respuesta.put("success", true);
            respuesta.put("message", "Paciente eliminado correctamente");
            respuesta.put("id", id);

            return ResponseEntity.ok(respuesta);

        } catch (RuntimeException e) {
            respuesta.put("success", false);
            respuesta.put("error", e.getMessage());
            respuesta.put("id", id);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }
    }
}