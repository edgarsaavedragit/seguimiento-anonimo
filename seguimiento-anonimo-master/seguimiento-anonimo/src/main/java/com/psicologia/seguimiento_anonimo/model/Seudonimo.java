package com.psicologia.seguimiento_anonimo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "seudonimo")
public class Seudonimo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String alias;

    @Column(nullable = false)
    private boolean disponible = true;

    // Constructores
    public Seudonimo() {}

    public Seudonimo(String alias) {
        this.alias = alias;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }
    
    public boolean isDisponible() { return disponible; }
    public void setDisponible(boolean disponible) { this.disponible = disponible; }
}