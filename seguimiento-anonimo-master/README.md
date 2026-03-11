# 🧠 Backend - Sistema de Seguimiento Psicológico Anónimo

Este repositorio contiene la **API REST** desarrollada con Java y Spring Boot para el sistema de monitoreo de pacientes. Su objetivo es permitir que una psicóloga evalúe el estado de sus pacientes mediante un sistema de semáforo de riesgo, manteniendo el anonimato de los usuarios mediante el uso de seudónimos.

## 🛠️ Tecnologías Utilizadas

* **Java 21**
* **Spring Boot 3+** (Web, Data JPA, Validation)
* **Spring Security** (Autenticación Básica)
* **MySQL** (Base de Datos Relacional)
* **Maven** (Gestor de dependencias)

## 🚀 Instalación y Configuración

Sigue estos pasos para levantar el servidor en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>

## Configuración de la base de datos
spring.datasource.url=jdbc:mysql://localhost:3306/psicologia_db
spring.datasource.username=root
spring.datasource.password=TU_CONTRASEÑA_DE_MYSQL <--- ¡Cambia esto por tu clave!

### Ejecutar el proyecto
mvn spring-boot:run
