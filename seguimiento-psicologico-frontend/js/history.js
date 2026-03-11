// Variables globales
let currentAlias = '';

// Cargar datos del paciente
async function cargarDatosPaciente(alias) {
    try {
        // Obtener todos los pacientes para encontrar este
        const semaphoreData = await adminAPI.getSemaphore();
        const paciente = semaphoreData.find(p => p.seudonimo === alias);
        
        if (!paciente) {
            showError('Paciente no encontrado');
            return;
        }
        
        // Actualizar título
        document.getElementById('pageTitle').textContent = `Historial de ${alias}`;
        
        // Actualizar información del paciente
        const patientInfo = document.getElementById('patientInfo');
        patientInfo.innerHTML = `
            <div class="patient-header">
                <div class="patient-avatar">${alias.charAt(0)}</div>
                <div class="patient-details">
                    <h2>${alias}</h2>
                </div>
                <div class="patient-status ${paciente.color.toLowerCase()}">
                    <span class="status-badge">${paciente.color}</span>
                    <span class="status-score">${paciente.promedio.toFixed(1)}</span>
                </div>
            </div>
        `;
        
        // Actualizar estadísticas
        document.getElementById('avgScore').textContent = paciente.promedio.toFixed(1);
        document.getElementById('totalSurveys').textContent = paciente.totalEncuestas || 0;
        document.getElementById('trend').textContent = paciente.tendencia;
        
    } catch (error) {
        console.error('Error cargando datos del paciente:', error);
        showError('Error al cargar datos del paciente');
    }
}

// Cargar historial del paciente
async function cargarHistorialPaciente(alias) {
    try {
        const container = document.getElementById('surveysContainer');
        
        // Obtener historial del backend
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/detalle/${encodeURIComponent(alias)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${btoa('sofi:secure123')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }
        
        const encuestas = await response.json();
        
        if (!encuestas || encuestas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No hay encuestas registradas</h3>
                    <p>Este paciente aún no ha completado ninguna encuesta.</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por fecha (más reciente primero)
        encuestas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        // Renderizar encuestas
        container.innerHTML = `
            <div class="surveys-table">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>📊 Eje Clínico</th>
                            <th>⭐ Eje Servicio</th>
                            <th>💬 Comentario</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${encuestas.map(encuesta => `
                            <tr>
                                <td class="fecha-col">
                                    ${new Date(encuesta.fecha).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                    <br>
                                    <small>
                                        ${new Date(encuesta.fecha).toLocaleTimeString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </small>
                                </td>
                                <td class="score-col">
                                    <div class="score-badge ${getScoreClass(encuesta.ejeClinico)}">
                                        ${encuesta.ejeClinico}
                                    </div>
                                </td>
                                <td class="score-col">
                                    <div class="score-badge ${getScoreClass(encuesta.ejeServicio)}">
                                        ${encuesta.ejeServicio}
                                    </div>
                                </td>
                                <td class="comment-col">
                                    ${encuesta.ejeCualitativo && encuesta.ejeCualitativo.trim() !== '' 
                                        ? `<p class="comment-preview">${truncateComment(encuesta.ejeCualitativo, 80)}</p>`
                                        : '<p class="no-comment">Sin comentario</p>'
                                    }
                                </td>
                                <td class="actions-col">
                                    ${encuesta.ejeCualitativo && encuesta.ejeCualitativo.trim() !== ''
                                        ? `<button class="btn btn-small" onclick="verComentarioCompleto('${encodeURIComponent(encuesta.ejeCualitativo)}')">
                                            Ver Completo
                                           </button>`
                                        : '<span class="no-action">-</span>'
                                    }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
    } catch (error) {
        console.error('Error cargando historial:', error);
        document.getElementById('surveysContainer').innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Error al cargar el historial</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Obtener clase CSS para puntuación
function getScoreClass(score) {
    if (score < 5) return 'score-low';
    if (score <= 7) return 'score-medium';
    return 'score-high';
}

// Truncar comentario
function truncateComment(comment, maxLength) {
    if (comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + '...';
}

// Ver comentario completo
function verComentarioCompleto(comentario) {
    const decodedComment = decodeURIComponent(comentario);
    document.getElementById('fullComment').textContent = decodedComment;
    document.getElementById('commentModal').style.display = 'block';
}

// Cerrar modal de comentario
function cerrarComentarioModal() {
    document.getElementById('commentModal').style.display = 'none';
}

// Mostrar error
function showError(message) {
    document.getElementById('surveysContainer').innerHTML = `
        <div class="error-state">
            <div class="error-icon">❌</div>
            <h3>${message}</h3>
            <button onclick="window.history.back()" class="btn btn-primary">Volver</button>
        </div>
    `;
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('commentModal');
    if (event.target === modal) {
        cerrarComentarioModal();
    }
};

// Configurar logout con confirmación
document.getElementById('logoutBtn').addEventListener('click', async function (e) {
    e.preventDefault();

    const confirmed = await showCustomConfirm(
        "¿Estás segura de cerrar sesión?",
        "Serás redirigida a la página principal."
    );

    if (confirmed && typeof logout === 'function') {
        logout();
    }
});

// Función para confirmaciones personalizadas con estilo
function showCustomConfirm(title, message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 9998;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 12px;
            width: 90%;
            max-width: 450px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

        modalContent.innerHTML = `
            <h3 style="color: #e63946; margin-bottom: 15px;">⚠️ ${title}</h3>
            <p style="margin-bottom: 20px; line-height: 1.5; color: #555;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="cancelBtn" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">Cancelar</button>
                <button id="confirmBtn" style="
                    background: #e63946;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">Cerrar Sesión</button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        modalContent.querySelector('#cancelBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(false);
        });

        modalContent.querySelector('#confirmBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(true);
        });
    });
}

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    // Obtener alias de la URL
    const urlParams = new URLSearchParams(window.location.search);
    currentAlias = urlParams.get('alias');
    
    if (!currentAlias) {
        showError('No se especificó el paciente');
        return;
    }
    
    // Cargar datos del paciente
    cargarDatosPaciente(currentAlias);
    cargarHistorialPaciente(currentAlias);
    
    // Configurar botón de volver
    document.getElementById('backBtn').addEventListener('click', function(e) {
        e.preventDefault();
        window.history.back();
    });
});