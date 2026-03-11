// Función para copiar enlace de invitación
function copyInvitationLink() {
    const linkInput = document.getElementById('invitationLink');
    linkInput.select();
    document.execCommand('copy');

    // Mostrar mensaje de confirmación
    const originalText = event.currentTarget.textContent;
    event.target.textContent = '✓ Copiado!';
    event.target.classList.add('btn-success');

    setTimeout(() => {
        event.target.textContent = originalText;
        event.target.classList.remove('btn-success');
    }, 2000);
}

// Función para compartir por WhatsApp
function shareViaWhatsApp() {
    const link = document.getElementById('invitationLink').value;
    const message = `Hola, este es tu enlace único para acceder al sistema de seguimiento psicológico: ${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Función para enviar por email
function sendEmail() {
    const link = document.getElementById('invitationLink').value;
    const subject = 'Enlace para Sistema de Seguimiento Psicológico';
    const body = `Hola,\n\nEste es tu enlace único para acceder al sistema de seguimiento psicológico:\n${link}\n\nSaludos.`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
}

// Función para cargar pacientes recientes
async function loadRecentPatients() {
    const container = document.getElementById('recentPatients');
    if (!container) return;

    try {
        // Verificar si la función existe
        if (typeof adminAPI !== 'undefined' && adminAPI.getRecentPatients) {
            const pacientes = await adminAPI.getRecentPatients();

            if (!pacientes || pacientes.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">👥</div>
                        <h4>No hay pacientes registrados</h4>
                        <p>Registra tu primer paciente usando el formulario arriba.</p>
                    </div>
                `;
                return;
            }

            // Renderizar pacientes
            container.innerHTML = pacientes.map(paciente => `
                <div class="patient-item" data-id="${paciente.id}">
                    <div class="patient-info">
                        <h4>${paciente.nombreCompleto || 'Sin nombre'}</h4>
                        <p>${paciente.email || 'Sin email'} • ${paciente.celular || 'Sin celular'}</p>
                        ${paciente.seudonimo ? `<small style="display:block;color:#fff;">Seudónimo: ${paciente.seudonimo.alias}</small>` : ''}
                        <!-- AGREGAR ESTA LÍNEA PARA EL LINK -->
                        <small style="display:block;margin-top:5px;">
                            <a href="#" onclick="copyPatientLink('${paciente.tokenInvitacion}', event)" 
                               style="color:#4a6fa5;text-decoration:none;">
                               🔗 Copiar enlace de invitación
                            </a>
                        </small>
                    </div>
                    <div class="patient-actions">
                        <span class="status-badge ${paciente.seudonimo ? 'success' : 'warning'}">
                            ${paciente.seudonimo ? 'Activo' : 'Pendiente'}
                        </span>
                        <button class="btn-delete-patient" onclick="deletePatient(${paciente.id}, '${paciente.nombreCompleto || 'este paciente'}', event)" 
                                title="Eliminar paciente">
                            ♻️
                        </button>
                    </div>
                </div>
            `).join('');

        } else {
            // Fallback si no existe la función
            throw new Error('Función getRecentPatients no disponible');
        }

    } catch (error) {
        console.error('Error cargando pacientes:', error);
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h4>Error al cargar pacientes</h4>
                <p>${error.message}</p>
                <button onclick="loadRecentPatients()" class="btn btn-sm btn-secondary">
                    🔄 Reintentar
                </button>
            </div>
        `;
    }
}

// Función para copiar enlace de paciente
function copyPatientLink(token, event) {
    event.preventDefault();

    const link = `http://127.0.0.1:3000/pages/patient/choose-identity.html?token=${token}`;

    // Copiar al portapapeles
    navigator.clipboard.writeText(link).then(() => {
        // Mostrar mensaje de éxito
        const message = document.createElement('div');
        message.textContent = '✅ Enlace copiado al portapapeles';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2a9d8f;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 9999;
            font-weight: bold;
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            document.body.removeChild(message);
        }, 3000);

    }).catch(err => {
        alert('Error al copiar: ' + err);
    });
}

// Función para eliminar paciente - CON ESTILO MEJORADO
async function deletePatient(patientId, patientName, event) {
    // Crear mensaje personalizado
    let messageText = `¿Estás segura de eliminar a "${patientName}"?\n\n`;
    if (patientName.includes('Temporal')) {
        messageText += '⚠️ Solo eliminará el registro temporal';
    } else {
        messageText += 'Esta acción:\n1. Eliminará el registro del paciente\n2. Liberará el seudónimo si tiene uno asignado\n\n';
    }
    messageText += 'Esta acción NO se puede deshacer.';

    // Crear modal de confirmación estilo personalizado
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
        <h3 style="color: #e63946; margin-bottom: 15px;">⚠️ Confirmar Eliminación</h3>
        <p style="margin-bottom: 20px; line-height: 1.5;">${messageText.replace(/\n/g, '<br>')}</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="cancelDelete" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
            ">Cancelar</button>
            <button id="confirmDelete" style="
                background: #e63946;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
            ">Eliminar</button>
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Esperar confirmación
    return new Promise((resolve) => {
        modalContent.querySelector('#cancelDelete').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(false);
        });

        modalContent.querySelector('#confirmDelete').addEventListener('click', async () => {
            document.body.removeChild(modal);

            try {
                // Mostrar loading en el botón original
                const deleteBtn = event.target;
                const originalHTML = deleteBtn.innerHTML;
                deleteBtn.innerHTML = '⏳';
                deleteBtn.disabled = true;

                // Llamar a la API
                const result = await adminAPI.deletePatient(patientId);

                if (result.success) {
                    // Mostrar mensaje de éxito CON ESTILO
                    const successMsg = document.createElement('div');
                    successMsg.textContent = `✅ Paciente "${patientName}" eliminado correctamente`;
                    successMsg.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #2a9d8f;
                        color: white;
                        padding: 15px 20px;
                        border-radius: 8px;
                        z-index: 9999;
                        font-weight: bold;
                        box-shadow: 0 4px 12px rgba(42, 157, 143, 0.3);
                    `;

                    document.body.appendChild(successMsg);

                    // Remover el elemento de la lista con animación
                    const patientItem = document.querySelector(`.patient-item[data-id="${patientId}"]`);
                    if (patientItem) {
                        patientItem.style.animation = 'fadeOut 0.3s ease';
                        setTimeout(() => {
                            patientItem.remove();
                        }, 300);
                    }

                    setTimeout(() => {
                        document.body.removeChild(successMsg);
                    }, 3000);

                    // Recargar la lista después de 1 segundo
                    setTimeout(loadRecentPatients, 1000);

                } else {
                    throw new Error(result.error || 'Error al eliminar paciente');
                }

            } catch (error) {
                console.error('Error eliminando paciente:', error);

                // Mostrar mensaje de error CON ESTILO
                const errorMsg = document.createElement('div');
                errorMsg.textContent = `❌ Error: ${error.message}`;
                errorMsg.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #e63946;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    z-index: 9999;
                    font-weight: bold;
                    box-shadow: 0 4px 12px rgba(230, 57, 70, 0.3);
                `;

                document.body.appendChild(errorMsg);

                setTimeout(() => {
                    document.body.removeChild(errorMsg);
                }, 4000);

                // Restaurar botón
                if (event.target) {
                    event.target.innerHTML = '♻️';
                    event.target.disabled = false;
                }
            }

            resolve(true);
        });
    });
}

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

// Función para mostrar notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2a9d8f' : '#e63946'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Función para formatear fecha
function formatDate(date) {
    const d = new Date(date);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (d.toDateString() === hoy.toDateString()) {
        return 'Hoy, ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (d.toDateString() === ayer.toDateString()) {
        return 'Ayer, ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
        return d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Cargar pacientes cuando se cargue la página
document.addEventListener('DOMContentLoaded', function () {
    loadRecentPatients();

    // También recargar después de registrar un paciente
    const form = document.getElementById('registerPatientForm');
    if (form) {
        form.addEventListener('submit', function () {
            // Recargar después de 2 segundos (tiempo para que se guarde)
            setTimeout(loadRecentPatients, 2000);
        });
    }
});

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