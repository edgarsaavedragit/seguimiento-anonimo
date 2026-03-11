// Función para cargar seudónimos REALES con botones de eliminar
async function cargarSeudonimosReales() {
    const container = document.getElementById('loadedPseudonyms');
    if (!container) {
        console.error('No se encontró el contenedor #loadedPseudonyms');
        return;
    }

    container.innerHTML = '<div class="loading">🔄 Cargando seudónimos del servidor...</div>';

    // Eliminar la sección de estadísticas existente
    const existingStats = document.querySelector('.stats-section');
    if (existingStats) {
        existingStats.remove();
    }

    try {
        console.log('Iniciando carga de seudónimos reales...');

        // Usar la función que agregamos al api.js
        let seudonimos = [];
        if (typeof getAllPseudonyms === 'function') {
            seudonimos = await getAllPseudonyms();
            console.log('Seudónimos obtenidos:', seudonimos);
        } else {
            console.warn('getAllPseudonyms no está definido, usando datos de muestra');
            seudonimos = [
                { id: 1, alias: 'Río', disponible: true },
                { id: 2, alias: 'Montaña', disponible: true }
            ];
        }

        if (!seudonimos || seudonimos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">☁️</div>
                    <h3>No hay seudónimos cargados</h3>
                    <p>Agrega seudónimos usando el formulario arriba.</p>
                </div>
            `;
            return;
        }

        // Mostrar los seudónimos REALES con botón de eliminar
        container.innerHTML = seudonimos.map(seudonimo => `
            <div class="pseudonym-card ${seudonimo.disponible ? 'disponible' : 'ocupado'}" data-id="${seudonimo.id}">
                <button class="delete-pseudonym-btn" onclick="eliminarSeudonimoIndividual(${seudonimo.id}, '${seudonimo.alias}')" 
                        title="Eliminar este seudónimo">
                    ♻️
                </button>
                <div class="pseudonym-icon">
                    <img src="/assets/icons/seudonimo.svg" alt="seudonimo" class="nav-icon">
                </div>
                <div class="pseudonym-name">${seudonimo.alias}</div>
                <small class="pseudonym-status">
                    ${seudonimo.disponible ? '✅ Disponible' : '❌ Ocupado'}
                </small>
            </div>
        `).join('');

        // ====== SACAR LAS ESTADÍSTICAS FUERA DEL CONTENEDOR ======
        // Crear un nuevo div para estadísticas FUERA de la sección
        const statsSection = document.createElement('div');
        statsSection.className = 'section stats-section';
        statsSection.style.cssText = 'margin-top: 30px;';

        const disponibles = seudonimos.filter(s => s.disponible).length;
        const ocupados = seudonimos.filter(s => !s.disponible).length;

        statsSection.innerHTML = `
            <h2>Estadísticas y Acciones</h2>
            <div class="stats-actions-container">
                <div class="stats-column">
                    <h3>📊 Estadísticas de seudónimos</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number">${seudonimos.length}</div>
                            <div class="stat-label">Total</div>
                        </div>
                        <div class="stat-item available">
                            <div class="stat-number">${disponibles}</div>
                            <div class="stat-label">✅ Disponibles</div>
                        </div>
                        <div class="stat-item occupied">
                            <div class="stat-number">${ocupados}</div>
                            <div class="stat-label">❌ Ocupados</div>
                        </div>
                    </div>
                </div>
                
                <div class="actions-column">
                    <button id="deleteAllPseudonymsBtn" class="btn btn-danger">
                        ♻️ Eliminar TODOS los seudónimos Disponibles
                    </button>
                    <small class="action-hint">
                        Solo se eliminarán los seudónimos disponibles
                    </small>
                </div>
            </div>
        `;

        // Insertar después de la sección de seudónimos
        container.parentNode.insertBefore(statsSection, container.nextSibling);

        // Deshabilitar botón si no hay seudónimos disponibles
        const deleteAllBtn = document.getElementById('deleteAllPseudonymsBtn');
        if (deleteAllBtn) {
            if (disponibles === 0) {
                deleteAllBtn.disabled = true;
                deleteAllBtn.innerHTML = '♻️ No hay seudónimos para eliminar';
                deleteAllBtn.style.opacity = '0.6';
                deleteAllBtn.style.cursor = 'not-allowed';
            } else {
                deleteAllBtn.disabled = false;
                deleteAllBtn.innerHTML = '♻️ Eliminar TODOS los seudónimos Disponibles';
                deleteAllBtn.style.opacity = '1';
                deleteAllBtn.style.cursor = 'pointer';

                // Evento para eliminar TODOS los seudónimos
                deleteAllBtn.addEventListener('click', async function () {
                    await eliminarTodosSeudonimos();
                });
            }
        }

    } catch (error) {
        console.error('Error cargando seudónimos:', error);
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Error al conectar con el servidor</h3>
                <p>${error.message}</p>
                <button onclick="cargarSeudonimosReales()" class="btn btn-sm btn-secondary">
                    🔄 Reintentar
                </button>
            </div>
        `;
    }
}

// Función para eliminar un seudónimo individual
async function eliminarSeudonimoIndividual(id, alias) {
    try {
        console.log(`Intentando eliminar seudónimo: ${alias} (ID: ${id})`);

        const confirmed = await showCustomConfirm(
            `¿Estás segura de eliminar el seudónimo "${alias}"?`,
            "Esta acción eliminará permanentemente de la base de datos.",
            'delete'
        );
        if (!confirmed) return;

        // Intentar eliminar directamente
        const response = await fetch(`${API_BASE_URL}/api/admin/seudonimos/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });

        if (response.ok) {
            // Crear alerta con diseño específico
            const successAlert = document.createElement('div');
            successAlert.textContent = `✅ Seudónimo "${alias}" eliminado`;
            successAlert.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2a9d8f;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 9999;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease;
            `;

            document.body.appendChild(successAlert);

            // Remover después de 3 segundos
            setTimeout(() => {
                successAlert.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (successAlert.parentNode) {
                        document.body.removeChild(successAlert);
                    }
                }, 300);
            }, 3000);

            await cargarSeudonimosReales(); // Recargar la lista
        } else {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

    } catch (error) {
        console.error('Error eliminando seudónimo:', error);

        // Si falla, intentar con otro endpoint
        try {
            const altResponse = await fetch(`${API_BASE_URL}/api/seudonimos/${id}`, {
                method: 'DELETE',
                headers: getHeaders(true)
            });

            if (altResponse.ok) {
                alert(`✅ Seudónimo "${alias}" eliminado`);
                await cargarSeudonimosReales();
            } else {
                showNotification(`❌ No se pudo eliminar "${alias}" ya que está en uso.`, 'error');
            }
        } catch (altError) {
            alert(`❌ Error grave: No se pudo eliminar "${alias}"\nContacta al desarrollador del backend.`);
        }
    }
}

// Función para eliminar TODOS los seudónimos
async function eliminarTodosSeudonimos() {
    try {
        const confirmed = await showCustomConfirm(
            "¿Estás segura de eliminar TODOS los seudónimos disponibles?",
            "Esta acción eliminará permanentemente todos los seudónimos DISPONIBLES de la base de datos. Los seudónimos ocupados no se eliminarán.",
            'delete'
        );
        if (!confirmed) return;

        console.log('Iniciando eliminación de TODOS los seudónimos');

        // Usar la nueva función si existe
        if (typeof deleteAllPseudonyms === 'function') {
            const resultado = await deleteAllPseudonyms();

            if (resultado.success) {
                // Mostrar mensaje con estilo específico
                const successAlert = document.createElement('div');
                successAlert.textContent = "✅ Todos los seudónimos disponibles han sido eliminados";
                successAlert.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #2a9d8f;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    z-index: 9999;
                    font-weight: bold;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    animation: slideIn 0.3s ease;
                `;

                document.body.appendChild(successAlert);

                // Remover después de 3 segundos
                setTimeout(() => {
                    successAlert.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => {
                        if (successAlert.parentNode) {
                            document.body.removeChild(successAlert);
                        }
                    }, 300);
                }, 3000);

                await cargarSeudonimosReales();
            } else if (!resultado.cancelled) {
                throw new Error(resultado.message || 'Error al eliminar');
            }
        } else {
            // Si no existe la función, intentar directamente
            const response = await fetch(`${API_BASE_URL}/api/admin/seudonimos/eliminar-todos`, {
                method: 'DELETE',
                headers: getHeaders(true)
            });

            if (response.ok) {
                // Mostrar mensaje con estilo específico
                const successAlert = document.createElement('div');
                successAlert.textContent = "✅ Todos los seudónimos disponibles han sido eliminados";
                successAlert.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #2a9d8f;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    z-index: 9999;
                    font-weight: bold;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    animation: slideIn 0.3s ease;
                `;

                document.body.appendChild(successAlert);

                // Remover después de 3 segundos
                setTimeout(() => {
                    successAlert.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => {
                        if (successAlert.parentNode) {
                            document.body.removeChild(successAlert);
                        }
                    }, 300);
                }, 3000);

                await cargarSeudonimosReales();
            } else {
                throw new Error('No se pudo eliminar todos los seudónimos');
            }
        }

    } catch (error) {
        console.error('Error eliminando todos los seudónimos:', error);
        showNotification(`❌ Error al eliminar seudónimos`, 'error');
    }
}

// Función para agregar nuevos seudónimos
async function agregarSeudonimos() {
    const textarea = document.getElementById('pseudonyms');
    if (!textarea) {
        alert('No se encontró el campo de texto');
        return;
    }

    const pseudonymsText = textarea.value.trim();

    if (!pseudonymsText) {
        alert('Por favor ingresa algunos seudónimos');
        return;
    }

    const seudonimos = pseudonymsText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    if (seudonimos.length === 0) {
        alert('Por favor ingresa seudónimos válidos separados por comas');
        return;
    }

    try {
        if (window.adminAPI && typeof adminAPI.loadPseudonyms === 'function') {
            const resultado = await adminAPI.loadPseudonyms(seudonimos);

            // Verificar si el resultado contiene error de duplicado
            if (resultado && resultado.error) {
                let mensaje = resultado.message || "Error al agregar seudónimos";

                if (resultado.duplicateError) {
                    // Si el backend devuelve un mensaje específico, usarlo
                    if (mensaje.includes("Se encontraron duplicados")) {
                        // Ya viene formateado del backend
                        showNotification(mensaje, 'error');
                    } else {
                        // Error genérico de BD (UNIQUE constraint)
                        showNotification("❌ Se encontraron duplicados en la base de datos", 'error');
                    }
                } else {
                    showNotification(`❌ ${mensaje}`, 'error');
                }

                await cargarSeudonimosReales();
                return;
            }

            // Éxito normal
            textarea.value = '';
            await cargarSeudonimosReales();

            let mensaje = `✅ ${seudonimos.length} seudónimo(s) agregado(s) correctamente`;
            if (resultado && resultado.message) {
                mensaje += `\n${resultado.message}`;
            }
            showNotification(mensaje, 'success');

        } else {
            throw new Error('No se pudo acceder a la función de carga de seudónimos');
        }

    } catch (error) {
        console.error('Error:', error);

        // Intentar extraer mensaje más específico
        let errorMsg = error.message;

        // Si el error contiene el JSON de respuesta
        if (errorMsg.includes('{') && errorMsg.includes('}')) {
            try {
                const errorObj = JSON.parse(errorMsg.substring(
                    errorMsg.indexOf('{'),
                    errorMsg.lastIndexOf('}') + 1
                ));
                if (errorObj.message) {
                    errorMsg = errorObj.message;
                }
            } catch (e) {
                // Si no se puede parsear, usar el mensaje original
            }
        }

        showNotification(`❌ Error al agregar seudónimos`, 'error');
    }
}

// Helper para headers
function getHeaders(requiresAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (requiresAuth) {
        const auth = btoa('sofi:secure123');
        headers['Authorization'] = `Basic ${auth}`;
    }
    return headers;
}

// Función para mostrar notificaciones con estilo profesional
function showNotification(message, type = 'success') {
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
        max-width: 400px;
    `;

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para confirmaciones personalizadas con estilo
function showCustomConfirm(title, message, actionType = 'eliminar') {
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

        // Determinar el texto del botón basado en actionType
        const buttonText = actionType === 'logout' ? 'Cerrar Sesión' :
            actionType === 'delete' ? 'Eliminar' :
                'Confirmar';

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
                ">${buttonText}</button>
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

// Configurar logout con confirmación
document.getElementById('logoutBtn').addEventListener('click', async function (e) {
    e.preventDefault();

    const confirmed = await showCustomConfirm(
        "¿Estás segura de cerrar sesión?",
        "Serás redirigida a la página principal.",
        'logout'
    );

    if (confirmed && typeof logout === 'function') {
        logout();
    }
});

// Cargar seudónimos REALES del backend
document.addEventListener('DOMContentLoaded', async function () {
    console.log('load-names.html cargado');
    await cargarSeudonimosReales();

    // Configurar el formulario
    const form = document.getElementById('loadNamesForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            await agregarSeudonimos();
        });
    }
});