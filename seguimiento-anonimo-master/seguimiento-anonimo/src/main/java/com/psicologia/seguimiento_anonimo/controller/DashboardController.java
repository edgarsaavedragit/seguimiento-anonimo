package com.psicologia.seguimiento_anonimo.controller;

import com.psicologia.seguimiento_anonimo.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // 1. Ver Semáforo General
    @GetMapping("/semaforo")
    public List<Map<String, Object>> verSemaforo() {
        return dashboardService.calcularSemaforo();
    }

    // 2. Ver Detalle de un Paciente (Historial)
    @GetMapping("/detalle/{alias}")
    public List<Map<String, Object>> verDetalle(@PathVariable String alias) {
        return dashboardService.obtenerHistorial(alias);
    }

    // === NUEVOS ENDPOINTS PARA DASHBOARD ===
    
    // 3. Obtener Estadísticas Generales
    @GetMapping("/estadisticas")
    public Map<String, Object> obtenerEstadisticas() {
        return dashboardService.obtenerEstadisticas();
    }
    
    // 4. Obtener Actividad Reciente
    @GetMapping("/actividad")
    public List<Map<String, Object>> obtenerActividadReciente() {
        return dashboardService.obtenerActividadReciente();
    }
}