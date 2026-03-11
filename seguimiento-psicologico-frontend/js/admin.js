// Lógica para el panel de administración
document.addEventListener('DOMContentLoaded', function () {
    // Inicializar dashboard si estamos en esa página
    if (document.querySelector('.admin-container')) {
        initializeDashboard();
    }

    // Inicializar formulario de carga de seudónimos
    const loadNamesForm = document.getElementById('loadNamesForm');
    if (loadNamesForm) {
        loadNamesForm.addEventListener('submit', handleLoadNames);
    }

    // Inicializar formulario de registro de paciente
    const registerPatientForm = document.getElementById('registerPatientForm');
    if (registerPatientForm) {
        registerPatientForm.addEventListener('submit', handleRegisterPatient);
    }

    // Inicializar semáforo si estamos en esa página
    if (document.getElementById('semaphoreContainer')) {
        loadSemaphoreData();
    }
});

// Dashboard - Cargar datos iniciales CON DATOS REALES
async function initializeDashboard() {
    try {
        console.log('Inicializando dashboard con datos reales...');
        
        // 1. Obtener estadísticas reales del backend
        const stats = await adminAPI.getDashboardStats();
        console.log('Estadísticas obtenidas:', stats);
        
        // Actualizar estadísticas en el dashboard
        updateDashboardStats(stats);
        
        // 2. Obtener actividad reciente real del backend
        const recentActivity = await adminAPI.getRecentActivity();
        console.log('Actividad reciente obtenida:', recentActivity);
        
        // Actualizar actividad reciente
        updateRecentActivity(recentActivity);

    } catch (error) {
        console.error('Error al inicializar dashboard:', error);
        showNotification('Error al cargar datos del dashboard: ' + error.message, 'error');
        
        // En caso de error, mostrar datos por defecto
        updateDashboardStats({
            pacientesActivos: 0,
            encuestasHoy: 0,
            alertasActivas: 0,
            seudonimosDisponibles: 0
        });
    }
}

// Actualizar estadísticas del dashboard CON DATOS REALES
function updateDashboardStats(data) {
    console.log('Actualizando estadísticas con:', data);
    
    // Mapear nombres de campos del backend a los IDs del frontend
    const fieldMapping = {
        'activePatients': 'pacientesActivos',
        'todaySurveys': 'encuestasHoy',
        'activeAlerts': 'alertasActivas',
        'availablePseudonyms': 'seudonimosDisponibles'
    };
    
    // Para compatibilidad: si data viene con nombres nuevos, usarlos; si no, buscar nombres viejos
    Object.keys(fieldMapping).forEach(frontendId => {
        const el = document.getElementById(frontendId);
        if (el) {
            // Intentar con el nombre del backend primero
            let value = data[fieldMapping[frontendId]];
            
            // Si no existe, intentar con el nombre del frontend
            if (value === undefined) {
                value = data[frontendId];
            }
            
            // Si aún no existe, usar 0
            el.textContent = value !== undefined ? value : '0';
        }
    });
}

// Actualizar actividad reciente CON DATOS REALES
function updateRecentActivity(activities) {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    if (!activities || activities.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state-small">
                <p>No hay actividad reciente</p>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.tipo}">
                ${activity.icono || '📝'}
            </div>
            <div class="activity-content">
                <h4>${activity.titulo}</h4>
                <p>${activity.descripcion}</p>
                <small>${activity.hace || 'Recién'}</small>
            </div>
        </div>
    `).join('');
}


// Simular datos del semáforo (para desarrollo)
async function simulateSemaphoreData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                activePatients: 12,
                todaySurveys: 3,
                activeAlerts: 2,
                availablePseudonyms: 8,
                semaphore: {
                    red: [
                        { name: "Tormenta", realName: "Carlos M.", lastScore: 3.2 },
                        { name: "Noche", realName: "María L.", lastScore: 4.1 }
                    ],
                    orange: [
                        { name: "Montaña", realName: "Ana R.", lastScore: 6.5 },
                        { name: "Bosque", realName: "Luis P.", lastScore: 5.8 },
                        { name: "Océano", realName: "Sofía G.", lastScore: 6.9 }
                    ],
                    green: [
                        { name: "Sol", realName: "Juan C.", lastScore: 8.5 },
                        { name: "Río", realName: "Laura M.", lastScore: 9.2 },
                        { name: "Estrella", realName: "Pedro V.", lastScore: 7.8 }
                    ]
                }
            });
        }, 500);
    });
}

// Manejar carga de seudónimos
async function handleLoadNames(e) {
    e.preventDefault();

    const namesInput = document.getElementById('pseudonyms');
    const names = namesInput.value.split(',').map(name => name.trim()).filter(name => name);

    if (names.length === 0) {
        showNotification('Por favor ingresa al menos un seudónimo', 'warning');
        return;
    }

    try {
        // LLAMAR A LA API REAL
        await adminAPI.loadPseudonyms(names);
        showNotification(`Se cargaron ${names.length} seudónimos exitosamente`, 'success');
        namesInput.value = '';

        // Actualizar la vista con datos REALES del backend
        setTimeout(() => {
            loadAvailablePseudonyms(); // O recargar la página
        }, 500);

    } catch (error) {
        console.error('Error al cargar seudónimos:', error);
        showNotification('Error al cargar seudónimos: ' + error.message, 'error');
    }
}

// Mostrar seudónimos cargados
function displayLoadedPseudonyms(names) {
    const container = document.getElementById('loadedPseudonyms');
    if (!container) return;

    container.innerHTML = names.map(name => `
        <div class="pseudonym-card">
            <div class="pseudonym-icon">☁️</div>
            <div class="pseudonym-name">${name}</div>
            <small>Disponible</small>
        </div>
    `).join('');
}

// Manejar registro de paciente
async function handleRegisterPatient(e) {
    e.preventDefault();

    const patientData = {
        nombreCompleto: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        celular: document.getElementById('phone').value
    };

    // Validación
    if (!patientData.nombreCompleto || !patientData.email || !patientData.celular) {
        showNotification('Por favor completa todos los campos', 'warning');
        return;
    }

    try {
        // LLAMAR AL BACKEND REAL
        const resultado = await adminAPI.registerPatient(patientData);
        console.log('✅ Backend respondió:', resultado);

        // Mostrar enlace REAL del backend
        if (resultado.linkInvitacion) {
            document.getElementById('invitationLink').value = resultado.linkInvitacion;
            document.getElementById('invitationSection').style.display = 'block';
        }

        // Resetear formulario
        e.target.reset();

    } catch (error) {
        console.error('❌ Error backend:', error);
        showNotification('Error al registrar paciente: ' + error.message, 'error');
    }
}

// Cargar datos del semáforo (DATOS REALES)
async function loadSemaphoreData() {
    try {
        // Mostrar loading
        const container = document.getElementById('semaphoreContainer');
        if (container) {
            container.innerHTML = '<div class="loading">Cargando datos del semáforo...</div>';
        }

        // USAR DATOS REALES DEL BACKEND
        const semaphoreData = await adminAPI.getSemaphore();

        // Transformar datos del backend al formato esperado
        const formattedData = {
            red: semaphoreData.filter(item => item.color === "ROJO"),
            orange: semaphoreData.filter(item => item.color === "NARANJA"),
            green: semaphoreData.filter(item => item.color === "VERDE")
        };

        // Renderizar semáforo con datos REALES
        renderSemaphore(formattedData);

    } catch (error) {
        console.error('Error al cargar semáforo:', error);
        showNotification('Error al cargar datos del semáforo: ' + error.message, 'error');
    }
}

// Renderizar semáforo - NUEVA VERSIÓN CON TARJETAS
function renderSemaphore(semaphoreData) {
    const container = document.getElementById('semaphoreContainer');
    if (!container) return;

    // Juntar todos los pacientes
    const todosPacientes = [
        ...semaphoreData.red,
        ...semaphoreData.orange, 
        ...semaphoreData.green
    ];

    if (todosPacientes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">😊</div>
                <h3>No hay pacientes registrados</h3>
                <p>Registra pacientes y ellos completarán encuestas para verlos aquí.</p>
            </div>
        `;
        return;
    }

    // Crear grid de tarjetas
    container.innerHTML = `
        <div class="tarjetas-grid">
            ${todosPacientes.map(paciente => crearTarjetaPaciente(paciente)).join('')}
        </div>
    `;
}

// En admin.js, BUSCA la función de logout o créala si no existe:
function adminLogout() {
    if (confirm('¿Estás segura de que deseas cerrar sesión?')) {
        // Limpiar datos de admin
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminToken');
        
        // Limpiar datos de paciente también (por seguridad)
        clearPatientData();
        
        // Redirigir a login
        window.location.href = '../auth/login.html';
    }
}

// Asegúrate de que esta función esté disponible globalmente
window.adminLogout = adminLogout;

// Crear tarjeta individual de paciente
function crearTarjetaPaciente(paciente) {
    // Determinar color de fondo según estado
    const colorFondo = paciente.color === 'ROJO' ? '#e63946' : 
                      paciente.color === 'NARANJA' ? '#ff9f1c' : 
                      '#2a9d8f';
    
    // Determinar ícono y texto de tendencia
    let tendenciaIcono = '➡️';
    let tendenciaClase = 'estable';
    let tendenciaTexto = 'Estable';
    
    if (paciente.tendencia === 'MEJORANDO') {
        tendenciaIcono = '↗️';
        tendenciaClase = 'ascendente';
        tendenciaTexto = 'Ascendente';
    } else if (paciente.tendencia === 'EMPEORANDO') {
        tendenciaIcono = '↘️';
        tendenciaClase = 'descendente';
        tendenciaTexto = 'Descendente';
    }
    
    // Formatear fecha
    let fechaTexto = 'Sin encuestas';
    if (paciente.ultimaFecha) {
        const fecha = new Date(paciente.ultimaFecha);
        const hoy = new Date();
        const diasDiferencia = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
        
        if (diasDiferencia === 0) fechaTexto = 'Hoy';
        else if (diasDiferencia === 1) fechaTexto = 'Ayer';
        else fechaTexto = `Hace ${diasDiferencia} días`;
        
        // Agregar fecha exacta como tooltip
        const fechaExacta = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    const botonPrincipalClase = paciente.color === 'ROJO' ? 'btn-danger' : 'btn-success';
    
    // Asegurar que email y celular sean strings seguros para JS
    const emailSeguro = paciente.email ? paciente.email.replace(/'/g, "\\'") : '';
    const celularSeguro = paciente.celular ? paciente.celular.replace(/'/g, "\\'") : '';
    
    return `
    <div class="tarjeta-paciente">
        <div class="tarjeta-header" style="background-color: ${colorFondo};">
            <h3>${paciente.seudonimo}</h3>
            <span class="puntuacion">${paciente.promedio.toFixed(1)}</span>
        </div>
        
        <div class="tarjeta-body">
            <p><strong>Última encuesta:</strong> ${fechaTexto}</p>
            <p class="tendencia">
                <strong>Tendencia:</strong> 
                <span class="tendencia-icono ${tendenciaClase}">${tendenciaIcono}</span>
                ${tendenciaTexto}
            </p>
            
            <hr>
            
            ${paciente.ultimoComentario ? `
            <p class="comentario">
                <em>Comentario reciente:</em>
                <span>"${paciente.ultimoComentario}"</span>
            </p>
            ` : '<p class="comentario vacio">Sin comentarios recientes</p>'}
            
            <div class="tarjeta-acciones">
                <button class="btn btn-secondary" 
                        onclick="verHistorial('${paciente.seudonimo}')">
                    Ver Historial
                </button>
            </div>
            
            ${paciente.alerta ? `
            <div class="alerta-tarjeta">
                ${paciente.alerta}
            </div>
            ` : ''}
        </div>
    </div>
    `;
}

// Función global para contactar paciente (se llama desde el HTML)
function contactarPaciente(email, celular) {
    const modal = document.getElementById('contactModal');
    const contactInfo = document.getElementById('contactInfo');
    
    let html = '<div class="contacto-detalle">';
    if (email) {
        html += `<p><strong>📧 Email:</strong> <span class="contacto-valor">${email}</span></p>`;
    }
    if (celular) {
        html += `<p><strong>📱 Teléfono:</strong> <span class="contacto-valor">${celular}</span></p>`;
    }
    if (!email && !celular) {
        html = '<p class="sin-contacto">No hay información de contacto disponible.</p>';
    }
    html += '</div>';
    
    contactInfo.innerHTML = html;
    modal.style.display = 'block';
}

// Función global para ver historial
function verHistorial(alias) {
    // Redirigir a la página de historial con el alias como parámetro
    window.location.href = `history.html?alias=${encodeURIComponent(alias)}`;
}

// Función global para cerrar modal
function cerrarModal() {
    document.getElementById('contactModal').style.display = 'none';
}

// Mostrar notificaciones
function showNotification(message, type) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    // Estilos según tipo
    const bgColors = {
        success: '#2a9d8f',
        error: '#e63946',
        warning: '#ff9f1c',
        info: '#4a6fa5'
    };

    notification.style.backgroundColor = bgColors[type] || bgColors.info;

    // Añadir al documento
    document.body.appendChild(notification);

    // Remover después de 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);

    // Añadir estilos de animación si no existen
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}