package com.psicologia.seguimiento_anonimo.model;

import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Datos privados
    private String nombreCompleto;
    private String email;
    private String celular;

    // Token único
    private String tokenInvitacion;

    @OneToOne
    @JoinColumn(name = "seudonimo_id")
    private Seudonimo seudonimo;

    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL)
    @JsonIgnore 
    private List<Encuesta> encuestas;

    // --- GETTERS Y SETTERS MANUALES ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCelular() {
        return celular;
    }

    public void setCelular(String celular) {
        this.celular = celular;
    }

    public String getTokenInvitacion() {
        return tokenInvitacion;
    }

    public void setTokenInvitacion(String tokenInvitacion) {
        this.tokenInvitacion = tokenInvitacion;
    }

    public Seudonimo getSeudonimo() {
        return seudonimo;
    }

    public void setSeudonimo(Seudonimo seudonimo) {
        this.seudonimo = seudonimo;
    }

    public List<Encuesta> getEncuestas() {
        return encuestas;
    }

    public void setEncuestas(List<Encuesta> encuestas) {
        this.encuestas = encuestas;
    }
}