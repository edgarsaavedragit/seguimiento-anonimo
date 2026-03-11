package com.psicologia.seguimiento_anonimo.service;

import com.psicologia.seguimiento_anonimo.model.Seudonimo;
import com.psicologia.seguimiento_anonimo.repository.SeudonimoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SeudonimoService {

    @Autowired
    private SeudonimoRepository repository;

    // Obtener solo los seudónimos disponibles
    public List<Seudonimo> listarDisponibles() {
        return repository.findByDisponibleTrue();
    }

    // Guardar seudónimos masivamente
    public void guardarMasivos(List<String> listaNombres) {
        List<String> duplicados = new ArrayList<>();
        List<String> procesados = new ArrayList<>();

        for (String nombre : listaNombres) {
            if (!nombre.trim().isEmpty()) {
                String nombreLimpio = nombre.trim();

                // Verificar si ya existe en la lista que estamos procesando (dentro del mismo
                // lote)
                boolean duplicadoEnLote = procesados.stream()
                        .anyMatch(proc -> proc.equalsIgnoreCase(nombreLimpio));

                if (duplicadoEnLote) {
                    duplicados.add(nombreLimpio + " (duplicado en este lote)");
                    continue; // Saltar este duplicado en lote
                }

                // Verificar si ya existe en la base de datos (ignorando mayúsculas)
                boolean existeEnBD = false;
                String nombreExistente = null;

                for (Seudonimo s : repository.findAll()) {
                    if (s.getAlias().equalsIgnoreCase(nombreLimpio)) {
                        existeEnBD = true;
                        nombreExistente = s.getAlias(); // Guardar el nombre EXACTO que ya existe
                        break;
                    }
                }

                if (existeEnBD) {
                    duplicados.add(nombreExistente);
                    continue; // Saltar este duplicado
                }

                // Si no es duplicado, procesarlo
                procesados.add(nombreLimpio);

                Seudonimo s = new Seudonimo();
                s.setAlias(nombreLimpio);
                s.setDisponible(true);
                repository.save(s);
            }
        }

        // Si hay duplicados, lanzar excepción con la lista completa
        if (!duplicados.isEmpty()) {
            StringBuilder mensaje = new StringBuilder();
            mensaje.append("Se encontraron duplicados:\n");

            for (String dup : duplicados) {
                mensaje.append(dup).append(" ,").append("\n");
            }

            if (!procesados.isEmpty()) {
                mensaje.append("\n✅ Se agregaron correctamente: ").append(procesados.size()).append(" seudónimos.");
            } else {
                mensaje.append("\n❌No se agregó ningún seudónimo.");
            }

            throw new RuntimeException(mensaje.toString());
        }
    }

    // Obtener TODOS los seudónimos
    public List<Seudonimo> listarTodos() {
        return repository.findAllByOrderByIdAsc();
    }

    // Eliminar un seudónimo individual
    @Transactional
    public void eliminarSeudonimo(Long id) {
        Seudonimo seudonimo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seudónimo no encontrado con ID: " + id));

        // Verificar si está asignado a un paciente (disponible = false)
        if (!seudonimo.isDisponible()) {
            throw new RuntimeException("No se puede eliminar. El seudónimo '" +
                    seudonimo.getAlias() + "' está asignado a un paciente.");
        }

        // Eliminar de la base de datos
        repository.delete(seudonimo);
    }

    // Eliminar TODOS los seudónimos DISPONIBLES
    @Transactional
    public int eliminarTodosSeudonimos() {
        // Obtener solo seudónimos disponibles
        List<Seudonimo> disponibles = repository.findByDisponibleTrue();
        int totalDisponibles = disponibles.size();

        // Eliminar solo los disponibles
        if (totalDisponibles > 0) {
            repository.deleteAll(disponibles);
        }

        // Retornar cuántos se eliminaron
        return totalDisponibles;
    }
}