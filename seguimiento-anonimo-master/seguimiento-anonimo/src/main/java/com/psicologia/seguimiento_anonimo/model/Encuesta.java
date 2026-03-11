package com.psicologia.seguimiento_anonimo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Encuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fecha;
    private int ejeClinico;
    private int ejeServicio;

    @Column(length = 1000)
    private String ejeCualitativo;

    @ManyToOne(optional = true) 
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @PrePersist
    public void prePersist() {
        this.fecha = LocalDateTime.now();
    }

    // --- GETTERS Y SETTERS MANUALES ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }

    public int getEjeClinico() { return ejeClinico; }
    public void setEjeClinico(int ejeClinico) { this.ejeClinico = ejeClinico; }

    public int getEjeServicio() { return ejeServicio; }
    public void setEjeServicio(int ejeServicio) { this.ejeServicio = ejeServicio; }

    public String getEjeCualitativo() { return ejeCualitativo; }
    public void setEjeCualitativo(String ejeCualitativo) { this.ejeCualitativo = ejeCualitativo; }

    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente paciente) { this.paciente = paciente; }
}