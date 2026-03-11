package com.psicologia.seguimiento_anonimo.controller;

import com.psicologia.seguimiento_anonimo.service.EncuestaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/encuestas")
@CrossOrigin(origins = "*")
public class EncuestaController {

    @Autowired
    private EncuestaService encuestaService;

    @PostMapping("/guardar")
    public ResponseEntity<?> guardar(@RequestBody Map<String, Object> datos) {
        try {
            String alias = (String) datos.get("aliasPaciente");
            int ejeClinico = Integer.parseInt(datos.get("ejeClinico").toString());
            int ejeServicio = Integer.parseInt(datos.get("ejeServicio").toString());
            String ejeCualitativo = (String) datos.get("ejeCualitativo");

            encuestaService.guardarEncuesta(alias, ejeClinico, ejeServicio, ejeCualitativo);

            return ResponseEntity.ok("Encuesta guardada correctamente");

        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error interno del servidor");
        }
    }
}