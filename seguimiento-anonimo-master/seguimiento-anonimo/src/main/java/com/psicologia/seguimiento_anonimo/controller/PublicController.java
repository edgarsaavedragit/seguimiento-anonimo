package com.psicologia.seguimiento_anonimo.controller;

import com.psicologia.seguimiento_anonimo.model.Paciente;
import com.psicologia.seguimiento_anonimo.model.Seudonimo;
import com.psicologia.seguimiento_anonimo.service.SeudonimoService;
import com.psicologia.seguimiento_anonimo.service.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional; 

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {

    @Autowired
    private SeudonimoService seudonimoService;

    @Autowired
    private PacienteService pacienteService;

    // FASE 2: Listar solo los disponibles (Para las Cards)
    @GetMapping("/seudonimos/disponibles")
    public List<Seudonimo> obtenerDisponibles(@RequestParam(required = false) String token) {
        // token es opcional para compatibilidad
        return seudonimoService.listarDisponibles();
    }

    // FASE 2: El paciente elige su nombre (Match)
    @PostMapping("/seudonimos/vincular")
    public String vincularPaciente(@RequestBody Map<String, Object> datos) {
        String token = (String) datos.get("tokenInvitacion");

        // Manejo seguro de la conversión de ID
        Long idSeudonimo;
        Object idObj = datos.get("idSeudonimo");

        if (idObj instanceof Number) {
            idSeudonimo = ((Number) idObj).longValue();
        } else if (idObj instanceof String) {
            idSeudonimo = Long.parseLong((String) idObj);
        } else {
            throw new IllegalArgumentException("ID de seudónimo no válido");
        }

        pacienteService.vincularPaciente(token, idSeudonimo);
        return "Vinculación exitosa. Ahora eres anónimo.";
    }

    // NUEVO: Verificar si token ya tiene seudónimo
    @PostMapping("/paciente/verificar")
    public Map<String, Object> verificarToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        Map<String, Object> respuesta = new HashMap<>();

        Optional<Paciente> pacienteOpt = pacienteService.verificarToken(token);

        if (pacienteOpt.isPresent()) {
            Paciente paciente = pacienteOpt.get();
            respuesta.put("existe", true);
            respuesta.put("tieneSeudonimo", paciente.getSeudonimo() != null);

            if (paciente.getSeudonimo() != null) {
                respuesta.put("alias", paciente.getSeudonimo().getAlias());
                respuesta.put("idSeudonimo", paciente.getSeudonimo().getId());
            }
        } else {
            respuesta.put("existe", false);
            respuesta.put("tieneSeudonimo", false);
        }

        return respuesta;
    }
}
