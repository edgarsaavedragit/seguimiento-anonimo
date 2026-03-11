package com.psicologia.seguimiento_anonimo.service;

import com.psicologia.seguimiento_anonimo.model.Encuesta;
import com.psicologia.seguimiento_anonimo.model.Paciente;
import com.psicologia.seguimiento_anonimo.repository.EncuestaRepository;
import com.psicologia.seguimiento_anonimo.repository.PacienteRepository;
import com.psicologia.seguimiento_anonimo.repository.SeudonimoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private EncuestaRepository encuestaRepository;

    @Autowired
    private SeudonimoRepository seudonimoRepository;

    // === MÉTODO EXISTENTE: SEMÁFORO ===
    public List<Map<String, Object>> calcularSemaforo() {
        // ... (mantener el código existente igual) ...
        List<Map<String, Object>> reporteGeneral = new ArrayList<>();

        // 1. Traemos a todos los pacientes
        List<Paciente> pacientes = pacienteRepository.findAll();

        for (Paciente p : pacientes) {
            // Solo nos interesan los que ya tienen alias (ya se vincularon)
            if (p.getSeudonimo() != null) {

                // 2. Buscamos sus encuestas ordenadas por fecha (más reciente primero)
                List<Encuesta> encuestas = encuestaRepository.findByPacienteOrderByFechaDesc(p);

                double promedio = 0.0;
                String color = "GRIS";
                String tendencia = "ESTABLE";
                List<Integer> historial = new ArrayList<>();
                LocalDateTime ultimaFecha = null;
                String ultimoComentario = "";
                String alerta = "";

                if (!encuestas.isEmpty()) {
                    // 3. Tomar solo las últimas 4 encuestas (último mes)
                    int limite = Math.min(encuestas.size(), 4);
                    List<Encuesta> ultimasEncuestas = encuestas.subList(0, limite); // Ya están ordenadas desc

                    // 4. Calcular promedio solo de las últimas 4
                    int suma = 0;
                    for (Encuesta e : ultimasEncuestas) {
                        suma += e.getEjeClinico();
                        historial.add(e.getEjeClinico());
                    }
                    promedio = (double) suma / ultimasEncuestas.size();

                    // 5. Decidir el COLOR basado en promedio de últimas 4
                    if (promedio < 5) {
                        color = "ROJO"; // Alerta
                    } else if (promedio <= 7) {
                        color = "NARANJA"; // Regular
                    } else {
                        color = "VERDE"; // Bienestar
                    }

                    // 6. Calcular TENDENCIA (comparar últimas 2 encuestas)
                    if (encuestas.size() >= 2) {
                        Encuesta ultima = encuestas.get(0); // Más reciente
                        Encuesta penultima = encuestas.get(1); // Segunda más reciente

                        int diferencia = ultima.getEjeClinico() - penultima.getEjeClinico();

                        if (diferencia > 1) {
                            tendencia = "MEJORANDO";
                        } else if (diferencia < -1) {
                            tendencia = "EMPEORANDO";
                        } else {
                            tendencia = "ESTABLE";
                        }
                    }

                    // 7. Obtener fecha de la última encuesta
                    ultimaFecha = encuestas.get(0).getFecha();

                    // 8. Obtener último comentario (si existe)
                    String comentarioCompleto = encuestas.get(0).getEjeCualitativo();
                    if (comentarioCompleto != null && !comentarioCompleto.trim().isEmpty()) {
                        // Limitar a 100 caracteres
                        ultimoComentario = comentarioCompleto.trim();
                        if (ultimoComentario.length() > 100) {
                            ultimoComentario = ultimoComentario.substring(0, 100) + "...";
                        }
                    }

                    // 9. Determinar alerta
                    if (promedio < 3) {
                        alerta = "🚨 CRÍTICO";
                    } else if (promedio < 5) {
                        alerta = "🔴 ALTA PRIORIDAD";
                    }
                } else {
                    // Si no hay encuestas
                    alerta = "⚠️ SIN ENCUESTAS";
                }

                // 10. Preparar la fila del reporte con TODOS los datos
                Map<String, Object> fila = new HashMap<>();
                fila.put("nombreReal", p.getNombreCompleto());
                fila.put("seudonimo", p.getSeudonimo().getAlias());
                fila.put("promedio", Math.round(promedio * 10.0) / 10.0); // Redondear a 1 decimal
                fila.put("color", color);
                fila.put("tendencia", tendencia);
                fila.put("historial", historial); // Últimas 4 puntuaciones (más reciente primero)
                fila.put("totalEncuestas", encuestas.size());
                fila.put("ultimaFecha", ultimaFecha);
                fila.put("email", p.getEmail());
                fila.put("celular", p.getCelular());
                fila.put("ultimoComentario", ultimoComentario);
                fila.put("alerta", alerta);

                reporteGeneral.add(fila);
            }
        }

        // Ordenar por color (ROJO primero, luego NARANJA, luego VERDE)
        reporteGeneral.sort((a, b) -> {
            String colorA = (String) a.get("color");
            String colorB = (String) b.get("color");

            // Orden: ROJO (1), NARANJA (2), VERDE (3), GRIS (4)
            Map<String, Integer> orden = Map.of("ROJO", 1, "NARANJA", 2, "VERDE", 3, "GRIS", 4);
            return Integer.compare(orden.getOrDefault(colorA, 4), orden.getOrDefault(colorB, 4));
        });

        return reporteGeneral;
    }

    // === MÉTODO EXISTENTE: HISTORIAL ===
    public List<Map<String, Object>> obtenerHistorial(String alias) {
        Paciente p = pacienteRepository.findBySeudonimoAlias(alias)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        List<Encuesta> encuestas = encuestaRepository.findByPacienteOrderByFechaAsc(p);

        // Convertir a lista de maps para evitar recursión
        List<Map<String, Object>> resultado = new ArrayList<>();

        for (Encuesta encuesta : encuestas) {
            Map<String, Object> encuestaMap = new HashMap<>();
            encuestaMap.put("id", encuesta.getId());
            encuestaMap.put("fecha", encuesta.getFecha());
            encuestaMap.put("ejeClinico", encuesta.getEjeClinico());
            encuestaMap.put("ejeServicio", encuesta.getEjeServicio());
            encuestaMap.put("ejeCualitativo", encuesta.getEjeCualitativo());

            resultado.add(encuestaMap);
        }

        return resultado;
    }

    // === NUEVO MÉTODO: ESTADÍSTICAS DEL DASHBOARD ===
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> estadisticas = new HashMap<>();
        
        // 1. Pacientes activos (vinculados con seudónimo)
        long pacientesActivos = pacienteRepository.countBySeudonimoIsNotNull();
        estadisticas.put("pacientesActivos", pacientesActivos);
        
        // 2. Encuestas de hoy
        LocalDateTime inicioDelDia = LocalDate.now().atTime(LocalTime.MIN);
        long encuestasHoy = encuestaRepository.countByFechaAfter(inicioDelDia);
        estadisticas.put("encuestasHoy", encuestasHoy);
        
        // 3. Alertas activas (pacientes ROJO en semáforo)
        List<Map<String, Object>> semaforo = calcularSemaforo();
        long alertasActivas = semaforo.stream()
                .filter(p -> "ROJO".equals(p.get("color")))
                .count();
        estadisticas.put("alertasActivas", alertasActivas);
        
        // 4. Seudónimos disponibles
        long seudonimosDisponibles = seudonimoRepository.countByDisponibleTrue();
        estadisticas.put("seudonimosDisponibles", seudonimosDisponibles);
        
        // 5. Total de pacientes registrados
        long totalPacientes = pacienteRepository.count();
        estadisticas.put("totalPacientes", totalPacientes);
        
        // 6. Total de encuestas
        long totalEncuestas = encuestaRepository.count();
        estadisticas.put("totalEncuestas", totalEncuestas);
        
        return estadisticas;
    }

    // === NUEVO MÉTODO: ACTIVIDAD RECIENTE ===
    public List<Map<String, Object>> obtenerActividadReciente() {
        List<Map<String, Object>> actividad = new ArrayList<>();
        
        // 1. Últimas encuestas completadas (máximo 5)
        List<Encuesta> ultimasEncuestas = encuestaRepository.findTop5ByOrderByFechaDesc();
        
        for (Encuesta encuesta : ultimasEncuestas) {
            Map<String, Object> actividadItem = new HashMap<>();
            actividadItem.put("tipo", "encuesta");
            actividadItem.put("icono", "📝");
            actividadItem.put("titulo", "Nueva encuesta completada");
            
            // Obtener alias del paciente
            String alias = "Anónimo";
            if (encuesta.getPaciente() != null && encuesta.getPaciente().getSeudonimo() != null) {
                alias = encuesta.getPaciente().getSeudonimo().getAlias();
            }
            
            actividadItem.put("descripcion", alias + " completó su seguimiento semanal");
            actividadItem.put("puntuacion", encuesta.getEjeClinico());
            actividadItem.put("fecha", encuesta.getFecha());
            actividadItem.put("hace", calcularTiempoTranscurrido(encuesta.getFecha()));
            
            actividad.add(actividadItem);
        }
        
        // 2. Últimos pacientes registrados (máximo 3)
        List<Paciente> ultimosPacientes = pacienteRepository.findTop5ByOrderByIdDesc();
        
        for (Paciente paciente : ultimosPacientes) {
            // Solo agregar si tiene seudónimo (ya está activo)
            if (paciente.getSeudonimo() != null) {
                Map<String, Object> actividadItem = new HashMap<>();
                actividadItem.put("tipo", "registro");
                actividadItem.put("icono", "👤");
                actividadItem.put("titulo", "Nuevo paciente registrado");
                actividadItem.put("descripcion", paciente.getNombreCompleto() + 
                    " se registró como " + paciente.getSeudonimo().getAlias());
                actividadItem.put("fecha", LocalDateTime.now()); // Usar fecha de creación del paciente
                actividadItem.put("hace", "Recién");
                
                actividad.add(actividadItem);
            }
        }
        
        // 3. Ordenar por fecha (más reciente primero) y limitar a 5 items
        actividad.sort((a, b) -> {
            LocalDateTime fechaA = (LocalDateTime) a.get("fecha");
            LocalDateTime fechaB = (LocalDateTime) b.get("fecha");
            return fechaB.compareTo(fechaA); // Orden descendente
        });
        
        return actividad.stream().limit(5).collect(java.util.stream.Collectors.toList());
    }
    
    // Método auxiliar para calcular tiempo transcurrido
    private String calcularTiempoTranscurrido(LocalDateTime fecha) {
        if (fecha == null) return "Recién";
        
        LocalDateTime ahora = LocalDateTime.now();
        long minutos = java.time.Duration.between(fecha, ahora).toMinutes();
        
        if (minutos < 1) return "Hace un momento";
        if (minutos < 60) return "Hace " + minutos + " minutos";
        
        long horas = minutos / 60;
        if (horas < 24) return "Hace " + horas + " horas";
        
        long dias = horas / 24;
        if (dias == 1) return "Ayer";
        if (dias < 7) return "Hace " + dias + " días";
        
        long semanas = dias / 7;
        if (semanas == 1) return "Hace 1 semana";
        return "Hace " + semanas + " semanas";
    }
}