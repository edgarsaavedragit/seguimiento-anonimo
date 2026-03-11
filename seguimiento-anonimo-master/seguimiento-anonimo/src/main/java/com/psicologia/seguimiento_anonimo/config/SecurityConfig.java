package com.psicologia.seguimiento_anonimo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. PRIMERO: Habilitar CORS
                .cors(Customizer.withDefaults())
                
                // 2. Desactivar CSRF
                .csrf(csrf -> csrf.disable())

                // 3. Configurar reglas de acceso
                .authorizeHttpRequests(auth -> auth
                        // Rutas públicas (pacientes)
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/encuestas/**").permitAll()

                        // Rutas privadas (admin) - requieren autenticación
                        .requestMatchers("/api/admin/**").authenticated()

                        // Cualquier otra petición requiere autenticación
                        .anyRequest().authenticated()
                )
                // 4. Usar autenticación básica
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    // 5. Configurar CORS específicamente
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Permitir estos orígenes (frontend)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000", 
            "http://127.0.0.1:3000",
            "http://localhost:5500", 
            "http://127.0.0.1:5500",
            "http://localhost:8081",
            "http://127.0.0.1:8081"
        ));
        
        // Permitir estos métodos HTTP
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Permitir estos headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Exponer estos headers en la respuesta
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials",
            "Authorization"
        ));
        
        // Permitir credenciales (cookies, auth headers)
        configuration.setAllowCredentials(false);
        
        // Tiempo de caché para preflight requests
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // 6. Definir usuario administrador
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails admin = User.builder()
                .username("sofi")      // USUARIO para login
                .password("{noop}secure123")        // CONTRASEÑA
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(admin);
    }
}